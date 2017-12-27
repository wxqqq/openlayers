// NOCOMPILE
// this example uses turf.js for which we don't have an externs file.
import Map from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import TileLayer from '../src/ol/layer/Tile.js';
import _ol_layer_Vector_ from '../src/ol/layer/Vector.js';
import {fromLonLat} from '../src/ol/proj.js';
import _ol_source_OSM_ from '../src/ol/source/OSM.js';
import _ol_source_Vector_ from '../src/ol/source/Vector.js';


var source = new _ol_source_Vector_();
fetch('data/geojson/roads-seoul.geojson').then(function(response) {
  return response.json();
}).then(function(json) {
  var format = new GeoJSON();
  var features = format.readFeatures(json);
  var street = features[0];

  // convert to a turf.js feature
  var turfLine = format.writeFeatureObject(street);

  // show a marker every 200 meters
  var distance = 0.2;

  // get the line length in kilometers
  var length = turf.lineDistance(turfLine, 'kilometers');
  for (var i = 1; i <= length / distance; i++) {
    var turfPoint = turf.along(turfLine, i * distance, 'kilometers');

    // convert the generated point to a OpenLayers feature
    var marker = format.readFeature(turfPoint);
    marker.getGeometry().transform('EPSG:4326', 'EPSG:3857');
    source.addFeature(marker);
  }

  street.getGeometry().transform('EPSG:4326', 'EPSG:3857');
  source.addFeature(street);
});
var vectorLayer = new _ol_layer_Vector_({
  source: source
});

var rasterLayer = new TileLayer({
  source: new _ol_source_OSM_()
});

var map = new Map({
  layers: [rasterLayer, vectorLayer],
  target: document.getElementById('map'),
  view: new _ol_View_({
    center: fromLonLat([126.980366, 37.526540]),
    zoom: 15
  })
});
