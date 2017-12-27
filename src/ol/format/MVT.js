/**
 * @module ol/format/MVT
 */
//FIXME Implement projection handling

import {inherits} from '../index.js';
import {assert} from '../asserts.js';
import PBF from 'pbf';
import FeatureFormat, {transformWithOptions} from '../format/Feature.js';
import FormatType from '../format/FormatType.js';
import GeometryLayout from '../geom/GeometryLayout.js';
import GeometryType from '../geom/GeometryType.js';
import LineString from '../geom/LineString.js';
import MultiLineString from '../geom/MultiLineString.js';
import MultiPoint from '../geom/MultiPoint.js';
import MultiPolygon from '../geom/MultiPolygon.js';
import Point from '../geom/Point.js';
import Polygon from '../geom/Polygon.js';
import _ol_geom_flat_orient_ from '../geom/flat/orient.js';
import _ol_proj_Projection_ from '../proj/Projection.js';
import _ol_proj_Units_ from '../proj/Units.js';
import _ol_render_Feature_ from '../render/Feature.js';

/**
 * @classdesc
 * Feature format for reading data in the Mapbox MVT format.
 *
 * @constructor
 * @extends {ol.format.Feature}
 * @param {olx.format.MVTOptions=} opt_options Options.
 * @api
 */
var MVT = function(opt_options) {

  FeatureFormat.call(this);

  var options = opt_options ? opt_options : {};

  /**
   * @type {ol.proj.Projection}
   */
  this.defaultDataProjection = new _ol_proj_Projection_({
    code: '',
    units: _ol_proj_Units_.TILE_PIXELS
  });

  /**
   * @private
   * @type {function((ol.geom.Geometry|Object.<string,*>)=)|
   *     function(ol.geom.GeometryType,Array.<number>,
   *         (Array.<number>|Array.<Array.<number>>),Object.<string,*>,number)}
   */
  this.featureClass_ = options.featureClass ?
    options.featureClass : _ol_render_Feature_;

  /**
   * @private
   * @type {string|undefined}
   */
  this.geometryName_ = options.geometryName;

  /**
   * @private
   * @type {string}
   */
  this.layerName_ = options.layerName ? options.layerName : 'layer';

  /**
   * @private
   * @type {Array.<string>}
   */
  this.layers_ = options.layers ? options.layers : null;

  /**
   * @private
   * @type {ol.Extent}
   */
  this.extent_ = null;

};

inherits(MVT, FeatureFormat);


/**
 * Reader callbacks for parsing the PBF.
 * @type {Object.<string, function(number, Object, ol.ext.PBF)>}
 */
MVT.pbfReaders_ = {
  layers: function(tag, layers, pbf) {
    if (tag === 3) {
      var layer = {
        keys: [],
        values: [],
        features: []
      };
      var end = pbf.readVarint() + pbf.pos;
      pbf.readFields(MVT.pbfReaders_.layer, layer, end);
      layer.length = layer.features.length;
      if (layer.length) {
        layers[layer.name] = layer;
      }
    }
  },
  layer: function(tag, layer, pbf) {
    if (tag === 15) {
      layer.version = pbf.readVarint();
    } else if (tag === 1) {
      layer.name = pbf.readString();
    } else if (tag === 5) {
      layer.extent = pbf.readVarint();
    } else if (tag === 2) {
      layer.features.push(pbf.pos);
    } else if (tag === 3) {
      layer.keys.push(pbf.readString());
    } else if (tag === 4) {
      var value = null;
      var end = pbf.readVarint() + pbf.pos;
      while (pbf.pos < end) {
        tag = pbf.readVarint() >> 3;
        value = tag === 1 ? pbf.readString() :
          tag === 2 ? pbf.readFloat() :
            tag === 3 ? pbf.readDouble() :
              tag === 4 ? pbf.readVarint64() :
                tag === 5 ? pbf.readVarint() :
                  tag === 6 ? pbf.readSVarint() :
                    tag === 7 ? pbf.readBoolean() : null;
      }
      layer.values.push(value);
    }
  },
  feature: function(tag, feature, pbf) {
    if (tag == 1) {
      feature.id = pbf.readVarint();
    } else if (tag == 2) {
      var end = pbf.readVarint() + pbf.pos;
      while (pbf.pos < end) {
        var key = feature.layer.keys[pbf.readVarint()];
        var value = feature.layer.values[pbf.readVarint()];
        feature.properties[key] = value;
      }
    } else if (tag == 3) {
      feature.type = pbf.readVarint();
    } else if (tag == 4) {
      feature.geometry = pbf.pos;
    }
  }
};


/**
 * Read a raw feature from the pbf offset stored at index `i` in the raw layer.
 * @suppress {missingProperties}
 * @private
 * @param {ol.ext.PBF} pbf PBF.
 * @param {Object} layer Raw layer.
 * @param {number} i Index of the feature in the raw layer's `features` array.
 * @return {Object} Raw feature.
 */
MVT.readRawFeature_ = function(pbf, layer, i) {
  pbf.pos = layer.features[i];
  var end = pbf.readVarint() + pbf.pos;

  var feature = {
    layer: layer,
    type: 0,
    properties: {}
  };
  pbf.readFields(MVT.pbfReaders_.feature, feature, end);
  return feature;
};


/**
 * Read the raw geometry from the pbf offset stored in a raw feature's geometry
 * proeprty.
 * @suppress {missingProperties}
 * @private
 * @param {ol.ext.PBF} pbf PBF.
 * @param {Object} feature Raw feature.
 * @param {Array.<number>} flatCoordinates Array to store flat coordinates in.
 * @param {Array.<number>} ends Array to store ends in.
 */
MVT.readRawGeometry_ = function(pbf, feature, flatCoordinates, ends) {
  pbf.pos = feature.geometry;

  var end = pbf.readVarint() + pbf.pos;
  var cmd = 1;
  var length = 0;
  var x = 0;
  var y = 0;
  var coordsLen = 0;
  var currentEnd = 0;

  while (pbf.pos < end) {
    if (!length) {
      var cmdLen = pbf.readVarint();
      cmd = cmdLen & 0x7;
      length = cmdLen >> 3;
    }

    length--;

    if (cmd === 1 || cmd === 2) {
      x += pbf.readSVarint();
      y += pbf.readSVarint();

      if (cmd === 1) { // moveTo
        if (coordsLen > currentEnd) {
          ends.push(coordsLen);
          currentEnd = coordsLen;
        }
      }

      flatCoordinates.push(x, y);
      coordsLen += 2;

    } else if (cmd === 7) {

      if (coordsLen > currentEnd) {
        // close polygon
        flatCoordinates.push(
            flatCoordinates[currentEnd], flatCoordinates[currentEnd + 1]);
        coordsLen += 2;
      }

    } else {
      assert(false, 59); // Invalid command found in the PBF
    }
  }

  if (coordsLen > currentEnd) {
    ends.push(coordsLen);
    currentEnd = coordsLen;
  }

};


/**
 * @suppress {missingProperties}
 * @private
 * @param {number} type The raw feature's geometry type
 * @param {number} numEnds Number of ends of the flat coordinates of the
 * geometry.
 * @return {ol.geom.GeometryType} The geometry type.
 */
MVT.getGeometryType_ = function(type, numEnds) {
  /** @type {ol.geom.GeometryType} */
  var geometryType;
  if (type === 1) {
    geometryType = numEnds === 1 ?
      GeometryType.POINT : GeometryType.MULTI_POINT;
  } else if (type === 2) {
    geometryType = numEnds === 1 ?
      GeometryType.LINE_STRING :
      GeometryType.MULTI_LINE_STRING;
  } else if (type === 3) {
    geometryType = GeometryType.POLYGON;
    // MultiPolygon not relevant for rendering - winding order determines
    // outer rings of polygons.
  }
  return geometryType;
};

/**
 * @private
 * @param {ol.ext.PBF} pbf PBF
 * @param {Object} rawFeature Raw Mapbox feature.
 * @param {olx.format.ReadOptions=} opt_options Read options.
 * @return {ol.Feature|ol.render.Feature} Feature.
 */
MVT.prototype.createFeature_ = function(pbf, rawFeature, opt_options) {
  var type = rawFeature.type;
  if (type === 0) {
    return null;
  }

  var feature;
  var id = rawFeature.id;
  var values = rawFeature.properties;
  values[this.layerName_] = rawFeature.layer.name;

  var flatCoordinates = [];
  var ends = [];
  MVT.readRawGeometry_(pbf, rawFeature, flatCoordinates, ends);

  var geometryType = MVT.getGeometryType_(type, ends.length);

  if (this.featureClass_ === _ol_render_Feature_) {
    feature = new this.featureClass_(geometryType, flatCoordinates, ends, values, id);
  } else {
    var geom;
    if (geometryType == GeometryType.POLYGON) {
      var endss = [];
      var offset = 0;
      var prevEndIndex = 0;
      for (var i = 0, ii = ends.length; i < ii; ++i) {
        var end = ends[i];
        if (!_ol_geom_flat_orient_.linearRingIsClockwise(flatCoordinates, offset, end, 2)) {
          endss.push(ends.slice(prevEndIndex, i));
          prevEndIndex = i;
        }
        offset = end;
      }
      if (endss.length > 1) {
        ends = endss;
        geom = new MultiPolygon(null);
      } else {
        geom = new Polygon(null);
      }
    } else {
      geom = geometryType === GeometryType.POINT ? new Point(null) :
        geometryType === GeometryType.LINE_STRING ? new LineString(null) :
          geometryType === GeometryType.POLYGON ? new Polygon(null) :
            geometryType === GeometryType.MULTI_POINT ? new MultiPoint (null) :
              geometryType === GeometryType.MULTI_LINE_STRING ? new MultiLineString(null) :
                null;
    }
    geom.setFlatCoordinates(GeometryLayout.XY, flatCoordinates, ends);
    feature = new this.featureClass_();
    if (this.geometryName_) {
      feature.setGeometryName(this.geometryName_);
    }
    var geometry = transformWithOptions(geom, false, this.adaptOptions(opt_options));
    feature.setGeometry(geometry);
    feature.setId(id);
    feature.setProperties(values);
  }

  return feature;
};


/**
 * @inheritDoc
 * @api
 */
MVT.prototype.getLastExtent = function() {
  return this.extent_;
};


/**
 * @inheritDoc
 */
MVT.prototype.getType = function() {
  return FormatType.ARRAY_BUFFER;
};


/**
 * @inheritDoc
 * @api
 */
MVT.prototype.readFeatures = function(source, opt_options) {
  var layers = this.layers_;

  var pbf = new PBF(/** @type {ArrayBuffer} */ (source));
  var pbfLayers = pbf.readFields(MVT.pbfReaders_.layers, {});
  /** @type {Array.<ol.Feature|ol.render.Feature>} */
  var features = [];
  var pbfLayer;
  for (var name in pbfLayers) {
    if (layers && layers.indexOf(name) == -1) {
      continue;
    }
    pbfLayer = pbfLayers[name];

    var rawFeature;
    for (var i = 0, ii = pbfLayer.length; i < ii; ++i) {
      rawFeature = MVT.readRawFeature_(pbf, pbfLayer, i);
      features.push(this.createFeature_(pbf, rawFeature));
    }
    this.extent_ = pbfLayer ? [0, 0, pbfLayer.extent, pbfLayer.extent] : null;
  }

  return features;
};


/**
 * @inheritDoc
 * @api
 */
MVT.prototype.readProjection = function(source) {
  return this.defaultDataProjection;
};


/**
 * Sets the layers that features will be read from.
 * @param {Array.<string>} layers Layers.
 * @api
 */
MVT.prototype.setLayers = function(layers) {
  this.layers_ = layers;
};


/**
 * Not implemented.
 * @override
 */
MVT.prototype.readFeature = function() {};


/**
 * Not implemented.
 * @override
 */
MVT.prototype.readGeometry = function() {};


/**
 * Not implemented.
 * @override
 */
MVT.prototype.writeFeature = function() {};


/**
 * Not implemented.
 * @override
 */
MVT.prototype.writeGeometry = function() {};


/**
 * Not implemented.
 * @override
 */
MVT.prototype.writeFeatures = function() {};
export default MVT;
