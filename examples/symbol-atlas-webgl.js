import _ol_Feature_ from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import Point from '../src/ol/geom/Point.js';
import _ol_layer_Vector_ from '../src/ol/layer/Vector.js';
import _ol_source_Vector_ from '../src/ol/source/Vector.js';
import _ol_style_AtlasManager_ from '../src/ol/style/AtlasManager.js';
import _ol_style_Circle_ from '../src/ol/style/Circle.js';
import _ol_style_Fill_ from '../src/ol/style/Fill.js';
import _ol_style_RegularShape_ from '../src/ol/style/RegularShape.js';
import _ol_style_Stroke_ from '../src/ol/style/Stroke.js';
import _ol_style_Style_ from '../src/ol/style/Style.js';

var atlasManager = new _ol_style_AtlasManager_({
  // we increase the initial size so that all symbols fit into
  // a single atlas image
  initialSize: 512
});

var symbolInfo = [{
  opacity: 1.0,
  scale: 1.0,
  fillColor: 'rgba(255, 153, 0, 0.4)',
  strokeColor: 'rgba(255, 204, 0, 0.2)'
}, {
  opacity: 0.75,
  scale: 1.25,
  fillColor: 'rgba(70, 80, 224, 0.4)',
  strokeColor: 'rgba(12, 21, 138, 0.2)'
}, {
  opacity: 0.5,
  scale: 1.5,
  fillColor: 'rgba(66, 150, 79, 0.4)',
  strokeColor: 'rgba(20, 99, 32, 0.2)'
}, {
  opacity: 1.0,
  scale: 1.0,
  fillColor: 'rgba(176, 61, 35, 0.4)',
  strokeColor: 'rgba(145, 43, 20, 0.2)'
}];

var radiuses = [3, 6, 9, 15, 19, 25];
var symbolCount = symbolInfo.length * radiuses.length * 2;
var symbols = [];
var i, j;
for (i = 0; i < symbolInfo.length; ++i) {
  var info = symbolInfo[i];
  for (j = 0; j < radiuses.length; ++j) {
    // circle symbol
    symbols.push(new _ol_style_Circle_({
      opacity: info.opacity,
      scale: info.scale,
      radius: radiuses[j],
      fill: new _ol_style_Fill_({
        color: info.fillColor
      }),
      stroke: new _ol_style_Stroke_({
        color: info.strokeColor,
        width: 1
      }),
      // by passing the atlas manager to the symbol,
      // the symbol will be added to an atlas
      atlasManager: atlasManager
    }));

    // star symbol
    symbols.push(new _ol_style_RegularShape_({
      points: 8,
      opacity: info.opacity,
      scale: info.scale,
      radius: radiuses[j],
      radius2: radiuses[j] * 0.7,
      angle: 1.4,
      fill: new _ol_style_Fill_({
        color: info.fillColor
      }),
      stroke: new _ol_style_Stroke_({
        color: info.strokeColor,
        width: 1
      }),
      atlasManager: atlasManager
    }));
  }
}

var featureCount = 50000;
var features = new Array(featureCount);
var feature, geometry;
var e = 25000000;
for (i = 0; i < featureCount; ++i) {
  geometry = new Point(
      [2 * e * Math.random() - e, 2 * e * Math.random() - e]);
  feature = new _ol_Feature_(geometry);
  feature.setStyle(
      new _ol_style_Style_({
        image: symbols[i % symbolCount]
      })
  );
  features[i] = feature;
}

var vectorSource = new _ol_source_Vector_({
  features: features
});
var vector = new _ol_layer_Vector_({
  source: vectorSource
});

var map = new Map({
  renderer: /** @type {Array<ol.renderer.Type>} */ (['webgl', 'canvas']),
  layers: [vector],
  target: document.getElementById('map'),
  view: new _ol_View_({
    center: [0, 0],
    zoom: 4
  })
});
