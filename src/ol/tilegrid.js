/**
 * @module ol/tilegrid
 */
import {DEFAULT_MAX_ZOOM, DEFAULT_TILE_SIZE} from './tilegrid/common.js';
import _ol_size_ from './size.js';
import {containsCoordinate, createOrUpdate, getCorner, getHeight, getWidth} from './extent.js';
import Corner from './extent/Corner.js';
import _ol_obj_ from './obj.js';
import {get as getProjection, METERS_PER_UNIT} from './proj.js';
import _ol_proj_Units_ from './proj/Units.js';
import TileGrid from './tilegrid/TileGrid.js';
var _ol_tilegrid_ = {};


/**
 * @param {ol.proj.Projection} projection Projection.
 * @return {!ol.tilegrid.TileGrid} Default tile grid for the passed projection.
 */
_ol_tilegrid_.getForProjection = function(projection) {
  var tileGrid = projection.getDefaultTileGrid();
  if (!tileGrid) {
    tileGrid = _ol_tilegrid_.createForProjection(projection);
    projection.setDefaultTileGrid(tileGrid);
  }
  return tileGrid;
};


/**
 * @param {ol.tilegrid.TileGrid} tileGrid Tile grid.
 * @param {ol.TileCoord} tileCoord Tile coordinate.
 * @param {ol.proj.Projection} projection Projection.
 * @return {ol.TileCoord} Tile coordinate.
 */
_ol_tilegrid_.wrapX = function(tileGrid, tileCoord, projection) {
  var z = tileCoord[0];
  var center = tileGrid.getTileCoordCenter(tileCoord);
  var projectionExtent = _ol_tilegrid_.extentFromProjection(projection);
  if (!containsCoordinate(projectionExtent, center)) {
    var worldWidth = getWidth(projectionExtent);
    var worldsAway = Math.ceil((projectionExtent[0] - center[0]) / worldWidth);
    center[0] += worldWidth * worldsAway;
    return tileGrid.getTileCoordForCoordAndZ(center, z);
  } else {
    return tileCoord;
  }
};


/**
 * @param {ol.Extent} extent Extent.
 * @param {number=} opt_maxZoom Maximum zoom level (default is
 *     DEFAULT_MAX_ZOOM).
 * @param {number|ol.Size=} opt_tileSize Tile size (default uses
 *     DEFAULT_TILE_SIZE).
 * @param {ol.extent.Corner=} opt_corner Extent corner (default is
 *     ol.extent.Corner.TOP_LEFT).
 * @return {!ol.tilegrid.TileGrid} TileGrid instance.
 */
_ol_tilegrid_.createForExtent = function(extent, opt_maxZoom, opt_tileSize, opt_corner) {
  var corner = opt_corner !== undefined ? opt_corner : Corner.TOP_LEFT;

  var resolutions = _ol_tilegrid_.resolutionsFromExtent(
      extent, opt_maxZoom, opt_tileSize);

  return new TileGrid({
    extent: extent,
    origin: getCorner(extent, corner),
    resolutions: resolutions,
    tileSize: opt_tileSize
  });
};


/**
 * Creates a tile grid with a standard XYZ tiling scheme.
 * @param {olx.tilegrid.XYZOptions=} opt_options Tile grid options.
 * @return {!ol.tilegrid.TileGrid} Tile grid instance.
 * @api
 */
_ol_tilegrid_.createXYZ = function(opt_options) {
  var options = /** @type {olx.tilegrid.TileGridOptions} */ ({});
  _ol_obj_.assign(options, opt_options !== undefined ?
    opt_options : /** @type {olx.tilegrid.XYZOptions} */ ({}));
  if (options.extent === undefined) {
    options.extent = getProjection('EPSG:3857').getExtent();
  }
  options.resolutions = _ol_tilegrid_.resolutionsFromExtent(
      options.extent, options.maxZoom, options.tileSize);
  delete options.maxZoom;

  return new TileGrid(options);
};


/**
 * Create a resolutions array from an extent.  A zoom factor of 2 is assumed.
 * @param {ol.Extent} extent Extent.
 * @param {number=} opt_maxZoom Maximum zoom level (default is
 *     DEFAULT_MAX_ZOOM).
 * @param {number|ol.Size=} opt_tileSize Tile size (default uses
 *     DEFAULT_TILE_SIZE).
 * @return {!Array.<number>} Resolutions array.
 */
_ol_tilegrid_.resolutionsFromExtent = function(extent, opt_maxZoom, opt_tileSize) {
  var maxZoom = opt_maxZoom !== undefined ?
    opt_maxZoom : DEFAULT_MAX_ZOOM;

  var height = getHeight(extent);
  var width = getWidth(extent);

  var tileSize = _ol_size_.toSize(opt_tileSize !== undefined ?
    opt_tileSize : DEFAULT_TILE_SIZE);
  var maxResolution = Math.max(
      width / tileSize[0], height / tileSize[1]);

  var length = maxZoom + 1;
  var resolutions = new Array(length);
  for (var z = 0; z < length; ++z) {
    resolutions[z] = maxResolution / Math.pow(2, z);
  }
  return resolutions;
};


/**
 * @param {ol.ProjectionLike} projection Projection.
 * @param {number=} opt_maxZoom Maximum zoom level (default is
 *     DEFAULT_MAX_ZOOM).
 * @param {number|ol.Size=} opt_tileSize Tile size (default uses
 *     DEFAULT_TILE_SIZE).
 * @param {ol.extent.Corner=} opt_corner Extent corner (default is
 *     ol.extent.Corner.BOTTOM_LEFT).
 * @return {!ol.tilegrid.TileGrid} TileGrid instance.
 */
_ol_tilegrid_.createForProjection = function(projection, opt_maxZoom, opt_tileSize, opt_corner) {
  var extent = _ol_tilegrid_.extentFromProjection(projection);
  return _ol_tilegrid_.createForExtent(
      extent, opt_maxZoom, opt_tileSize, opt_corner);
};


/**
 * Generate a tile grid extent from a projection.  If the projection has an
 * extent, it is used.  If not, a global extent is assumed.
 * @param {ol.ProjectionLike} projection Projection.
 * @return {ol.Extent} Extent.
 */
_ol_tilegrid_.extentFromProjection = function(projection) {
  projection = getProjection(projection);
  var extent = projection.getExtent();
  if (!extent) {
    var half = 180 * METERS_PER_UNIT[_ol_proj_Units_.DEGREES] /
        projection.getMetersPerUnit();
    extent = createOrUpdate(-half, -half, half, half);
  }
  return extent;
};
export default _ol_tilegrid_;
