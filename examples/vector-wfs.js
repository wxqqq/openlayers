import Map from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import TileLayer from '../src/ol/layer/Tile.js';
import _ol_layer_Vector_ from '../src/ol/layer/Vector.js';
import _ol_loadingstrategy_ from '../src/ol/loadingstrategy.js';
import _ol_source_BingMaps_ from '../src/ol/source/BingMaps.js';
import _ol_source_Vector_ from '../src/ol/source/Vector.js';
import _ol_style_Stroke_ from '../src/ol/style/Stroke.js';
import _ol_style_Style_ from '../src/ol/style/Style.js';


var vectorSource = new _ol_source_Vector_({
  format: new GeoJSON(),
  url: function(extent) {
    return 'https://ahocevar.com/geoserver/wfs?service=WFS&' +
        'version=1.1.0&request=GetFeature&typename=osm:water_areas&' +
        'outputFormat=application/json&srsname=EPSG:3857&' +
        'bbox=' + extent.join(',') + ',EPSG:3857';
  },
  strategy: _ol_loadingstrategy_.bbox
});


var vector = new _ol_layer_Vector_({
  source: vectorSource,
  style: new _ol_style_Style_({
    stroke: new _ol_style_Stroke_({
      color: 'rgba(0, 0, 255, 1.0)',
      width: 2
    })
  })
});

var raster = new TileLayer({
  source: new _ol_source_BingMaps_({
    imagerySet: 'Aerial',
    key: 'As1HiMj1PvLPlqc_gtM7AqZfBL8ZL3VrjaS3zIb22Uvb9WKhuJObROC-qUpa81U5'
  })
});

var map = new Map({
  layers: [raster, vector],
  target: document.getElementById('map'),
  view: new _ol_View_({
    center: [-8908887.277395891, 5381918.072437216],
    maxZoom: 19,
    zoom: 12
  })
});
