/**
 * @module ol/geom/MultiPoint
 */
import {inherits} from '../index.js';
import {extend} from '../array.js';
import {closestSquaredDistanceXY, containsXY} from '../extent.js';
import GeometryLayout from '../geom/GeometryLayout.js';
import GeometryType from '../geom/GeometryType.js';
import Point from '../geom/Point.js';
import SimpleGeometry from '../geom/SimpleGeometry.js';
import _ol_geom_flat_deflate_ from '../geom/flat/deflate.js';
import _ol_geom_flat_inflate_ from '../geom/flat/inflate.js';
import {squaredDistance as squaredDx} from '../math.js';

/**
 * @classdesc
 * Multi-point geometry.
 *
 * @constructor
 * @extends {ol.geom.SimpleGeometry}
 * @param {Array.<ol.Coordinate>} coordinates Coordinates.
 * @param {ol.geom.GeometryLayout=} opt_layout Layout.
 * @api
 */
var MultiPoint = function(coordinates, opt_layout) {
  SimpleGeometry.call(this);
  this.setCoordinates(coordinates, opt_layout);
};

inherits(MultiPoint, SimpleGeometry);


/**
 * Append the passed point to this multipoint.
 * @param {ol.geom.Point} point Point.
 * @api
 */
MultiPoint.prototype.appendPoint = function(point) {
  if (!this.flatCoordinates) {
    this.flatCoordinates = point.getFlatCoordinates().slice();
  } else {
    extend(this.flatCoordinates, point.getFlatCoordinates());
  }
  this.changed();
};


/**
 * Make a complete copy of the geometry.
 * @return {!ol.geom.MultiPoint} Clone.
 * @override
 * @api
 */
MultiPoint.prototype.clone = function() {
  var multiPoint = new MultiPoint(null);
  multiPoint.setFlatCoordinates(this.layout, this.flatCoordinates.slice());
  return multiPoint;
};


/**
 * @inheritDoc
 */
MultiPoint.prototype.closestPointXY = function(x, y, closestPoint, minSquaredDistance) {
  if (minSquaredDistance < closestSquaredDistanceXY(this.getExtent(), x, y)) {
    return minSquaredDistance;
  }
  var flatCoordinates = this.flatCoordinates;
  var stride = this.stride;
  var i, ii, j;
  for (i = 0, ii = flatCoordinates.length; i < ii; i += stride) {
    var squaredDistance = squaredDx(
        x, y, flatCoordinates[i], flatCoordinates[i + 1]);
    if (squaredDistance < minSquaredDistance) {
      minSquaredDistance = squaredDistance;
      for (j = 0; j < stride; ++j) {
        closestPoint[j] = flatCoordinates[i + j];
      }
      closestPoint.length = stride;
    }
  }
  return minSquaredDistance;
};


/**
 * Return the coordinates of the multipoint.
 * @return {Array.<ol.Coordinate>} Coordinates.
 * @override
 * @api
 */
MultiPoint.prototype.getCoordinates = function() {
  return _ol_geom_flat_inflate_.coordinates(
      this.flatCoordinates, 0, this.flatCoordinates.length, this.stride);
};


/**
 * Return the point at the specified index.
 * @param {number} index Index.
 * @return {ol.geom.Point} Point.
 * @api
 */
MultiPoint.prototype.getPoint = function(index) {
  var n = !this.flatCoordinates ?
    0 : this.flatCoordinates.length / this.stride;
  if (index < 0 || n <= index) {
    return null;
  }
  var point = new Point(null);
  point.setFlatCoordinates(this.layout, this.flatCoordinates.slice(
      index * this.stride, (index + 1) * this.stride));
  return point;
};


/**
 * Return the points of this multipoint.
 * @return {Array.<ol.geom.Point>} Points.
 * @api
 */
MultiPoint.prototype.getPoints = function() {
  var flatCoordinates = this.flatCoordinates;
  var layout = this.layout;
  var stride = this.stride;
  /** @type {Array.<ol.geom.Point>} */
  var points = [];
  var i, ii;
  for (i = 0, ii = flatCoordinates.length; i < ii; i += stride) {
    var point = new Point(null);
    point.setFlatCoordinates(layout, flatCoordinates.slice(i, i + stride));
    points.push(point);
  }
  return points;
};


/**
 * @inheritDoc
 * @api
 */
MultiPoint.prototype.getType = function() {
  return GeometryType.MULTI_POINT;
};


/**
 * @inheritDoc
 * @api
 */
MultiPoint.prototype.intersectsExtent = function(extent) {
  var flatCoordinates = this.flatCoordinates;
  var stride = this.stride;
  var i, ii, x, y;
  for (i = 0, ii = flatCoordinates.length; i < ii; i += stride) {
    x = flatCoordinates[i];
    y = flatCoordinates[i + 1];
    if (containsXY(extent, x, y)) {
      return true;
    }
  }
  return false;
};


/**
 * Set the coordinates of the multipoint.
 * @param {Array.<ol.Coordinate>} coordinates Coordinates.
 * @param {ol.geom.GeometryLayout=} opt_layout Layout.
 * @override
 * @api
 */
MultiPoint.prototype.setCoordinates = function(coordinates, opt_layout) {
  if (!coordinates) {
    this.setFlatCoordinates(GeometryLayout.XY, null);
  } else {
    this.setLayout(opt_layout, coordinates, 1);
    if (!this.flatCoordinates) {
      this.flatCoordinates = [];
    }
    this.flatCoordinates.length = _ol_geom_flat_deflate_.coordinates(
        this.flatCoordinates, 0, coordinates, this.stride);
    this.changed();
  }
};


/**
 * @param {ol.geom.GeometryLayout} layout Layout.
 * @param {Array.<number>} flatCoordinates Flat coordinates.
 */
MultiPoint.prototype.setFlatCoordinates = function(layout, flatCoordinates) {
  this.setFlatCoordinatesInternal(layout, flatCoordinates);
  this.changed();
};
export default MultiPoint;
