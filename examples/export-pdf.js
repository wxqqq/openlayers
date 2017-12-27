// NOCOMPILE
import Map from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import {defaults as defaultControls} from '../src/ol/control.js';
import WKT from '../src/ol/format/WKT.js';
import TileLayer from '../src/ol/layer/Tile.js';
import _ol_layer_Vector_ from '../src/ol/layer/Vector.js';
import _ol_source_OSM_ from '../src/ol/source/OSM.js';
import _ol_source_Vector_ from '../src/ol/source/Vector.js';

var raster = new TileLayer({
  source: new _ol_source_OSM_()
});

var format = new WKT();
var feature = format.readFeature(
    'POLYGON((10.689697265625 -25.0927734375, 34.595947265625 ' +
        '-20.1708984375, 38.814697265625 -35.6396484375, 13.502197265625 ' +
        '-39.1552734375, 10.689697265625 -25.0927734375))');
feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

var vector = new _ol_layer_Vector_({
  source: new _ol_source_Vector_({
    features: [feature]
  })
});


var map = new Map({
  layers: [raster, vector],
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


var dims = {
  a0: [1189, 841],
  a1: [841, 594],
  a2: [594, 420],
  a3: [420, 297],
  a4: [297, 210],
  a5: [210, 148]
};

var loading = 0;
var loaded = 0;

var exportButton = document.getElementById('export-pdf');

exportButton.addEventListener('click', function() {

  exportButton.disabled = true;
  document.body.style.cursor = 'progress';

  var format = document.getElementById('format').value;
  var resolution = document.getElementById('resolution').value;
  var dim = dims[format];
  var width = Math.round(dim[0] * resolution / 25.4);
  var height = Math.round(dim[1] * resolution / 25.4);
  var size = /** @type {ol.Size} */ (map.getSize());
  var extent = map.getView().calculateExtent(size);

  var source = raster.getSource();

  var tileLoadStart = function() {
    ++loading;
  };

  var tileLoadEnd = function() {
    ++loaded;
    if (loading === loaded) {
      var canvas = this;
      window.setTimeout(function() {
        loading = 0;
        loaded = 0;
        var data = canvas.toDataURL('image/png');
        var pdf = new jsPDF('landscape', undefined, format);
        pdf.addImage(data, 'JPEG', 0, 0, dim[0], dim[1]);
        pdf.save('map.pdf');
        source.un('tileloadstart', tileLoadStart);
        source.un('tileloadend', tileLoadEnd, canvas);
        source.un('tileloaderror', tileLoadEnd, canvas);
        map.setSize(size);
        map.getView().fit(extent);
        map.renderSync();
        exportButton.disabled = false;
        document.body.style.cursor = 'auto';
      }, 100);
    }
  };

  map.once('postcompose', function(event) {
    source.on('tileloadstart', tileLoadStart);
    source.on('tileloadend', tileLoadEnd, event.context.canvas);
    source.on('tileloaderror', tileLoadEnd, event.context.canvas);
  });

  map.setSize([width, height]);
  map.getView().fit(extent);
  map.renderSync();

}, false);
