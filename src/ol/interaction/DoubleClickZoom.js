/**
 * @module ol/interaction/DoubleClickZoom
 */
import {inherits} from '../index.js';
import MapBrowserEventType from '../MapBrowserEventType.js';
import Interaction from '../interaction/Interaction.js';

/**
 * @classdesc
 * Allows the user to zoom by double-clicking on the map.
 *
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @param {olx.interaction.DoubleClickZoomOptions=} opt_options Options.
 * @api
 */
var DoubleClickZoom = function(opt_options) {

  var options = opt_options ? opt_options : {};

  /**
   * @private
   * @type {number}
   */
  this.delta_ = options.delta ? options.delta : 1;

  Interaction.call(this, {
    handleEvent: DoubleClickZoom.handleEvent
  });

  /**
   * @private
   * @type {number}
   */
  this.duration_ = options.duration !== undefined ? options.duration : 250;

};

inherits(DoubleClickZoom, Interaction);


/**
 * Handles the {@link ol.MapBrowserEvent map browser event} (if it was a
 * doubleclick) and eventually zooms the map.
 * @param {ol.MapBrowserEvent} mapBrowserEvent Map browser event.
 * @return {boolean} `false` to stop event propagation.
 * @this {ol.interaction.DoubleClickZoom}
 * @api
 */
DoubleClickZoom.handleEvent = function(mapBrowserEvent) {
  var stopEvent = false;
  var browserEvent = mapBrowserEvent.originalEvent;
  if (mapBrowserEvent.type == MapBrowserEventType.DBLCLICK) {
    var map = mapBrowserEvent.map;
    var anchor = mapBrowserEvent.coordinate;
    var delta = browserEvent.shiftKey ? -this.delta_ : this.delta_;
    var view = map.getView();
    Interaction.zoomByDelta(
        view, delta, anchor, this.duration_);
    mapBrowserEvent.preventDefault();
    stopEvent = true;
  }
  return !stopEvent;
};
export default DoubleClickZoom;
