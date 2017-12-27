import {inherits} from '../src/ol/index.js';
import _ol_Feature_ from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import LineString from '../src/ol/geom/LineString.js';
import Point from '../src/ol/geom/Point.js';
import Polygon from '../src/ol/geom/Polygon.js';
import {defaults as defaultInteractions} from '../src/ol/interaction.js';
import _ol_interaction_Pointer_ from '../src/ol/interaction/Pointer.js';
import TileLayer from '../src/ol/layer/Tile.js';
import _ol_layer_Vector_ from '../src/ol/layer/Vector.js';
import _ol_source_TileJSON_ from '../src/ol/source/TileJSON.js';
import _ol_source_Vector_ from '../src/ol/source/Vector.js';
import _ol_style_Fill_ from '../src/ol/style/Fill.js';
import _ol_style_Icon_ from '../src/ol/style/Icon.js';
import _ol_style_Stroke_ from '../src/ol/style/Stroke.js';
import _ol_style_Style_ from '../src/ol/style/Style.js';


/**
 * Define a namespace for the application.
 */
var app = {};


/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
app.Drag = function() {

  _ol_interaction_Pointer_.call(this, {
    handleDownEvent: app.Drag.prototype.handleDownEvent,
    handleDragEvent: app.Drag.prototype.handleDragEvent,
    handleMoveEvent: app.Drag.prototype.handleMoveEvent,
    handleUpEvent: app.Drag.prototype.handleUpEvent
  });

  /**
   * @type {ol.Pixel}
   * @private
   */
  this.coordinate_ = null;

  /**
   * @type {string|undefined}
   * @private
   */
  this.cursor_ = 'pointer';

  /**
   * @type {ol.Feature}
   * @private
   */
  this.feature_ = null;

  /**
   * @type {string|undefined}
   * @private
   */
  this.previousCursor_ = undefined;

};
inherits(app.Drag, _ol_interaction_Pointer_);


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
app.Drag.prototype.handleDownEvent = function(evt) {
  var map = evt.map;

  var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature) {
        return feature;
      });

  if (feature) {
    this.coordinate_ = evt.coordinate;
    this.feature_ = feature;
  }

  return !!feature;
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
app.Drag.prototype.handleDragEvent = function(evt) {
  var deltaX = evt.coordinate[0] - this.coordinate_[0];
  var deltaY = evt.coordinate[1] - this.coordinate_[1];

  var geometry = this.feature_.getGeometry();
  geometry.translate(deltaX, deltaY);

  this.coordinate_[0] = evt.coordinate[0];
  this.coordinate_[1] = evt.coordinate[1];
};


/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
app.Drag.prototype.handleMoveEvent = function(evt) {
  if (this.cursor_) {
    var map = evt.map;
    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature) {
          return feature;
        });
    var element = evt.map.getTargetElement();
    if (feature) {
      if (element.style.cursor != this.cursor_) {
        this.previousCursor_ = element.style.cursor;
        element.style.cursor = this.cursor_;
      }
    } else if (this.previousCursor_ !== undefined) {
      element.style.cursor = this.previousCursor_;
      this.previousCursor_ = undefined;
    }
  }
};


/**
 * @return {boolean} `false` to stop the drag sequence.
 */
app.Drag.prototype.handleUpEvent = function() {
  this.coordinate_ = null;
  this.feature_ = null;
  return false;
};


var pointFeature = new _ol_Feature_(new Point([0, 0]));

var lineFeature = new _ol_Feature_(
    new LineString([[-1e7, 1e6], [-1e6, 3e6]]));

var polygonFeature = new _ol_Feature_(
    new Polygon([[[-3e6, -1e6], [-3e6, 1e6],
      [-1e6, 1e6], [-1e6, -1e6], [-3e6, -1e6]]]));


var map = new Map({
  interactions: defaultInteractions().extend([new app.Drag()]),
  layers: [
    new TileLayer({
      source: new _ol_source_TileJSON_({
        url: 'https://api.tiles.mapbox.com/v3/mapbox.geography-class.json?secure'
      })
    }),
    new _ol_layer_Vector_({
      source: new _ol_source_Vector_({
        features: [pointFeature, lineFeature, polygonFeature]
      }),
      style: new _ol_style_Style_({
        image: new _ol_style_Icon_(/** @type {olx.style.IconOptions} */ ({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          opacity: 0.95,
          src: 'data/icon.png'
        })),
        stroke: new _ol_style_Stroke_({
          width: 3,
          color: [255, 0, 0, 1]
        }),
        fill: new _ol_style_Fill_({
          color: [0, 0, 255, 0.6]
        })
      })
    })
  ],
  target: 'map',
  view: new _ol_View_({
    center: [0, 0],
    zoom: 2
  })
});
