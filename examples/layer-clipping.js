import Map from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import {defaults as defaultControls} from '../src/ol/control.js';
import TileLayer from '../src/ol/layer/Tile.js';
import _ol_source_OSM_ from '../src/ol/source/OSM.js';

var osm = new TileLayer({
  source: new _ol_source_OSM_()
});

var map = new Map({
  layers: [osm],
  target: 'map',
  controls: defaultControls({
    attributionOptions: {
      collapsible: false
    }
  }),
  view: new _ol_View_({
    center: [0, 0],
    zoom: 2
  })
});

osm.on('precompose', function(event) {
  var ctx = event.context;
  ctx.save();
  var pixelRatio = event.frameState.pixelRatio;
  var size = map.getSize();
  ctx.translate(size[0] / 2 * pixelRatio, size[1] / 2 * pixelRatio);
  ctx.scale(3 * pixelRatio, 3 * pixelRatio);
  ctx.translate(-75, -80);
  ctx.beginPath();
  ctx.moveTo(75, 40);
  ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
  ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
  ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
  ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
  ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
  ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
  ctx.clip();
  ctx.translate(75, 80);
  ctx.scale(1 / 3 / pixelRatio, 1 / 3 / pixelRatio);
  ctx.translate(-size[0] / 2 * pixelRatio, -size[1] / 2 * pixelRatio);
});

osm.on('postcompose', function(event) {
  var ctx = event.context;
  ctx.restore();
});
