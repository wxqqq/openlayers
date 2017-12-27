/**
 * @module ol/interaction/DragZoom
 */
import {inherits} from '../index.js';
import {easeOut} from '../easing.js';
import _ol_events_condition_ from '../events/condition.js';
import {createOrUpdateFromCoordinates, getBottomLeft, getCenter, getTopRight, scaleFromCenter} from '../extent.js';
import DragBox from '../interaction/DragBox.js';

/**
 * @classdesc
 * Allows the user to zoom the map by clicking and dragging on the map,
 * normally combined with an {@link ol.events.condition} that limits
 * it to when a key, shift by default, is held down.
 *
 * To change the style of the box, use CSS and the `.ol-dragzoom` selector, or
 * your custom one configured with `className`.
 *
 * @constructor
 * @extends {ol.interaction.DragBox}
 * @param {olx.interaction.DragZoomOptions=} opt_options Options.
 * @api
 */
var DragZoom = function(opt_options) {
  var options = opt_options ? opt_options : {};

  var condition = options.condition ?
    options.condition : _ol_events_condition_.shiftKeyOnly;

  /**
   * @private
   * @type {number}
   */
  this.duration_ = options.duration !== undefined ? options.duration : 200;

  /**
   * @private
   * @type {boolean}
   */
  this.out_ = options.out !== undefined ? options.out : false;

  DragBox.call(this, {
    condition: condition,
    className: options.className || 'ol-dragzoom'
  });

};

inherits(DragZoom, DragBox);


/**
 * @inheritDoc
 */
DragZoom.prototype.onBoxEnd = function() {
  var map = this.getMap();

  var view = /** @type {!ol.View} */ (map.getView());

  var size = /** @type {!ol.Size} */ (map.getSize());

  var extent = this.getGeometry().getExtent();

  if (this.out_) {
    var mapExtent = view.calculateExtent(size);
    var boxPixelExtent = createOrUpdateFromCoordinates([
      map.getPixelFromCoordinate(getBottomLeft(extent)),
      map.getPixelFromCoordinate(getTopRight(extent))]);
    var factor = view.getResolutionForExtent(boxPixelExtent, size);

    scaleFromCenter(mapExtent, 1 / factor);
    extent = mapExtent;
  }

  var resolution = view.constrainResolution(
      view.getResolutionForExtent(extent, size));

  var center = getCenter(extent);
  center = view.constrainCenter(center);

  view.animate({
    resolution: resolution,
    center: center,
    duration: this.duration_,
    easing: easeOut
  });

};
export default DragZoom;
