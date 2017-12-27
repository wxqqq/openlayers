import Map from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import WKT from '../src/ol/format/WKT.js';
import TileLayer from '../src/ol/layer/Tile.js';
import _ol_layer_Vector_ from '../src/ol/layer/Vector.js';
import _ol_source_OSM_ from '../src/ol/source/OSM.js';
import _ol_source_Vector_ from '../src/ol/source/Vector.js';

var raster = new TileLayer({
  source: new _ol_source_OSM_()
});

var wkt = 'POLYGON((10.689 -25.092, 34.595 ' +
    '-20.170, 38.814 -35.639, 13.502 ' +
    '-39.155, 10.689 -25.092))';

var format = new WKT();

var feature = format.readFeature(wkt, {
  dataProjection: 'EPSG:4326',
  featureProjection: 'EPSG:3857'
});

var vector = new _ol_layer_Vector_({
  source: new _ol_source_Vector_({
    features: [feature]
  })
});

var map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new _ol_View_({
    center: [2952104.0199, -3277504.823],
    zoom: 4
  })
});
