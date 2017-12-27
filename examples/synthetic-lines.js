import _ol_Feature_ from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import LineString from '../src/ol/geom/LineString.js';
import _ol_layer_Vector_ from '../src/ol/layer/Vector.js';
import _ol_source_Vector_ from '../src/ol/source/Vector.js';
import _ol_style_Stroke_ from '../src/ol/style/Stroke.js';
import _ol_style_Style_ from '../src/ol/style/Style.js';


var count = 10000;
var features = new Array(count);

var startPoint = [0, 0];
var endPoint;

var delta, deltaX, deltaY;
var signX = 1;
var signY = -1;

// Create a square spiral.
var i;
for (i = 0; i < count; ++i) {
  delta = (i + 1) * 2500;
  if (i % 2 === 0) {
    signY *= -1;
  } else {
    signX *= -1;
  }
  deltaX = delta * signX;
  deltaY = delta * signY;
  endPoint = [startPoint[0] + deltaX, startPoint[1] + deltaY];
  features[i] = new _ol_Feature_({
    'geometry': new LineString([startPoint, endPoint])
  });
  startPoint = endPoint;
}

var vector = new _ol_layer_Vector_({
  source: new _ol_source_Vector_({
    features: features,
    wrapX: false
  }),
  style: new _ol_style_Style_({
    stroke: new _ol_style_Stroke_({
      color: '#666666',
      width: 1
    })
  })
});

var view = new _ol_View_({
  center: [0, 0],
  zoom: 0
});

var map = new Map({
  layers: [vector],
  target: 'map',
  view: view
});
