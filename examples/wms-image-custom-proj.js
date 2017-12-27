import Map from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import {defaults as defaultControls} from '../src/ol/control.js';
import ScaleLine from '../src/ol/control/ScaleLine.js';
import _ol_layer_Image_ from '../src/ol/layer/Image.js';
import {fromLonLat} from '../src/ol/proj.js';
import _ol_proj_Projection_ from '../src/ol/proj/Projection.js';
import _ol_source_ImageWMS_ from '../src/ol/source/ImageWMS.js';
import {register} from '../src/ol/proj/proj4.js';
import proj4 from 'proj4';


// Transparent Proj4js support:
//
// EPSG:21781 is known to Proj4js because its definition is registered by
// calling proj4.defs(). Now when we create an ol/proj/Projection instance with
// the 'EPSG:21781' code, OpenLayers will pick up the transform functions from
// Proj4js. To get the registered ol/proj/Projection instance with other
// parameters like units and axis orientation applied from Proj4js, use
// `ol/proj#get('EPSG:21781')`.
//
// Note that we are setting the projection's extent here, which is used to
// determine the view resolution for zoom level 0. Recommended values for a
// projection's validity extent can be found at https://epsg.io/.

proj4.defs('EPSG:21781',
    '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 ' +
    '+x_0=600000 +y_0=200000 +ellps=bessel ' +
    '+towgs84=660.077,13.551,369.344,2.484,1.783,2.939,5.66 +units=m +no_defs');
register(proj4);

var projection = new _ol_proj_Projection_({
  code: 'EPSG:21781',
  extent: [485869.5728, 76443.1884, 837076.5648, 299941.7864]
});

var extent = [420000, 30000, 900000, 350000];
var layers = [
  new _ol_layer_Image_({
    extent: extent,
    source: new _ol_source_ImageWMS_({
      url: 'https://wms.geo.admin.ch/',
      crossOrigin: 'anonymous',
      attributions: '© <a href="http://www.geo.admin.ch/internet/geoportal/' +
          'en/home.html">Pixelmap 1:1000000 / geo.admin.ch</a>',
      params: {
        'LAYERS': 'ch.swisstopo.pixelkarte-farbe-pk1000.noscale',
        'FORMAT': 'image/jpeg'
      },
      serverType: 'mapserver'
    })
  }),
  new _ol_layer_Image_({
    extent: extent,
    source: new _ol_source_ImageWMS_({
      url: 'https://wms.geo.admin.ch/',
      crossOrigin: 'anonymous',
      attributions: '© <a href="http://www.geo.admin.ch/internet/geoportal/' +
          'en/home.html">National parks / geo.admin.ch</a>',
      params: {'LAYERS': 'ch.bafu.schutzgebiete-paerke_nationaler_bedeutung'},
      serverType: 'mapserver'
    })
  })
];

var map = new Map({
  controls: defaultControls().extend([
    new ScaleLine()
  ]),
  layers: layers,
  target: 'map',
  view: new _ol_View_({
    projection: projection,
    center: fromLonLat([8.23, 46.86], projection),
    extent: extent,
    zoom: 2
  })
});
