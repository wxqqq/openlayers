/**
 * @module ol/control/ScaleLine
 */
import {inherits} from '../index.js';
import _ol_Object_ from '../Object.js';
import {assert} from '../asserts.js';
import Control from '../control/Control.js';
import ScaleLineUnits from '../control/ScaleLineUnits.js';
import {CLASS_UNSELECTABLE} from '../css.js';
import _ol_events_ from '../events.js';
import {getPointResolution, METERS_PER_UNIT} from '../proj.js';
import _ol_proj_Units_ from '../proj/Units.js';

/**
 * @classdesc
 * A control displaying rough y-axis distances, calculated for the center of the
 * viewport. For conformal projections (e.g. EPSG:3857, the default view
 * projection in OpenLayers), the scale is valid for all directions.
 * No scale line will be shown when the y-axis distance of a pixel at the
 * viewport center cannot be calculated in the view projection.
 * By default the scale line will show in the bottom left portion of the map,
 * but this can be changed by using the css selector `.ol-scale-line`.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {olx.control.ScaleLineOptions=} opt_options Scale line options.
 * @api
 */
var ScaleLine = function(opt_options) {

  var options = opt_options ? opt_options : {};

  var className = options.className !== undefined ? options.className : 'ol-scale-line';

  /**
   * @private
   * @type {Element}
   */
  this.innerElement_ = document.createElement('DIV');
  this.innerElement_.className = className + '-inner';

  /**
   * @private
   * @type {Element}
   */
  this.element_ = document.createElement('DIV');
  this.element_.className = className + ' ' + CLASS_UNSELECTABLE;
  this.element_.appendChild(this.innerElement_);

  /**
   * @private
   * @type {?olx.ViewState}
   */
  this.viewState_ = null;

  /**
   * @private
   * @type {number}
   */
  this.minWidth_ = options.minWidth !== undefined ? options.minWidth : 64;

  /**
   * @private
   * @type {boolean}
   */
  this.renderedVisible_ = false;

  /**
   * @private
   * @type {number|undefined}
   */
  this.renderedWidth_ = undefined;

  /**
   * @private
   * @type {string}
   */
  this.renderedHTML_ = '';

  var render = options.render ? options.render : ScaleLine.render;

  Control.call(this, {
    element: this.element_,
    render: render,
    target: options.target
  });

  _ol_events_.listen(
      this, _ol_Object_.getChangeEventType(ScaleLine.Property_.UNITS),
      this.handleUnitsChanged_, this);

  this.setUnits(/** @type {ol.control.ScaleLineUnits} */ (options.units) ||
      ScaleLineUnits.METRIC);

};

inherits(ScaleLine, Control);


/**
 * @const
 * @type {Array.<number>}
 */
ScaleLine.LEADING_DIGITS = [1, 2, 5];


/**
 * Return the units to use in the scale line.
 * @return {ol.control.ScaleLineUnits|undefined} The units to use in the scale
 *     line.
 * @observable
 * @api
 */
ScaleLine.prototype.getUnits = function() {
  return (
    /** @type {ol.control.ScaleLineUnits|undefined} */ this.get(ScaleLine.Property_.UNITS)
  );
};


/**
 * Update the scale line element.
 * @param {ol.MapEvent} mapEvent Map event.
 * @this {ol.control.ScaleLine}
 * @api
 */
ScaleLine.render = function(mapEvent) {
  var frameState = mapEvent.frameState;
  if (!frameState) {
    this.viewState_ = null;
  } else {
    this.viewState_ = frameState.viewState;
  }
  this.updateElement_();
};


/**
 * @private
 */
ScaleLine.prototype.handleUnitsChanged_ = function() {
  this.updateElement_();
};


/**
 * Set the units to use in the scale line.
 * @param {ol.control.ScaleLineUnits} units The units to use in the scale line.
 * @observable
 * @api
 */
ScaleLine.prototype.setUnits = function(units) {
  this.set(ScaleLine.Property_.UNITS, units);
};


/**
 * @private
 */
ScaleLine.prototype.updateElement_ = function() {
  var viewState = this.viewState_;

  if (!viewState) {
    if (this.renderedVisible_) {
      this.element_.style.display = 'none';
      this.renderedVisible_ = false;
    }
    return;
  }

  var center = viewState.center;
  var projection = viewState.projection;
  var units = this.getUnits();
  var pointResolutionUnits = units == ScaleLineUnits.DEGREES ?
    _ol_proj_Units_.DEGREES :
    _ol_proj_Units_.METERS;
  var pointResolution =
      getPointResolution(projection, viewState.resolution, center, pointResolutionUnits);
  if (units != ScaleLineUnits.DEGREES) {
    pointResolution *= projection.getMetersPerUnit();
  }

  var nominalCount = this.minWidth_ * pointResolution;
  var suffix = '';
  if (units == ScaleLineUnits.DEGREES) {
    var metersPerDegree = METERS_PER_UNIT[_ol_proj_Units_.DEGREES];
    if (projection.getUnits() == _ol_proj_Units_.DEGREES) {
      nominalCount *= metersPerDegree;
    } else {
      pointResolution /= metersPerDegree;
    }
    if (nominalCount < metersPerDegree / 60) {
      suffix = '\u2033'; // seconds
      pointResolution *= 3600;
    } else if (nominalCount < metersPerDegree) {
      suffix = '\u2032'; // minutes
      pointResolution *= 60;
    } else {
      suffix = '\u00b0'; // degrees
    }
  } else if (units == ScaleLineUnits.IMPERIAL) {
    if (nominalCount < 0.9144) {
      suffix = 'in';
      pointResolution /= 0.0254;
    } else if (nominalCount < 1609.344) {
      suffix = 'ft';
      pointResolution /= 0.3048;
    } else {
      suffix = 'mi';
      pointResolution /= 1609.344;
    }
  } else if (units == ScaleLineUnits.NAUTICAL) {
    pointResolution /= 1852;
    suffix = 'nm';
  } else if (units == ScaleLineUnits.METRIC) {
    if (nominalCount < 0.001) {
      suffix = 'μm';
      pointResolution *= 1000000;
    } else if (nominalCount < 1) {
      suffix = 'mm';
      pointResolution *= 1000;
    } else if (nominalCount < 1000) {
      suffix = 'm';
    } else {
      suffix = 'km';
      pointResolution /= 1000;
    }
  } else if (units == ScaleLineUnits.US) {
    if (nominalCount < 0.9144) {
      suffix = 'in';
      pointResolution *= 39.37;
    } else if (nominalCount < 1609.344) {
      suffix = 'ft';
      pointResolution /= 0.30480061;
    } else {
      suffix = 'mi';
      pointResolution /= 1609.3472;
    }
  } else if (units == ol.control.ScaleLineUnits.ZH) {
    if (nominalCount < 0.001) {
      suffix = '\u5fae\u7c73';
      pointResolution *= 1000000;
    } else if (nominalCount < 1) {
      suffix = '\u6beb\u7c73';
      pointResolution *= 1000;
    } else if (nominalCount < 1000) {
      suffix = '\u7c73';
    } else {
      suffix = '\u516c\u91cc';
      pointResolution /= 1000;
    }
  } else {
    assert(false, 33); // Invalid units
  }

  var i = 3 * Math.floor(
      Math.log(this.minWidth_ * pointResolution) / Math.log(10));
  var count, width;
  while (true) {
    count = ScaleLine.LEADING_DIGITS[((i % 3) + 3) % 3] *
        Math.pow(10, Math.floor(i / 3));
    width = Math.round(count / pointResolution);
    if (isNaN(width)) {
      this.element_.style.display = 'none';
      this.renderedVisible_ = false;
      return;
    } else if (width >= this.minWidth_) {
      break;
    }
    ++i;
  }

  var html = count + ' ' + suffix;
  if (this.renderedHTML_ != html) {
    this.innerElement_.innerHTML = html;
    this.renderedHTML_ = html;
  }

  if (this.renderedWidth_ != width) {
    this.innerElement_.style.width = width + 'px';
    this.renderedWidth_ = width;
  }

  if (!this.renderedVisible_) {
    this.element_.style.display = '';
    this.renderedVisible_ = true;
  }

};


/**
 * @enum {string}
 * @private
 */
ScaleLine.Property_ = {
  UNITS: 'units'
};
export default ScaleLine;
