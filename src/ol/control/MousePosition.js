/**
 * @module ol/control/MousePosition
 */

import {inherits} from '../index.js';
import _ol_events_ from '../events.js';
import EventType from '../events/EventType.js';
import _ol_Object_ from '../Object.js';
import Control from '../control/Control.js';
import {getTransformFromProjections, identityTransform, get as getProjection} from '../proj.js';

/**
 * @classdesc
 * A control to show the 2D coordinates of the mouse cursor. By default, these
 * are in the view projection, but can be in any supported projection.
 * By default the control is shown in the top right corner of the map, but this
 * can be changed by using the css selector `.ol-mouse-position`.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {olx.control.MousePositionOptions=} opt_options Mouse position
 *     options.
 * @api
 */
var MousePosition = function(opt_options) {

  var options = opt_options ? opt_options : {};

  var element = document.createElement('DIV');
  element.className = options.className !== undefined ? options.className : 'ol-mouse-position';

  var render = options.render ?
    options.render : MousePosition.render;

  Control.call(this, {
    element: element,
    render: render,
    target: options.target
  });

  _ol_events_.listen(this,
      _ol_Object_.getChangeEventType(MousePosition.Property_.PROJECTION),
      this.handleProjectionChanged_, this);

  if (options.coordinateFormat) {
    this.setCoordinateFormat(options.coordinateFormat);
  }
  if (options.projection) {
    this.setProjection(options.projection);
  }

  /**
   * @private
   * @type {string}
   */
  this.undefinedHTML_ = options.undefinedHTML !== undefined ? options.undefinedHTML : '';

  /**
   * @private
   * @type {string}
   */
  this.renderedHTML_ = element.innerHTML;

  /**
   * @private
   * @type {ol.proj.Projection}
   */
  this.mapProjection_ = null;

  /**
   * @private
   * @type {?ol.TransformFunction}
   */
  this.transform_ = null;

  /**
   * @private
   * @type {ol.Pixel}
   */
  this.lastMouseMovePixel_ = null;

};

inherits(MousePosition, Control);


/**
 * Update the mouseposition element.
 * @param {ol.MapEvent} mapEvent Map event.
 * @this {ol.control.MousePosition}
 * @api
 */
MousePosition.render = function(mapEvent) {
  var frameState = mapEvent.frameState;
  if (!frameState) {
    this.mapProjection_ = null;
  } else {
    if (this.mapProjection_ != frameState.viewState.projection) {
      this.mapProjection_ = frameState.viewState.projection;
      this.transform_ = null;
    }
  }
  this.updateHTML_(this.lastMouseMovePixel_);
};


/**
 * @private
 */
MousePosition.prototype.handleProjectionChanged_ = function() {
  this.transform_ = null;
};


/**
 * Return the coordinate format type used to render the current position or
 * undefined.
 * @return {ol.CoordinateFormatType|undefined} The format to render the current
 *     position in.
 * @observable
 * @api
 */
MousePosition.prototype.getCoordinateFormat = function() {
  return (
    /** @type {ol.CoordinateFormatType|undefined} */ this.get(MousePosition.Property_.COORDINATE_FORMAT)
  );
};


/**
 * Return the projection that is used to report the mouse position.
 * @return {ol.proj.Projection|undefined} The projection to report mouse
 *     position in.
 * @observable
 * @api
 */
MousePosition.prototype.getProjection = function() {
  return (
    /** @type {ol.proj.Projection|undefined} */ this.get(MousePosition.Property_.PROJECTION)
  );
};


/**
 * @param {Event} event Browser event.
 * @protected
 */
MousePosition.prototype.handleMouseMove = function(event) {
  var map = this.getMap();
  this.lastMouseMovePixel_ = map.getEventPixel(event);
  this.updateHTML_(this.lastMouseMovePixel_);
};


/**
 * @param {Event} event Browser event.
 * @protected
 */
MousePosition.prototype.handleMouseOut = function(event) {
  this.updateHTML_(null);
  this.lastMouseMovePixel_ = null;
};


/**
 * @inheritDoc
 * @api
 */
MousePosition.prototype.setMap = function(map) {
  Control.prototype.setMap.call(this, map);
  if (map) {
    var viewport = map.getViewport();
    this.listenerKeys.push(
        _ol_events_.listen(viewport, EventType.MOUSEMOVE,
            this.handleMouseMove, this),
        _ol_events_.listen(viewport, EventType.MOUSEOUT,
            this.handleMouseOut, this)
    );
  }
};


/**
 * Set the coordinate format type used to render the current position.
 * @param {ol.CoordinateFormatType} format The format to render the current
 *     position in.
 * @observable
 * @api
 */
MousePosition.prototype.setCoordinateFormat = function(format) {
  this.set(MousePosition.Property_.COORDINATE_FORMAT, format);
};


/**
 * Set the projection that is used to report the mouse position.
 * @param {ol.ProjectionLike} projection The projection to report mouse
 *     position in.
 * @observable
 * @api
 */
MousePosition.prototype.setProjection = function(projection) {
  this.set(MousePosition.Property_.PROJECTION, getProjection(projection));
};


/**
 * @param {?ol.Pixel} pixel Pixel.
 * @private
 */
MousePosition.prototype.updateHTML_ = function(pixel) {
  var html = this.undefinedHTML_;
  if (pixel && this.mapProjection_) {
    if (!this.transform_) {
      var projection = this.getProjection();
      if (projection) {
        this.transform_ = getTransformFromProjections(
            this.mapProjection_, projection);
      } else {
        this.transform_ = identityTransform;
      }
    }
    var map = this.getMap();
    var coordinate = map.getCoordinateFromPixel(pixel);
    if (coordinate) {
      this.transform_(coordinate, coordinate);
      var coordinateFormat = this.getCoordinateFormat();
      if (coordinateFormat) {
        html = coordinateFormat(coordinate);
      } else {
        html = coordinate.toString();
      }
    }
  }
  if (!this.renderedHTML_ || html != this.renderedHTML_) {
    this.element.innerHTML = html;
    this.renderedHTML_ = html;
  }
};


/**
 * @enum {string}
 * @private
 */
MousePosition.Property_ = {
  PROJECTION: 'projection',
  COORDINATE_FORMAT: 'coordinateFormat'
};
export default MousePosition;
