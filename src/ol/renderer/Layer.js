/**
 * @module ol/renderer/Layer
 */
import {getUid, inherits, nullFunction} from '../index.js';
import ImageState from '../ImageState.js';
import _ol_Observable_ from '../Observable.js';
import TileState from '../TileState.js';
import _ol_events_ from '../events.js';
import EventType from '../events/EventType.js';
import {FALSE} from '../functions.js';
import SourceState from '../source/State.js';

/**
 * @constructor
 * @extends {ol.Observable}
 * @param {ol.layer.Layer} layer Layer.
 * @struct
 */
var _ol_renderer_Layer_ = function(layer) {

  _ol_Observable_.call(this);

  /**
   * @private
   * @type {ol.layer.Layer}
   */
  this.layer_ = layer;


};

inherits(_ol_renderer_Layer_, _ol_Observable_);


/**
 * @param {ol.Coordinate} coordinate Coordinate.
 * @param {olx.FrameState} frameState Frame state.
 * @param {number} hitTolerance Hit tolerance in pixels.
 * @param {function(this: S, (ol.Feature|ol.render.Feature), ol.layer.Layer): T}
 *     callback Feature callback.
 * @param {S} thisArg Value to use as `this` when executing `callback`.
 * @return {T|undefined} Callback result.
 * @template S,T
 */
_ol_renderer_Layer_.prototype.forEachFeatureAtCoordinate = nullFunction;


/**
 * @param {ol.Coordinate} coordinate Coordinate.
 * @param {olx.FrameState} frameState Frame state.
 * @return {boolean} Is there a feature at the given coordinate?
 */
_ol_renderer_Layer_.prototype.hasFeatureAtCoordinate = FALSE;


/**
 * Create a function that adds loaded tiles to the tile lookup.
 * @param {ol.source.Tile} source Tile source.
 * @param {ol.proj.Projection} projection Projection of the tiles.
 * @param {Object.<number, Object.<string, ol.Tile>>} tiles Lookup of loaded
 *     tiles by zoom level.
 * @return {function(number, ol.TileRange):boolean} A function that can be
 *     called with a zoom level and a tile range to add loaded tiles to the
 *     lookup.
 * @protected
 */
_ol_renderer_Layer_.prototype.createLoadedTileFinder = function(source, projection, tiles) {
  return (
    /**
     * @param {number} zoom Zoom level.
     * @param {ol.TileRange} tileRange Tile range.
     * @return {boolean} The tile range is fully loaded.
     */
    function(zoom, tileRange) {
      function callback(tile) {
        if (!tiles[zoom]) {
          tiles[zoom] = {};
        }
        tiles[zoom][tile.tileCoord.toString()] = tile;
      }
      return source.forEachLoadedTile(projection, zoom, tileRange, callback);
    });
};


/**
 * @return {ol.layer.Layer} Layer.
 */
_ol_renderer_Layer_.prototype.getLayer = function() {
  return this.layer_;
};


/**
 * Handle changes in image state.
 * @param {ol.events.Event} event Image change event.
 * @private
 */
_ol_renderer_Layer_.prototype.handleImageChange_ = function(event) {
  var image = /** @type {ol.Image} */ (event.target);
  if (image.getState() === ImageState.LOADED) {
    this.renderIfReadyAndVisible();
  }
};


/**
 * Load the image if not already loaded, and register the image change
 * listener if needed.
 * @param {ol.ImageBase} image Image.
 * @return {boolean} `true` if the image is already loaded, `false`
 *     otherwise.
 * @protected
 */
_ol_renderer_Layer_.prototype.loadImage = function(image) {
  var imageState = image.getState();
  if (imageState != ImageState.LOADED && imageState != ImageState.ERROR) {
    _ol_events_.listen(image, EventType.CHANGE, this.handleImageChange_, this);
  }
  if (imageState == ImageState.IDLE) {
    image.load();
    imageState = image.getState();
  }
  return imageState == ImageState.LOADED;
};


/**
 * @protected
 */
_ol_renderer_Layer_.prototype.renderIfReadyAndVisible = function() {
  var layer = this.getLayer();
  if (layer.getVisible() && layer.getSourceState() == SourceState.READY) {
    this.changed();
  }
};


/**
 * @param {olx.FrameState} frameState Frame state.
 * @param {ol.source.Tile} tileSource Tile source.
 * @protected
 */
_ol_renderer_Layer_.prototype.scheduleExpireCache = function(frameState, tileSource) {
  if (tileSource.canExpireCache()) {
    /**
     * @param {ol.source.Tile} tileSource Tile source.
     * @param {ol.PluggableMap} map Map.
     * @param {olx.FrameState} frameState Frame state.
     */
    var postRenderFunction = function(tileSource, map, frameState) {
      var tileSourceKey = getUid(tileSource).toString();
      if (tileSourceKey in frameState.usedTiles) {
        tileSource.expireCache(frameState.viewState.projection,
            frameState.usedTiles[tileSourceKey]);
      }
    }.bind(null, tileSource);

    frameState.postRenderFunctions.push(
        /** @type {ol.PostRenderFunction} */ (postRenderFunction)
    );
  }
};


/**
 * @param {Object.<string, Object.<string, ol.TileRange>>} usedTiles Used tiles.
 * @param {ol.source.Tile} tileSource Tile source.
 * @param {number} z Z.
 * @param {ol.TileRange} tileRange Tile range.
 * @protected
 */
_ol_renderer_Layer_.prototype.updateUsedTiles = function(usedTiles, tileSource, z, tileRange) {
  // FIXME should we use tilesToDrawByZ instead?
  var tileSourceKey = getUid(tileSource).toString();
  var zKey = z.toString();
  if (tileSourceKey in usedTiles) {
    if (zKey in usedTiles[tileSourceKey]) {
      usedTiles[tileSourceKey][zKey].extend(tileRange);
    } else {
      usedTiles[tileSourceKey][zKey] = tileRange;
    }
  } else {
    usedTiles[tileSourceKey] = {};
    usedTiles[tileSourceKey][zKey] = tileRange;
  }
};


/**
 * Manage tile pyramid.
 * This function performs a number of functions related to the tiles at the
 * current zoom and lower zoom levels:
 * - registers idle tiles in frameState.wantedTiles so that they are not
 *   discarded by the tile queue
 * - enqueues missing tiles
 * @param {olx.FrameState} frameState Frame state.
 * @param {ol.source.Tile} tileSource Tile source.
 * @param {ol.tilegrid.TileGrid} tileGrid Tile grid.
 * @param {number} pixelRatio Pixel ratio.
 * @param {ol.proj.Projection} projection Projection.
 * @param {ol.Extent} extent Extent.
 * @param {number} currentZ Current Z.
 * @param {number} preload Load low resolution tiles up to 'preload' levels.
 * @param {function(this: T, ol.Tile)=} opt_tileCallback Tile callback.
 * @param {T=} opt_this Object to use as `this` in `opt_tileCallback`.
 * @protected
 * @template T
 */
_ol_renderer_Layer_.prototype.manageTilePyramid = function(
    frameState, tileSource, tileGrid, pixelRatio, projection, extent,
    currentZ, preload, opt_tileCallback, opt_this) {
  var tileSourceKey = getUid(tileSource).toString();
  if (!(tileSourceKey in frameState.wantedTiles)) {
    frameState.wantedTiles[tileSourceKey] = {};
  }
  var wantedTiles = frameState.wantedTiles[tileSourceKey];
  var tileQueue = frameState.tileQueue;
  var minZoom = tileGrid.getMinZoom();
  var tile, tileRange, tileResolution, x, y, z;
  for (z = minZoom; z <= currentZ; ++z) {
    tileRange = tileGrid.getTileRangeForExtentAndZ(extent, z, tileRange);
    tileResolution = tileGrid.getResolution(z);
    for (x = tileRange.minX; x <= tileRange.maxX; ++x) {
      for (y = tileRange.minY; y <= tileRange.maxY; ++y) {
        if (currentZ - z <= preload) {
          tile = tileSource.getTile(z, x, y, pixelRatio, projection);
          if (tile.getState() == TileState.IDLE) {
            wantedTiles[tile.getKey()] = true;
            if (!tileQueue.isKeyQueued(tile.getKey())) {
              tileQueue.enqueue([tile, tileSourceKey,
                tileGrid.getTileCoordCenter(tile.tileCoord), tileResolution]);
            }
          }
          if (opt_tileCallback !== undefined) {
            opt_tileCallback.call(opt_this, tile);
          }
        } else {
          tileSource.useTile(z, x, y, projection);
        }
      }
    }
  }
};
export default _ol_renderer_Layer_;
