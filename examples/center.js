import Map from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import {defaults as defaultControls} from '../src/ol/control.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import TileLayer from '../src/ol/layer/Tile.js';
import _ol_layer_Vector_ from '../src/ol/layer/Vector.js';
import _ol_source_OSM_ from '../src/ol/source/OSM.js';
import _ol_source_Vector_ from '../src/ol/source/Vector.js';
import _ol_style_Circle_ from '../src/ol/style/Circle.js';
import _ol_style_Fill_ from '../src/ol/style/Fill.js';
import _ol_style_Stroke_ from '../src/ol/style/Stroke.js';
import _ol_style_Style_ from '../src/ol/style/Style.js';

var source = new _ol_source_Vector_({
  url: 'data/geojson/switzerland.geojson',
  format: new GeoJSON()
});
var style = new _ol_style_Style_({
  fill: new _ol_style_Fill_({
    color: 'rgba(255, 255, 255, 0.6)'
  }),
  stroke: new _ol_style_Stroke_({
    color: '#319FD3',
    width: 1
  }),
  image: new _ol_style_Circle_({
    radius: 5,
    fill: new _ol_style_Fill_({
      color: 'rgba(255, 255, 255, 0.6)'
    }),
    stroke: new _ol_style_Stroke_({
      color: '#319FD3',
      width: 1
    })
  })
});
var vectorLayer = new _ol_layer_Vector_({
  source: source,
  style: style
});
var view = new _ol_View_({
  center: [0, 0],
  zoom: 1
});
var map = new Map({
  layers: [
    new TileLayer({
      source: new _ol_source_OSM_()
    }),
    vectorLayer
  ],
  target: 'map',
  controls: defaultControls({
    attributionOptions: {
      collapsible: false
    }
  }),
  view: view
});

var zoomtoswitzerlandbest = document.getElementById('zoomtoswitzerlandbest');
zoomtoswitzerlandbest.addEventListener('click', function() {
  var feature = source.getFeatures()[0];
  var polygon = /** @type {ol.geom.SimpleGeometry} */ (feature.getGeometry());
  view.fit(polygon, {padding: [170, 50, 30, 150], constrainResolution: false});
}, false);

var zoomtoswitzerlandconstrained =
    document.getElementById('zoomtoswitzerlandconstrained');
zoomtoswitzerlandconstrained.addEventListener('click', function() {
  var feature = source.getFeatures()[0];
  var polygon = /** @type {ol.geom.SimpleGeometry} */ (feature.getGeometry());
  view.fit(polygon, {padding: [170, 50, 30, 150]});
}, false);

var zoomtoswitzerlandnearest =
    document.getElementById('zoomtoswitzerlandnearest');
zoomtoswitzerlandnearest.addEventListener('click', function() {
  var feature = source.getFeatures()[0];
  var polygon = /** @type {ol.geom.SimpleGeometry} */ (feature.getGeometry());
  view.fit(polygon, {padding: [170, 50, 30, 150], nearest: true});
}, false);

var zoomtolausanne = document.getElementById('zoomtolausanne');
zoomtolausanne.addEventListener('click', function() {
  var feature = source.getFeatures()[1];
  var point = /** @type {ol.geom.SimpleGeometry} */ (feature.getGeometry());
  view.fit(point, {padding: [170, 50, 30, 150], minResolution: 50});
}, false);

var centerlausanne = document.getElementById('centerlausanne');
centerlausanne.addEventListener('click', function() {
  var feature = source.getFeatures()[1];
  var point = /** @type {ol.geom.Point} */ (feature.getGeometry());
  var size = /** @type {ol.Size} */ (map.getSize());
  view.centerOn(point.getCoordinates(), size, [570, 500]);
}, false);
