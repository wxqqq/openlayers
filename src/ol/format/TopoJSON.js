/**
 * @module ol/format/TopoJSON
 */
import {inherits} from '../index.js';
import _ol_Feature_ from '../Feature.js';
import {transformWithOptions} from '../format/Feature.js';
import JSONFeature from '../format/JSONFeature.js';
import LineString from '../geom/LineString.js';
import MultiLineString from '../geom/MultiLineString.js';
import MultiPoint from '../geom/MultiPoint.js';
import MultiPolygon from '../geom/MultiPolygon.js';
import Point from '../geom/Point.js';
import Polygon from '../geom/Polygon.js';
import {get as getProjection} from '../proj.js';

/**
 * @classdesc
 * Feature format for reading data in the TopoJSON format.
 *
 * @constructor
 * @extends {ol.format.JSONFeature}
 * @param {olx.format.TopoJSONOptions=} opt_options Options.
 * @api
 */
var TopoJSON = function(opt_options) {

  var options = opt_options ? opt_options : {};

  JSONFeature.call(this);

  /**
   * @private
   * @type {string|undefined}
   */
  this.layerName_ = options.layerName;

  /**
   * @private
   * @type {Array.<string>}
   */
  this.layers_ = options.layers ? options.layers : null;

  /**
   * @inheritDoc
   */
  this.defaultDataProjection = getProjection(
      options.defaultDataProjection ?
        options.defaultDataProjection : 'EPSG:4326');

};

inherits(TopoJSON, JSONFeature);


/**
 * @const
 * @type {Object.<string, function(TopoJSONGeometry, Array, ...Array): ol.geom.Geometry>}
 */
var GEOMETRY_READERS = {
  'Point': readPointGeometry,
  'LineString': readLineStringGeometry,
  'Polygon': readPolygonGeometry,
  'MultiPoint': readMultiPointGeometry,
  'MultiLineString': readMultiLineStringGeometry,
  'MultiPolygon': readMultiPolygonGeometry
};


/**
 * Concatenate arcs into a coordinate array.
 * @param {Array.<number>} indices Indices of arcs to concatenate.  Negative
 *     values indicate arcs need to be reversed.
 * @param {Array.<Array.<ol.Coordinate>>} arcs Array of arcs (already
 *     transformed).
 * @return {Array.<ol.Coordinate>} Coordinates array.
 */
function concatenateArcs(indices, arcs) {
  /** @type {Array.<ol.Coordinate>} */
  var coordinates = [];
  var index, arc;
  var i, ii;
  var j, jj;
  for (i = 0, ii = indices.length; i < ii; ++i) {
    index = indices[i];
    if (i > 0) {
      // splicing together arcs, discard last point
      coordinates.pop();
    }
    if (index >= 0) {
      // forward arc
      arc = arcs[index];
    } else {
      // reverse arc
      arc = arcs[~index].slice().reverse();
    }
    coordinates.push.apply(coordinates, arc);
  }
  // provide fresh copies of coordinate arrays
  for (j = 0, jj = coordinates.length; j < jj; ++j) {
    coordinates[j] = coordinates[j].slice();
  }
  return coordinates;
}


/**
 * Create a point from a TopoJSON geometry object.
 *
 * @param {TopoJSONGeometry} object TopoJSON object.
 * @param {Array.<number>} scale Scale for each dimension.
 * @param {Array.<number>} translate Translation for each dimension.
 * @return {ol.geom.Point} Geometry.
 */
function readPointGeometry(object, scale, translate) {
  var coordinates = object.coordinates;
  if (scale && translate) {
    transformVertex(coordinates, scale, translate);
  }
  return new Point(coordinates);
}


/**
 * Create a multi-point from a TopoJSON geometry object.
 *
 * @param {TopoJSONGeometry} object TopoJSON object.
 * @param {Array.<number>} scale Scale for each dimension.
 * @param {Array.<number>} translate Translation for each dimension.
 * @return {ol.geom.MultiPoint} Geometry.
 */
function readMultiPointGeometry(object, scale, translate) {
  var coordinates = object.coordinates;
  var i, ii;
  if (scale && translate) {
    for (i = 0, ii = coordinates.length; i < ii; ++i) {
      transformVertex(coordinates[i], scale, translate);
    }
  }
  return new MultiPoint(coordinates);
}


/**
 * Create a linestring from a TopoJSON geometry object.
 *
 * @param {TopoJSONGeometry} object TopoJSON object.
 * @param {Array.<Array.<ol.Coordinate>>} arcs Array of arcs.
 * @return {ol.geom.LineString} Geometry.
 */
function readLineStringGeometry(object, arcs) {
  var coordinates = concatenateArcs(object.arcs, arcs);
  return new LineString(coordinates);
}


/**
 * Create a multi-linestring from a TopoJSON geometry object.
 *
 * @param {TopoJSONGeometry} object TopoJSON object.
 * @param {Array.<Array.<ol.Coordinate>>} arcs Array of arcs.
 * @return {ol.geom.MultiLineString} Geometry.
 */
function readMultiLineStringGeometry(object, arcs) {
  var coordinates = [];
  var i, ii;
  for (i = 0, ii = object.arcs.length; i < ii; ++i) {
    coordinates[i] = concatenateArcs(object.arcs[i], arcs);
  }
  return new MultiLineString(coordinates);
}


/**
 * Create a polygon from a TopoJSON geometry object.
 *
 * @param {TopoJSONGeometry} object TopoJSON object.
 * @param {Array.<Array.<ol.Coordinate>>} arcs Array of arcs.
 * @return {ol.geom.Polygon} Geometry.
 */
function readPolygonGeometry(object, arcs) {
  var coordinates = [];
  var i, ii;
  for (i = 0, ii = object.arcs.length; i < ii; ++i) {
    coordinates[i] = concatenateArcs(object.arcs[i], arcs);
  }
  return new Polygon(coordinates);
}


/**
 * Create a multi-polygon from a TopoJSON geometry object.
 *
 * @param {TopoJSONGeometry} object TopoJSON object.
 * @param {Array.<Array.<ol.Coordinate>>} arcs Array of arcs.
 * @return {ol.geom.MultiPolygon} Geometry.
 */
function readMultiPolygonGeometry(object, arcs) {
  var coordinates = [];
  var polyArray, ringCoords, j, jj;
  var i, ii;
  for (i = 0, ii = object.arcs.length; i < ii; ++i) {
    // for each polygon
    polyArray = object.arcs[i];
    ringCoords = [];
    for (j = 0, jj = polyArray.length; j < jj; ++j) {
      // for each ring
      ringCoords[j] = concatenateArcs(polyArray[j], arcs);
    }
    coordinates[i] = ringCoords;
  }
  return new MultiPolygon(coordinates);
}


/**
 * Create features from a TopoJSON GeometryCollection object.
 *
 * @param {TopoJSONGeometryCollection} collection TopoJSON Geometry
 *     object.
 * @param {Array.<Array.<ol.Coordinate>>} arcs Array of arcs.
 * @param {Array.<number>} scale Scale for each dimension.
 * @param {Array.<number>} translate Translation for each dimension.
 * @param {string|undefined} property Property to set the `GeometryCollection`'s parent
 *     object to.
 * @param {string} name Name of the `Topology`'s child object.
 * @param {olx.format.ReadOptions=} opt_options Read options.
 * @return {Array.<ol.Feature>} Array of features.
 */
function readFeaturesFromGeometryCollection(collection, arcs, scale, translate, property, name, opt_options) {
  var geometries = collection.geometries;
  var features = [];
  var i, ii;
  for (i = 0, ii = geometries.length; i < ii; ++i) {
    features[i] = readFeatureFromGeometry(
        geometries[i], arcs, scale, translate, property, name, opt_options);
  }
  return features;
}


/**
 * Create a feature from a TopoJSON geometry object.
 *
 * @param {TopoJSONGeometry} object TopoJSON geometry object.
 * @param {Array.<Array.<ol.Coordinate>>} arcs Array of arcs.
 * @param {Array.<number>} scale Scale for each dimension.
 * @param {Array.<number>} translate Translation for each dimension.
 * @param {string|undefined} property Property to set the `GeometryCollection`'s parent
 *     object to.
 * @param {string} name Name of the `Topology`'s child object.
 * @param {olx.format.ReadOptions=} opt_options Read options.
 * @return {ol.Feature} Feature.
 */
function readFeatureFromGeometry(object, arcs, scale, translate, property, name, opt_options) {
  var geometry;
  var type = object.type;
  var geometryReader = GEOMETRY_READERS[type];
  if ((type === 'Point') || (type === 'MultiPoint')) {
    geometry = geometryReader(object, scale, translate);
  } else {
    geometry = geometryReader(object, arcs);
  }
  var feature = new _ol_Feature_();
  feature.setGeometry(/** @type {ol.geom.Geometry} */ (
    transformWithOptions(geometry, false, opt_options)));
  if (object.id !== undefined) {
    feature.setId(object.id);
  }
  var properties = object.properties;
  if (property) {
    if (!properties) {
      properties = {};
    }
    properties[property] = name;
  }
  if (properties) {
    feature.setProperties(properties);
  }
  return feature;
}


/**
 * Read all features from a TopoJSON source.
 *
 * @function
 * @param {Document|Node|Object|string} source Source.
 * @return {Array.<ol.Feature>} Features.
 * @api
 */
TopoJSON.prototype.readFeatures;


/**
 * @inheritDoc
 */
TopoJSON.prototype.readFeaturesFromObject = function(
    object, opt_options) {
  if (object.type == 'Topology') {
    var topoJSONTopology = /** @type {TopoJSONTopology} */ (object);
    var transform, scale = null, translate = null;
    if (topoJSONTopology.transform) {
      transform = topoJSONTopology.transform;
      scale = transform.scale;
      translate = transform.translate;
    }
    var arcs = topoJSONTopology.arcs;
    if (transform) {
      transformArcs(arcs, scale, translate);
    }
    /** @type {Array.<ol.Feature>} */
    var features = [];
    var topoJSONFeatures = topoJSONTopology.objects;
    var property = this.layerName_;
    var objectName, feature;
    for (objectName in topoJSONFeatures) {
      if (this.layers_ && this.layers_.indexOf(objectName) == -1) {
        continue;
      }
      if (topoJSONFeatures[objectName].type === 'GeometryCollection') {
        feature = /** @type {TopoJSONGeometryCollection} */ (topoJSONFeatures[objectName]);
        features.push.apply(features, readFeaturesFromGeometryCollection(
            feature, arcs, scale, translate, property, objectName, opt_options));
      } else {
        feature = /** @type {TopoJSONGeometry} */ (topoJSONFeatures[objectName]);
        features.push(readFeatureFromGeometry(
            feature, arcs, scale, translate, property, objectName, opt_options));
      }
    }
    return features;
  } else {
    return [];
  }
};


/**
 * Apply a linear transform to array of arcs.  The provided array of arcs is
 * modified in place.
 *
 * @param {Array.<Array.<ol.Coordinate>>} arcs Array of arcs.
 * @param {Array.<number>} scale Scale for each dimension.
 * @param {Array.<number>} translate Translation for each dimension.
 */
function transformArcs(arcs, scale, translate) {
  var i, ii;
  for (i = 0, ii = arcs.length; i < ii; ++i) {
    transformArc(arcs[i], scale, translate);
  }
}


/**
 * Apply a linear transform to an arc.  The provided arc is modified in place.
 *
 * @param {Array.<ol.Coordinate>} arc Arc.
 * @param {Array.<number>} scale Scale for each dimension.
 * @param {Array.<number>} translate Translation for each dimension.
 */
function transformArc(arc, scale, translate) {
  var x = 0;
  var y = 0;
  var vertex;
  var i, ii;
  for (i = 0, ii = arc.length; i < ii; ++i) {
    vertex = arc[i];
    x += vertex[0];
    y += vertex[1];
    vertex[0] = x;
    vertex[1] = y;
    transformVertex(vertex, scale, translate);
  }
}


/**
 * Apply a linear transform to a vertex.  The provided vertex is modified in
 * place.
 *
 * @param {ol.Coordinate} vertex Vertex.
 * @param {Array.<number>} scale Scale for each dimension.
 * @param {Array.<number>} translate Translation for each dimension.
 */
function transformVertex(vertex, scale, translate) {
  vertex[0] = vertex[0] * scale[0] + translate[0];
  vertex[1] = vertex[1] * scale[1] + translate[1];
}


/**
 * Read the projection from a TopoJSON source.
 *
 * @param {Document|Node|Object|string} object Source.
 * @return {ol.proj.Projection} Projection.
 * @override
 * @api
 */
TopoJSON.prototype.readProjection;


/**
 * @inheritDoc
 */
TopoJSON.prototype.readProjectionFromObject = function(object) {
  return this.defaultDataProjection;
};


/**
 * Not implemented.
 * @inheritDoc
 */
TopoJSON.prototype.writeFeatureObject = function(feature, opt_options) {};


/**
 * Not implemented.
 * @inheritDoc
 */
TopoJSON.prototype.writeFeaturesObject = function(features, opt_options) {};


/**
 * Not implemented.
 * @inheritDoc
 */
TopoJSON.prototype.writeGeometryObject = function(geometry, opt_options) {};


/**
 * Not implemented.
 * @override
 */
TopoJSON.prototype.readGeometryFromObject = function() {};


/**
 * Not implemented.
 * @override
 */
TopoJSON.prototype.readFeatureFromObject = function() {};
export default TopoJSON;
