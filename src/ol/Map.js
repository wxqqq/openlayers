/**
 * @module ol/Map
 */
import {inherits} from './index.js';
import PluggableMap from './PluggableMap.js';
import PluginType from './PluginType.js';
import {defaults as defaultControls} from './control.js';
import {defaults as defaultInteractions} from './interaction.js';
import _ol_obj_ from './obj.js';
import {register, registerMultiple} from './plugins.js';
import _ol_renderer_canvas_ImageLayer_ from './renderer/canvas/ImageLayer.js';
import _ol_renderer_canvas_Map_ from './renderer/canvas/Map.js';
import _ol_renderer_canvas_TileLayer_ from './renderer/canvas/TileLayer.js';
import _ol_renderer_canvas_VectorLayer_ from './renderer/canvas/VectorLayer.js';
import _ol_renderer_canvas_VectorTileLayer_ from './renderer/canvas/VectorTileLayer.js';
import _ol_renderer_webgl_ImageLayer_ from './renderer/webgl/ImageLayer.js';
import _ol_renderer_webgl_Map_ from './renderer/webgl/Map.js';
import _ol_renderer_webgl_TileLayer_ from './renderer/webgl/TileLayer.js';
import _ol_renderer_webgl_VectorLayer_ from './renderer/webgl/VectorLayer.js';


register(PluginType.MAP_RENDERER, _ol_renderer_canvas_Map_);
registerMultiple(PluginType.LAYER_RENDERER, [
  _ol_renderer_canvas_ImageLayer_,
  _ol_renderer_canvas_TileLayer_,
  _ol_renderer_canvas_VectorLayer_,
  _ol_renderer_canvas_VectorTileLayer_
]);

// TODO: move these to new ol-webgl package
register(PluginType.MAP_RENDERER, _ol_renderer_webgl_Map_);
registerMultiple(PluginType.LAYER_RENDERER, [
  _ol_renderer_webgl_ImageLayer_,
  _ol_renderer_webgl_TileLayer_,
  _ol_renderer_webgl_VectorLayer_
]);


/**
 * @classdesc
 * The map is the core component of OpenLayers. For a map to render, a view,
 * one or more layers, and a target container are needed:
 *
 *     var map = new Map({
 *       view: new ol.View({
 *         center: [0, 0],
 *         zoom: 1
 *       }),
 *       layers: [
 *         new ol.layer.Tile({
 *           source: new ol.source.OSM()
 *         })
 *       ],
 *       target: 'map'
 *     });
 *
 * The above snippet creates a map using a {@link ol.layer.Tile} to display
 * {@link ol.source.OSM} OSM data and render it to a DOM element with the
 * id `map`.
 *
 * The constructor places a viewport container (with CSS class name
 * `ol-viewport`) in the target element (see `getViewport()`), and then two
 * further elements within the viewport: one with CSS class name
 * `ol-overlaycontainer-stopevent` for controls and some overlays, and one with
 * CSS class name `ol-overlaycontainer` for other overlays (see the `stopEvent`
 * option of {@link ol.Overlay} for the difference). The map itself is placed in
 * a further element within the viewport.
 *
 * Layers are stored as a `ol.Collection` in layerGroups. A top-level group is
 * provided by the library. This is what is accessed by `getLayerGroup` and
 * `setLayerGroup`. Layers entered in the options are added to this group, and
 * `addLayer` and `removeLayer` change the layer collection in the group.
 * `getLayers` is a convenience function for `getLayerGroup().getLayers()`.
 * Note that `ol.layer.Group` is a subclass of `ol.layer.Base`, so layers
 * entered in the options or added with `addLayer` can be groups, which can
 * contain further groups, and so on.
 *
 * @constructor
 * @extends {ol.PluggableMap}
 * @param {olx.MapOptions} options Map options.
 * @fires ol.MapBrowserEvent
 * @fires ol.MapEvent
 * @fires ol.render.Event#postcompose
 * @fires ol.render.Event#precompose
 * @api
 */
var Map = function(options) {
  options = _ol_obj_.assign({}, options);
  if (!options.controls) {
    options.controls = defaultControls();
  }
  if (!options.interactions) {
    options.interactions = defaultInteractions();
  }

  PluggableMap.call(this, options);
};

inherits(Map, PluggableMap);

export default Map;
