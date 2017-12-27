/**
 * @module ol/interaction/MouseWheelZoom
 */
import {inherits} from '../index.js';
import _ol_ViewHint_ from '../ViewHint.js';
import {easeOut} from '../easing.js';
import EventType from '../events/EventType.js';
import _ol_has_ from '../has.js';
import Interaction from '../interaction/Interaction.js';
import {clamp} from '../math.js';


/**
 * @type {number} Maximum mouse wheel delta.
 */
var MAX_DELTA = 1;


/**
 * @classdesc
 * Allows the user to zoom the map by scrolling the mouse wheel.
 *
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @param {olx.interaction.MouseWheelZoomOptions=} opt_options Options.
 * @api
 */
var _ol_interaction_MouseWheelZoom_ = function(opt_options) {

  Interaction.call(this, {
    handleEvent: _ol_interaction_MouseWheelZoom_.handleEvent
  });

  var options = opt_options || {};

  /**
   * @private
   * @type {number}
   */
  this.delta_ = 0;

  /**
   * @private
   * @type {number}
   */
  this.duration_ = options.duration !== undefined ? options.duration : 250;

  /**
   * @private
   * @type {number}
   */
  this.timeout_ = options.timeout !== undefined ? options.timeout : 80;

  /**
   * @private
   * @type {boolean}
   */
  this.useAnchor_ = options.useAnchor !== undefined ? options.useAnchor : true;

  /**
   * @private
   * @type {boolean}
   */
  this.constrainResolution_ = options.constrainResolution || false;

  /**
   * @private
   * @type {?ol.Coordinate}
   */
  this.lastAnchor_ = null;

  /**
   * @private
   * @type {number|undefined}
   */
  this.startTime_ = undefined;

  /**
   * @private
   * @type {number|undefined}
   */
  this.timeoutId_ = undefined;

  /**
   * @private
   * @type {ol.interaction.MouseWheelZoom.Mode_|undefined}
   */
  this.mode_ = undefined;

  /**
   * Trackpad events separated by this delay will be considered separate
   * interactions.
   * @type {number}
   */
  this.trackpadEventGap_ = 400;

  /**
   * @type {number|undefined}
   */
  this.trackpadTimeoutId_ = undefined;

  /**
   * The number of delta values per zoom level
   * @private
   * @type {number}
   */
  this.trackpadDeltaPerZoom_ = 300;

  /**
   * The zoom factor by which scroll zooming is allowed to exceed the limits.
   * @private
   * @type {number}
   */
  this.trackpadZoomBuffer_ = 1.5;

};

inherits(_ol_interaction_MouseWheelZoom_, Interaction);


/**
 * Handles the {@link ol.MapBrowserEvent map browser event} (if it was a
 * mousewheel-event) and eventually zooms the map.
 * @param {ol.MapBrowserEvent} mapBrowserEvent Map browser event.
 * @return {boolean} Allow event propagation.
 * @this {ol.interaction.MouseWheelZoom}
 * @api
 */
_ol_interaction_MouseWheelZoom_.handleEvent = function(mapBrowserEvent) {
  var type = mapBrowserEvent.type;
  if (type !== EventType.WHEEL && type !== EventType.MOUSEWHEEL) {
    return true;
  }

  mapBrowserEvent.preventDefault();

  var map = mapBrowserEvent.map;
  var wheelEvent = /** @type {WheelEvent} */ (mapBrowserEvent.originalEvent);

  if (this.useAnchor_) {
    this.lastAnchor_ = mapBrowserEvent.coordinate;
  }

  // Delta normalisation inspired by
  // https://github.com/mapbox/mapbox-gl-js/blob/001c7b9/js/ui/handler/scroll_zoom.js
  var delta;
  if (mapBrowserEvent.type == EventType.WHEEL) {
    delta = wheelEvent.deltaY;
    if (_ol_has_.FIREFOX &&
        wheelEvent.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
      delta /= _ol_has_.DEVICE_PIXEL_RATIO;
    }
    if (wheelEvent.deltaMode === WheelEvent.DOM_DELTA_LINE) {
      delta *= 40;
    }
  } else if (mapBrowserEvent.type == EventType.MOUSEWHEEL) {
    delta = -wheelEvent.wheelDeltaY;
    if (_ol_has_.SAFARI) {
      delta /= 3;
    }
  }

  if (delta === 0) {
    return false;
  }

  var now = Date.now();

  if (this.startTime_ === undefined) {
    this.startTime_ = now;
  }

  if (!this.mode_ || now - this.startTime_ > this.trackpadEventGap_) {
    this.mode_ = Math.abs(delta) < 4 ?
      _ol_interaction_MouseWheelZoom_.Mode_.TRACKPAD :
      _ol_interaction_MouseWheelZoom_.Mode_.WHEEL;
  }

  if (this.mode_ === _ol_interaction_MouseWheelZoom_.Mode_.TRACKPAD) {
    var view = map.getView();
    if (this.trackpadTimeoutId_) {
      clearTimeout(this.trackpadTimeoutId_);
    } else {
      view.setHint(_ol_ViewHint_.INTERACTING, 1);
    }
    this.trackpadTimeoutId_ = setTimeout(this.decrementInteractingHint_.bind(this), this.trackpadEventGap_);
    var resolution = view.getResolution() * Math.pow(2, delta / this.trackpadDeltaPerZoom_);
    var minResolution = view.getMinResolution();
    var maxResolution = view.getMaxResolution();
    var rebound = 0;
    if (resolution < minResolution) {
      resolution = Math.max(resolution, minResolution / this.trackpadZoomBuffer_);
      rebound = 1;
    } else if (resolution > maxResolution) {
      resolution = Math.min(resolution, maxResolution * this.trackpadZoomBuffer_);
      rebound = -1;
    }
    if (this.lastAnchor_) {
      var center = view.calculateCenterZoom(resolution, this.lastAnchor_);
      view.setCenter(view.constrainCenter(center));
    }
    view.setResolution(resolution);

    if (rebound === 0 && this.constrainResolution_) {
      view.animate({
        resolution: view.constrainResolution(resolution, delta > 0 ? -1 : 1),
        easing: easeOut,
        anchor: this.lastAnchor_,
        duration: this.duration_
      });
    }

    if (rebound > 0) {
      view.animate({
        resolution: minResolution,
        easing: easeOut,
        anchor: this.lastAnchor_,
        duration: 500
      });
    } else if (rebound < 0) {
      view.animate({
        resolution: maxResolution,
        easing: easeOut,
        anchor: this.lastAnchor_,
        duration: 500
      });
    }
    this.startTime_ = now;
    return false;
  }

  this.delta_ += delta;

  var timeLeft = Math.max(this.timeout_ - (now - this.startTime_), 0);

  clearTimeout(this.timeoutId_);
  this.timeoutId_ = setTimeout(this.handleWheelZoom_.bind(this, map), timeLeft);

  return false;
};


/**
 * @private
 */
_ol_interaction_MouseWheelZoom_.prototype.decrementInteractingHint_ = function() {
  this.trackpadTimeoutId_ = undefined;
  var view = this.getMap().getView();
  view.setHint(_ol_ViewHint_.INTERACTING, -1);
};


/**
 * @private
 * @param {ol.PluggableMap} map Map.
 */
_ol_interaction_MouseWheelZoom_.prototype.handleWheelZoom_ = function(map) {
  var view = map.getView();
  if (view.getAnimating()) {
    view.cancelAnimations();
  }
  var maxDelta = MAX_DELTA;
  var delta = clamp(this.delta_, -maxDelta, maxDelta);
  Interaction.zoomByDelta(view, -delta, this.lastAnchor_,
      this.duration_);
  this.mode_ = undefined;
  this.delta_ = 0;
  this.lastAnchor_ = null;
  this.startTime_ = undefined;
  this.timeoutId_ = undefined;
};


/**
 * Enable or disable using the mouse's location as an anchor when zooming
 * @param {boolean} useAnchor true to zoom to the mouse's location, false
 * to zoom to the center of the map
 * @api
 */
_ol_interaction_MouseWheelZoom_.prototype.setMouseAnchor = function(useAnchor) {
  this.useAnchor_ = useAnchor;
  if (!useAnchor) {
    this.lastAnchor_ = null;
  }
};


/**
 * @enum {string}
 * @private
 */
_ol_interaction_MouseWheelZoom_.Mode_ = {
  TRACKPAD: 'trackpad',
  WHEEL: 'wheel'
};
export default _ol_interaction_MouseWheelZoom_;
