import Map from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import _ol_layer_Image_ from '../src/ol/layer/Image.js';
import _ol_source_ImageWMS_ from '../src/ol/source/ImageWMS.js';


var wmsSource = new _ol_source_ImageWMS_({
  url: 'https://ahocevar.com/geoserver/wms',
  params: {'LAYERS': 'ne:ne'},
  serverType: 'geoserver',
  crossOrigin: 'anonymous'
});

var wmsLayer = new _ol_layer_Image_({
  source: wmsSource
});

var view = new _ol_View_({
  center: [0, 0],
  zoom: 1
});

var map = new Map({
  layers: [wmsLayer],
  target: 'map',
  view: view
});

map.on('singleclick', function(evt) {
  document.getElementById('info').innerHTML = '';
  var viewResolution = /** @type {number} */ (view.getResolution());
  var url = wmsSource.getGetFeatureInfoUrl(
      evt.coordinate, viewResolution, 'EPSG:3857',
      {'INFO_FORMAT': 'text/html'});
  if (url) {
    document.getElementById('info').innerHTML =
        '<iframe seamless src="' + url + '"></iframe>';
  }
});

map.on('pointermove', function(evt) {
  if (evt.dragging) {
    return;
  }
  var pixel = map.getEventPixel(evt.originalEvent);
  var hit = map.forEachLayerAtPixel(pixel, function() {
    return true;
  });
  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});
