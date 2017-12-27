import Map from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import {defaults as defaultControls} from '../src/ol/control.js';
import OverviewMap from '../src/ol/control/OverviewMap.js';
import TileLayer from '../src/ol/layer/Tile.js';
import _ol_source_OSM_ from '../src/ol/source/OSM.js';

var map = new Map({
  controls: defaultControls().extend([
    new OverviewMap()
  ]),
  layers: [
    new TileLayer({
      source: new _ol_source_OSM_()
    })
  ],
  target: 'map',
  view: new _ol_View_({
    center: [500000, 6000000],
    zoom: 7
  })
});
