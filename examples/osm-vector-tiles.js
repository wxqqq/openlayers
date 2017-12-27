import Map from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import TopoJSON from '../src/ol/format/TopoJSON.js';
import _ol_layer_VectorTile_ from '../src/ol/layer/VectorTile.js';
import {fromLonLat} from '../src/ol/proj.js';
import _ol_source_VectorTile_ from '../src/ol/source/VectorTile.js';
import _ol_style_Fill_ from '../src/ol/style/Fill.js';
import _ol_style_Stroke_ from '../src/ol/style/Stroke.js';
import _ol_style_Style_ from '../src/ol/style/Style.js';

var key = 'vector-tiles-5eJz6JX';

var roadStyleCache = {};
var roadColor = {
  'major_road': '#776',
  'minor_road': '#ccb',
  'highway': '#f39'
};
var buildingStyle = new _ol_style_Style_({
  fill: new _ol_style_Fill_({
    color: '#666',
    opacity: 0.4
  }),
  stroke: new _ol_style_Stroke_({
    color: '#444',
    width: 1
  })
});
var waterStyle = new _ol_style_Style_({
  fill: new _ol_style_Fill_({
    color: '#9db9e8'
  })
});
var roadStyle = function(feature) {
  var kind = feature.get('kind');
  var railway = feature.get('railway');
  var sort_key = feature.get('sort_key');
  var styleKey = kind + '/' + railway + '/' + sort_key;
  var style = roadStyleCache[styleKey];
  if (!style) {
    var color, width;
    if (railway) {
      color = '#7de';
      width = 1;
    } else {
      color = roadColor[kind];
      width = kind == 'highway' ? 1.5 : 1;
    }
    style = new _ol_style_Style_({
      stroke: new _ol_style_Stroke_({
        color: color,
        width: width
      }),
      zIndex: sort_key
    });
    roadStyleCache[styleKey] = style;
  }
  return style;
};

var map = new Map({
  layers: [
    new _ol_layer_VectorTile_({
      source: new _ol_source_VectorTile_({
        attributions: '&copy; OpenStreetMap contributors, Who’s On First, ' +
            'Natural Earth, and openstreetmapdata.com',
        format: new TopoJSON({
          layerName: 'layer',
          layers: ['water', 'roads', 'buildings']
        }),
        maxZoom: 19,
        url: 'https://tile.mapzen.com/mapzen/vector/v1/all/{z}/{x}/{y}.topojson?api_key=' + key
      }),
      style: function(feature, resolution) {
        switch (feature.get('layer')) {
          case 'water': return waterStyle;
          case 'roads': return roadStyle(feature);
          case 'buildings': return (resolution < 10) ? buildingStyle : null;
          default: return null;
        }
      }
    })
  ],
  target: 'map',
  view: new _ol_View_({
    center: fromLonLat([-74.0064, 40.7142]),
    maxZoom: 19,
    zoom: 15
  })
});
