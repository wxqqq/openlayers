/**
 * @module ol/geom/SimpleGeometry
 */
import {inherits} from '../index.js';
import {FALSE} from '../functions.js';
import {createOrUpdateFromFlatCoordinates, getCenter} from '../extent.js';
import Geometry from '../geom/Geometry.js';
import GeometryLayout from '../geom/GeometryLayout.js';
import _ol_geom_flat_transform_ from '../geom/flat/transform.js';
import _ol_obj_ from '../obj.js';

/**
 * @classdesc
 * Abstract base class; only used for creating subclasses; do not instantiate
 * in apps, as cannot be rendered.
 *
 * @constructor
 * @abstract
 * @extends {ol.geom.Geometry}
 * @api
 */
var SimpleGeometry = function() {

  Geometry.call(this);

  /**
   * @protected
   * @type {ol.geom.GeometryLayout}
   */
  this.layout = GeometryLayout.XY;

  /**
   * @protected
   * @type {number}
   */
  this.stride = 2;

  /**
   * @protected
   * @type {Array.<number>}
   */
  this.flatCoordinates = null;

};

inherits(SimpleGeometry, Geometry);


/**
 * @param {number} stride Stride.
 * @return {ol.geom.GeometryLayout} layout Layout.
 */
function getLayoutForStride(stride) {
  var layout;
  if (stride == 2) {
    layout = GeometryLayout.XY;
  } else if (stride == 3) {
    layout = GeometryLayout.XYZ;
  } else if (stride == 4) {
    layout = GeometryLayout.XYZM;
  }
  return /** @type {ol.geom.GeometryLayout} */ (layout);
}


/**
 * @param {ol.geom.GeometryLayout} layout Layout.
 * @return {number} Stride.
 */
export function getStrideForLayout(layout) {
  var stride;
  if (layout == GeometryLayout.XY) {
    stride = 2;
  } else if (layout == GeometryLayout.XYZ || layout == GeometryLayout.XYM) {
    stride = 3;
  } else if (layout == GeometryLayout.XYZM) {
    stride = 4;
  }
  return /** @type {number} */ (stride);
}


/**
 * @inheritDoc
 */
SimpleGeometry.prototype.containsXY = FALSE;


/**
 * @inheritDoc
 */
SimpleGeometry.prototype.computeExtent = function(extent) {
  return createOrUpdateFromFlatCoordinates(this.flatCoordinates,
      0, this.flatCoordinates.length, this.stride, extent);
};


/**
 * @abstract
 * @return {Array} Coordinates.
 */
SimpleGeometry.prototype.getCoordinates = function() {};


/**
 * Return the first coordinate of the geometry.
 * @return {ol.Coordinate} First coordinate.
 * @api
 */
SimpleGeometry.prototype.getFirstCoordinate = function() {
  return this.flatCoordinates.slice(0, this.stride);
};


/**
 * @return {Array.<number>} Flat coordinates.
 */
SimpleGeometry.prototype.getFlatCoordinates = function() {
  return this.flatCoordinates;
};


/**
 * Return the last coordinate of the geometry.
 * @return {ol.Coordinate} Last point.
 * @api
 */
SimpleGeometry.prototype.getLastCoordinate = function() {
  return this.flatCoordinates.slice(this.flatCoordinates.length - this.stride);
};


/**
 * Return the {@link ol.geom.GeometryLayout layout} of the geometry.
 * @return {ol.geom.GeometryLayout} Layout.
 * @api
 */
SimpleGeometry.prototype.getLayout = function() {
  return this.layout;
};


/**
 * @inheritDoc
 */
SimpleGeometry.prototype.getSimplifiedGeometry = function(squaredTolerance) {
  if (this.simplifiedGeometryRevision != this.getRevision()) {
    _ol_obj_.clear(this.simplifiedGeometryCache);
    this.simplifiedGeometryMaxMinSquaredTolerance = 0;
    this.simplifiedGeometryRevision = this.getRevision();
  }
  // If squaredTolerance is negative or if we know that simplification will not
  // have any effect then just return this.
  if (squaredTolerance < 0 ||
      (this.simplifiedGeometryMaxMinSquaredTolerance !== 0 &&
       squaredTolerance <= this.simplifiedGeometryMaxMinSquaredTolerance)) {
    return this;
  }
  var key = squaredTolerance.toString();
  if (this.simplifiedGeometryCache.hasOwnProperty(key)) {
    return this.simplifiedGeometryCache[key];
  } else {
    var simplifiedGeometry =
        this.getSimplifiedGeometryInternal(squaredTolerance);
    var simplifiedFlatCoordinates = simplifiedGeometry.getFlatCoordinates();
    if (simplifiedFlatCoordinates.length < this.flatCoordinates.length) {
      this.simplifiedGeometryCache[key] = simplifiedGeometry;
      return simplifiedGeometry;
    } else {
      // Simplification did not actually remove any coordinates.  We now know
      // that any calls to getSimplifiedGeometry with a squaredTolerance less
      // than or equal to the current squaredTolerance will also not have any
      // effect.  This allows us to short circuit simplification (saving CPU
      // cycles) and prevents the cache of simplified geometries from filling
      // up with useless identical copies of this geometry (saving memory).
      this.simplifiedGeometryMaxMinSquaredTolerance = squaredTolerance;
      return this;
    }
  }
};


/**
 * @param {number} squaredTolerance Squared tolerance.
 * @return {ol.geom.SimpleGeometry} Simplified geometry.
 * @protected
 */
SimpleGeometry.prototype.getSimplifiedGeometryInternal = function(squaredTolerance) {
  return this;
};


/**
 * @return {number} Stride.
 */
SimpleGeometry.prototype.getStride = function() {
  return this.stride;
};


/**
 * @param {ol.geom.GeometryLayout} layout Layout.
 * @param {Array.<number>} flatCoordinates Flat coordinates.
 * @protected
 */
SimpleGeometry.prototype.setFlatCoordinatesInternal = function(layout, flatCoordinates) {
  this.stride = getStrideForLayout(layout);
  this.layout = layout;
  this.flatCoordinates = flatCoordinates;
};


/**
 * @abstract
 * @param {Array} coordinates Coordinates.
 * @param {ol.geom.GeometryLayout=} opt_layout Layout.
 */
SimpleGeometry.prototype.setCoordinates = function(coordinates, opt_layout) {};


/**
 * @param {ol.geom.GeometryLayout|undefined} layout Layout.
 * @param {Array} coordinates Coordinates.
 * @param {number} nesting Nesting.
 * @protected
 */
SimpleGeometry.prototype.setLayout = function(layout, coordinates, nesting) {
  /** @type {number} */
  var stride;
  if (layout) {
    stride = getStrideForLayout(layout);
  } else {
    var i;
    for (i = 0; i < nesting; ++i) {
      if (coordinates.length === 0) {
        this.layout = GeometryLayout.XY;
        this.stride = 2;
        return;
      } else {
        coordinates = /** @type {Array} */ (coordinates[0]);
      }
    }
    stride = coordinates.length;
    layout = getLayoutForStride(stride);
  }
  this.layout = layout;
  this.stride = stride;
};


/**
 * @inheritDoc
 * @api
 */
SimpleGeometry.prototype.applyTransform = function(transformFn) {
  if (this.flatCoordinates) {
    transformFn(this.flatCoordinates, this.flatCoordinates, this.stride);
    this.changed();
  }
};


/**
 * @inheritDoc
 * @api
 */
SimpleGeometry.prototype.rotate = function(angle, anchor) {
  var flatCoordinates = this.getFlatCoordinates();
  if (flatCoordinates) {
    var stride = this.getStride();
    _ol_geom_flat_transform_.rotate(
        flatCoordinates, 0, flatCoordinates.length,
        stride, angle, anchor, flatCoordinates);
    this.changed();
  }
};


/**
 * @inheritDoc
 * @api
 */
SimpleGeometry.prototype.scale = function(sx, opt_sy, opt_anchor) {
  var sy = opt_sy;
  if (sy === undefined) {
    sy = sx;
  }
  var anchor = opt_anchor;
  if (!anchor) {
    anchor = getCenter(this.getExtent());
  }
  var flatCoordinates = this.getFlatCoordinates();
  if (flatCoordinates) {
    var stride = this.getStride();
    _ol_geom_flat_transform_.scale(
        flatCoordinates, 0, flatCoordinates.length,
        stride, sx, sy, anchor, flatCoordinates);
    this.changed();
  }
};


/**
 * @inheritDoc
 * @api
 */
SimpleGeometry.prototype.translate = function(deltaX, deltaY) {
  var flatCoordinates = this.getFlatCoordinates();
  if (flatCoordinates) {
    var stride = this.getStride();
    _ol_geom_flat_transform_.translate(
        flatCoordinates, 0, flatCoordinates.length, stride,
        deltaX, deltaY, flatCoordinates);
    this.changed();
  }
};


/**
 * @param {ol.geom.SimpleGeometry} simpleGeometry Simple geometry.
 * @param {ol.Transform} transform Transform.
 * @param {Array.<number>=} opt_dest Destination.
 * @return {Array.<number>} Transformed flat coordinates.
 */
SimpleGeometry.transform2D = function(simpleGeometry, transform, opt_dest) {
  var flatCoordinates = simpleGeometry.getFlatCoordinates();
  if (!flatCoordinates) {
    return null;
  } else {
    var stride = simpleGeometry.getStride();
    return _ol_geom_flat_transform_.transform2D(
        flatCoordinates, 0, flatCoordinates.length, stride,
        transform, opt_dest);
  }
};
export default SimpleGeometry;
