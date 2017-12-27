/**
 * @module ol/geom/GeometryCollection
 */
import {inherits} from '../index.js';
import _ol_events_ from '../events.js';
import EventType from '../events/EventType.js';
import {createOrUpdateEmpty, closestSquaredDistanceXY, extend, getCenter} from '../extent.js';
import Geometry from '../geom/Geometry.js';
import GeometryType from '../geom/GeometryType.js';
import _ol_obj_ from '../obj.js';

/**
 * @classdesc
 * An array of {@link ol.geom.Geometry} objects.
 *
 * @constructor
 * @extends {ol.geom.Geometry}
 * @param {Array.<ol.geom.Geometry>=} opt_geometries Geometries.
 * @api
 */
var GeometryCollection = function(opt_geometries) {

  Geometry.call(this);

  /**
   * @private
   * @type {Array.<ol.geom.Geometry>}
   */
  this.geometries_ = opt_geometries ? opt_geometries : null;

  this.listenGeometriesChange_();
};

inherits(GeometryCollection, Geometry);


/**
 * @param {Array.<ol.geom.Geometry>} geometries Geometries.
 * @private
 * @return {Array.<ol.geom.Geometry>} Cloned geometries.
 */
GeometryCollection.cloneGeometries_ = function(geometries) {
  var clonedGeometries = [];
  var i, ii;
  for (i = 0, ii = geometries.length; i < ii; ++i) {
    clonedGeometries.push(geometries[i].clone());
  }
  return clonedGeometries;
};


/**
 * @private
 */
GeometryCollection.prototype.unlistenGeometriesChange_ = function() {
  var i, ii;
  if (!this.geometries_) {
    return;
  }
  for (i = 0, ii = this.geometries_.length; i < ii; ++i) {
    _ol_events_.unlisten(
        this.geometries_[i], EventType.CHANGE,
        this.changed, this);
  }
};


/**
 * @private
 */
GeometryCollection.prototype.listenGeometriesChange_ = function() {
  var i, ii;
  if (!this.geometries_) {
    return;
  }
  for (i = 0, ii = this.geometries_.length; i < ii; ++i) {
    _ol_events_.listen(
        this.geometries_[i], EventType.CHANGE,
        this.changed, this);
  }
};


/**
 * Make a complete copy of the geometry.
 * @return {!ol.geom.GeometryCollection} Clone.
 * @override
 * @api
 */
GeometryCollection.prototype.clone = function() {
  var geometryCollection = new GeometryCollection(null);
  geometryCollection.setGeometries(this.geometries_);
  return geometryCollection;
};


/**
 * @inheritDoc
 */
GeometryCollection.prototype.closestPointXY = function(x, y, closestPoint, minSquaredDistance) {
  if (minSquaredDistance < closestSquaredDistanceXY(this.getExtent(), x, y)) {
    return minSquaredDistance;
  }
  var geometries = this.geometries_;
  var i, ii;
  for (i = 0, ii = geometries.length; i < ii; ++i) {
    minSquaredDistance = geometries[i].closestPointXY(
        x, y, closestPoint, minSquaredDistance);
  }
  return minSquaredDistance;
};


/**
 * @inheritDoc
 */
GeometryCollection.prototype.containsXY = function(x, y) {
  var geometries = this.geometries_;
  var i, ii;
  for (i = 0, ii = geometries.length; i < ii; ++i) {
    if (geometries[i].containsXY(x, y)) {
      return true;
    }
  }
  return false;
};


/**
 * @inheritDoc
 */
GeometryCollection.prototype.computeExtent = function(extent) {
  createOrUpdateEmpty(extent);
  var geometries = this.geometries_;
  for (var i = 0, ii = geometries.length; i < ii; ++i) {
    extend(extent, geometries[i].getExtent());
  }
  return extent;
};


/**
 * Return the geometries that make up this geometry collection.
 * @return {Array.<ol.geom.Geometry>} Geometries.
 * @api
 */
GeometryCollection.prototype.getGeometries = function() {
  return GeometryCollection.cloneGeometries_(this.geometries_);
};


/**
 * @return {Array.<ol.geom.Geometry>} Geometries.
 */
GeometryCollection.prototype.getGeometriesArray = function() {
  return this.geometries_;
};


/**
 * @inheritDoc
 */
GeometryCollection.prototype.getSimplifiedGeometry = function(squaredTolerance) {
  if (this.simplifiedGeometryRevision != this.getRevision()) {
    _ol_obj_.clear(this.simplifiedGeometryCache);
    this.simplifiedGeometryMaxMinSquaredTolerance = 0;
    this.simplifiedGeometryRevision = this.getRevision();
  }
  if (squaredTolerance < 0 ||
      (this.simplifiedGeometryMaxMinSquaredTolerance !== 0 &&
       squaredTolerance < this.simplifiedGeometryMaxMinSquaredTolerance)) {
    return this;
  }
  var key = squaredTolerance.toString();
  if (this.simplifiedGeometryCache.hasOwnProperty(key)) {
    return this.simplifiedGeometryCache[key];
  } else {
    var simplifiedGeometries = [];
    var geometries = this.geometries_;
    var simplified = false;
    var i, ii;
    for (i = 0, ii = geometries.length; i < ii; ++i) {
      var geometry = geometries[i];
      var simplifiedGeometry = geometry.getSimplifiedGeometry(squaredTolerance);
      simplifiedGeometries.push(simplifiedGeometry);
      if (simplifiedGeometry !== geometry) {
        simplified = true;
      }
    }
    if (simplified) {
      var simplifiedGeometryCollection = new GeometryCollection(null);
      simplifiedGeometryCollection.setGeometriesArray(simplifiedGeometries);
      this.simplifiedGeometryCache[key] = simplifiedGeometryCollection;
      return simplifiedGeometryCollection;
    } else {
      this.simplifiedGeometryMaxMinSquaredTolerance = squaredTolerance;
      return this;
    }
  }
};


/**
 * @inheritDoc
 * @api
 */
GeometryCollection.prototype.getType = function() {
  return GeometryType.GEOMETRY_COLLECTION;
};


/**
 * @inheritDoc
 * @api
 */
GeometryCollection.prototype.intersectsExtent = function(extent) {
  var geometries = this.geometries_;
  var i, ii;
  for (i = 0, ii = geometries.length; i < ii; ++i) {
    if (geometries[i].intersectsExtent(extent)) {
      return true;
    }
  }
  return false;
};


/**
 * @return {boolean} Is empty.
 */
GeometryCollection.prototype.isEmpty = function() {
  return this.geometries_.length === 0;
};


/**
 * @inheritDoc
 * @api
 */
GeometryCollection.prototype.rotate = function(angle, anchor) {
  var geometries = this.geometries_;
  for (var i = 0, ii = geometries.length; i < ii; ++i) {
    geometries[i].rotate(angle, anchor);
  }
  this.changed();
};


/**
 * @inheritDoc
 * @api
 */
GeometryCollection.prototype.scale = function(sx, opt_sy, opt_anchor) {
  var anchor = opt_anchor;
  if (!anchor) {
    anchor = getCenter(this.getExtent());
  }
  var geometries = this.geometries_;
  for (var i = 0, ii = geometries.length; i < ii; ++i) {
    geometries[i].scale(sx, opt_sy, anchor);
  }
  this.changed();
};


/**
 * Set the geometries that make up this geometry collection.
 * @param {Array.<ol.geom.Geometry>} geometries Geometries.
 * @api
 */
GeometryCollection.prototype.setGeometries = function(geometries) {
  this.setGeometriesArray(
      GeometryCollection.cloneGeometries_(geometries));
};


/**
 * @param {Array.<ol.geom.Geometry>} geometries Geometries.
 */
GeometryCollection.prototype.setGeometriesArray = function(geometries) {
  this.unlistenGeometriesChange_();
  this.geometries_ = geometries;
  this.listenGeometriesChange_();
  this.changed();
};


/**
 * @inheritDoc
 * @api
 */
GeometryCollection.prototype.applyTransform = function(transformFn) {
  var geometries = this.geometries_;
  var i, ii;
  for (i = 0, ii = geometries.length; i < ii; ++i) {
    geometries[i].applyTransform(transformFn);
  }
  this.changed();
};


/**
 * Translate the geometry.
 * @param {number} deltaX Delta X.
 * @param {number} deltaY Delta Y.
 * @override
 * @api
 */
GeometryCollection.prototype.translate = function(deltaX, deltaY) {
  var geometries = this.geometries_;
  var i, ii;
  for (i = 0, ii = geometries.length; i < ii; ++i) {
    geometries[i].translate(deltaX, deltaY);
  }
  this.changed();
};


/**
 * @inheritDoc
 */
GeometryCollection.prototype.disposeInternal = function() {
  this.unlistenGeometriesChange_();
  Geometry.prototype.disposeInternal.call(this);
};
export default GeometryCollection;
