import Map from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import GPX from '../src/ol/format/GPX.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import IGC from '../src/ol/format/IGC.js';
import KML from '../src/ol/format/KML.js';
import TopoJSON from '../src/ol/format/TopoJSON.js';
import {defaults as defaultInteractions} from '../src/ol/interaction.js';
import DragAndDrop from '../src/ol/interaction/DragAndDrop.js';
import TileLayer from '../src/ol/layer/Tile.js';
import _ol_layer_Vector_ from '../src/ol/layer/Vector.js';
import _ol_source_BingMaps_ from '../src/ol/source/BingMaps.js';
import _ol_source_Vector_ from '../src/ol/source/Vector.js';
import _ol_style_Circle_ from '../src/ol/style/Circle.js';
import _ol_style_Fill_ from '../src/ol/style/Fill.js';
import _ol_style_Stroke_ from '../src/ol/style/Stroke.js';
import _ol_style_Style_ from '../src/ol/style/Style.js';


var defaultStyle = {
  'Point': new _ol_style_Style_({
    image: new _ol_style_Circle_({
      fill: new _ol_style_Fill_({
        color: 'rgba(255,255,0,0.5)'
      }),
      radius: 5,
      stroke: new _ol_style_Stroke_({
        color: '#ff0',
        width: 1
      })
    })
  }),
  'LineString': new _ol_style_Style_({
    stroke: new _ol_style_Stroke_({
      color: '#f00',
      width: 3
    })
  }),
  'Polygon': new _ol_style_Style_({
    fill: new _ol_style_Fill_({
      color: 'rgba(0,255,255,0.5)'
    }),
    stroke: new _ol_style_Stroke_({
      color: '#0ff',
      width: 1
    })
  }),
  'MultiPoint': new _ol_style_Style_({
    image: new _ol_style_Circle_({
      fill: new _ol_style_Fill_({
        color: 'rgba(255,0,255,0.5)'
      }),
      radius: 5,
      stroke: new _ol_style_Stroke_({
        color: '#f0f',
        width: 1
      })
    })
  }),
  'MultiLineString': new _ol_style_Style_({
    stroke: new _ol_style_Stroke_({
      color: '#0f0',
      width: 3
    })
  }),
  'MultiPolygon': new _ol_style_Style_({
    fill: new _ol_style_Fill_({
      color: 'rgba(0,0,255,0.5)'
    }),
    stroke: new _ol_style_Stroke_({
      color: '#00f',
      width: 1
    })
  })
};

var styleFunction = function(feature, resolution) {
  var featureStyleFunction = feature.getStyleFunction();
  if (featureStyleFunction) {
    return featureStyleFunction.call(feature, resolution);
  } else {
    return defaultStyle[feature.getGeometry().getType()];
  }
};

var dragAndDropInteraction = new DragAndDrop({
  formatConstructors: [
    GPX,
    GeoJSON,
    IGC,
    KML,
    TopoJSON
  ]
});

var map = new Map({
  interactions: defaultInteractions().extend([dragAndDropInteraction]),
  layers: [
    new TileLayer({
      source: new _ol_source_BingMaps_({
        imagerySet: 'Aerial',
        key: 'As1HiMj1PvLPlqc_gtM7AqZfBL8ZL3VrjaS3zIb22Uvb9WKhuJObROC-qUpa81U5'
      })
    })
  ],
  target: 'map',
  view: new _ol_View_({
    center: [0, 0],
    zoom: 2
  })
});

dragAndDropInteraction.on('addfeatures', function(event) {
  var vectorSource = new _ol_source_Vector_({
    features: event.features
  });
  map.addLayer(new _ol_layer_Vector_({
    source: vectorSource,
    style: styleFunction
  }));
  map.getView().fit(vectorSource.getExtent());
});

var displayFeatureInfo = function(pixel) {
  var features = [];
  map.forEachFeatureAtPixel(pixel, function(feature) {
    features.push(feature);
  });
  if (features.length > 0) {
    var info = [];
    var i, ii;
    for (i = 0, ii = features.length; i < ii; ++i) {
      info.push(features[i].get('name'));
    }
    document.getElementById('info').innerHTML = info.join(', ') || '&nbsp';
  } else {
    document.getElementById('info').innerHTML = '&nbsp;';
  }
};

map.on('pointermove', function(evt) {
  if (evt.dragging) {
    return;
  }
  var pixel = map.getEventPixel(evt.originalEvent);
  displayFeatureInfo(pixel);
});

map.on('click', function(evt) {
  displayFeatureInfo(evt.pixel);
});
