import Map from '../src/ol/Map.js';
import _ol_View_ from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import MultiPoint from '../src/ol/geom/MultiPoint.js';
import _ol_layer_Vector_ from '../src/ol/layer/Vector.js';
import _ol_source_Vector_ from '../src/ol/source/Vector.js';
import _ol_style_Circle_ from '../src/ol/style/Circle.js';
import _ol_style_Fill_ from '../src/ol/style/Fill.js';
import _ol_style_Stroke_ from '../src/ol/style/Stroke.js';
import _ol_style_Style_ from '../src/ol/style/Style.js';

var styles = [
  /* We are using two different styles for the polygons:
   *  - The first style is for the polygons themselves.
   *  - The second style is to draw the vertices of the polygons.
   *    In a custom `geometry` function the vertices of a polygon are
   *    returned as `MultiPoint` geometry, which will be used to render
   *    the style.
   */
  new _ol_style_Style_({
    stroke: new _ol_style_Stroke_({
      color: 'blue',
      width: 3
    }),
    fill: new _ol_style_Fill_({
      color: 'rgba(0, 0, 255, 0.1)'
    })
  }),
  new _ol_style_Style_({
    image: new _ol_style_Circle_({
      radius: 5,
      fill: new _ol_style_Fill_({
        color: 'orange'
      })
    }),
    geometry: function(feature) {
      // return the coordinates of the first ring of the polygon
      var coordinates = feature.getGeometry().getCoordinates()[0];
      return new MultiPoint(coordinates);
    }
  })
];

var geojsonObject = {
  'type': 'FeatureCollection',
  'crs': {
    'type': 'name',
    'properties': {
      'name': 'EPSG:3857'
    }
  },
  'features': [{
    'type': 'Feature',
    'geometry': {
      'type': 'Polygon',
      'coordinates': [[[-5e6, 6e6], [-5e6, 8e6], [-3e6, 8e6],
        [-3e6, 6e6], [-5e6, 6e6]]]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'Polygon',
      'coordinates': [[[-2e6, 6e6], [-2e6, 8e6], [0, 8e6],
        [0, 6e6], [-2e6, 6e6]]]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'Polygon',
      'coordinates': [[[1e6, 6e6], [1e6, 8e6], [3e6, 8e6],
        [3e6, 6e6], [1e6, 6e6]]]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'Polygon',
      'coordinates': [[[-2e6, -1e6], [-1e6, 1e6],
        [0, -1e6], [-2e6, -1e6]]]
    }
  }]
};

var source = new _ol_source_Vector_({
  features: (new GeoJSON()).readFeatures(geojsonObject)
});

var layer = new _ol_layer_Vector_({
  source: source,
  style: styles
});

var map = new Map({
  layers: [layer],
  target: 'map',
  view: new _ol_View_({
    center: [0, 3000000],
    zoom: 2
  })
});
