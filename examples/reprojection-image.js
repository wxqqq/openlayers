import Map from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import {getCenter} from '../src/ol/extent.js';
import _ol_layer_Image_ from '../src/ol/layer/Image.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {transform} from '../src/ol/proj.js';
import _ol_source_ImageStatic_ from '../src/ol/source/ImageStatic.js';
import _ol_source_OSM_ from '../src/ol/source/OSM.js';
import {register} from '../src/ol/proj/proj4.js';
import proj4 from 'proj4';

proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
    '+x_0=400000 +y_0=-100000 +ellps=airy ' +
    '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
    '+units=m +no_defs');
register(proj4);

var imageExtent = [0, 0, 700000, 1300000];

var map = new Map({
  layers: [
    new TileLayer({
      source: new _ol_source_OSM_()
    }),
    new _ol_layer_Image_({
      source: new _ol_source_ImageStatic_({
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/' +
               'British_National_Grid.svg/2000px-British_National_Grid.svg.png',
        crossOrigin: '',
        projection: 'EPSG:27700',
        imageExtent: imageExtent
      })
    })
  ],
  target: 'map',
  view: new _ol_View_({
    center: transform(getCenter(imageExtent), 'EPSG:27700', 'EPSG:3857'),
    zoom: 4
  })
});
