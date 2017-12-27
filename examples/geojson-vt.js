// NOCOMPILE
import Map from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import _ol_source_OSM_ from '../src/ol/source/OSM.js';
import _ol_source_VectorTile_ from '../src/ol/source/VectorTile.js';
import TileLayer from '../src/ol/layer/Tile.js';
import _ol_layer_VectorTile_ from '../src/ol/layer/VectorTile.js';
import _ol_proj_Projection_ from '../src/ol/proj/Projection.js';


var replacer = function(key, value) {
  if (value.geometry) {
    var type;
    var rawType = value.type;
    var geometry = value.geometry;

    if (rawType === 1) {
      type = 'MultiPoint';
      if (geometry.length == 1) {
        type = 'Point';
        geometry = geometry[0];
      }
    } else if (rawType === 2) {
      type = 'MultiLineString';
      if (geometry.length == 1) {
        type = 'LineString';
        geometry = geometry[0];
      }
    } else if (rawType === 3) {
      type = 'Polygon';
      if (geometry.length > 1) {
        type = 'MultiPolygon';
        geometry = [geometry];
      }
    }

    return {
      'type': 'Feature',
      'geometry': {
        'type': type,
        'coordinates': geometry
      },
      'properties': value.tags
    };
  } else {
    return value;
  }
};

var tilePixels = new _ol_proj_Projection_({
  code: 'TILE_PIXELS',
  units: 'tile-pixels'
});

var map = new Map({
  layers: [
    new TileLayer({
      source: new _ol_source_OSM_()
    })
  ],
  target: 'map',
  view: new _ol_View_({
    center: [0, 0],
    zoom: 2
  })
});

var url = 'data/geojson/countries.geojson';
fetch(url).then(function(response) {
  return response.json();
}).then(function(json) {
  var tileIndex = geojsonvt(json, {
    extent: 4096,
    debug: 1
  });
  var vectorSource = new _ol_source_VectorTile_({
    format: new GeoJSON(),
    tileLoadFunction: function(tile) {
      var format = tile.getFormat();
      var tileCoord = tile.getTileCoord();
      var data = tileIndex.getTile(tileCoord[0], tileCoord[1], -tileCoord[2] - 1);

      var features = format.readFeatures(
          JSON.stringify({
            type: 'FeatureCollection',
            features: data ? data.features : []
          }, replacer));
      tile.setLoader(function() {
        tile.setFeatures(features);
        tile.setProjection(tilePixels);
      });
    },
    url: 'data:' // arbitrary url, we don't use it in the tileLoadFunction
  });
  var vectorLayer = new _ol_layer_VectorTile_({
    source: vectorSource
  });
  map.addLayer(vectorLayer);
});
