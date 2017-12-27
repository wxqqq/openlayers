import _ol_Feature_ from '../../../../src/ol/Feature.js';
import Point from '../../../../src/ol/geom/Point.js';
import Map from '../../../../src/ol/Map.js';
import _ol_View_ from '../../../../src/ol/View.js';
import _ol_layer_Vector_ from '../../../../src/ol/layer/Vector.js';
import _ol_source_Vector_ from '../../../../src/ol/source/Vector.js';
import _ol_style_Fill_ from '../../../../src/ol/style/Fill.js';
import _ol_style_RegularShape_ from '../../../../src/ol/style/RegularShape.js';
import _ol_style_Style_ from '../../../../src/ol/style/Style.js';
import _ol_style_Stroke_ from '../../../../src/ol/style/Stroke.js';


describe('ol.rendering.style.RegularShape', function() {

  var map, vectorSource;

  function createMap(renderer) {
    vectorSource = new _ol_source_Vector_();
    var vectorLayer = new _ol_layer_Vector_({
      source: vectorSource
    });

    map = new Map({
      pixelRatio: 1,
      target: createMapDiv(50, 50),
      renderer: renderer,
      layers: [vectorLayer],
      view: new _ol_View_({
        projection: 'EPSG:4326',
        center: [0, 0],
        resolution: 1
      })
    });
  }

  afterEach(function() {
    if (map) {
      disposeMap(map);
      map = null;
    }
  });

  function createFeatures(stroke, fill) {
    var feature;
    feature = new _ol_Feature_({
      geometry: new Point([-15, 15])
    });
    // square
    feature.setStyle(new _ol_style_Style_({
      image: new _ol_style_RegularShape_({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: 10,
        angle: Math.PI / 4
      })
    }));
    vectorSource.addFeature(feature);

    feature = new _ol_Feature_({
      geometry: new Point([8, 15])
    });
    // triangle
    feature.setStyle(new _ol_style_Style_({
      image: new _ol_style_RegularShape_({
        fill: fill,
        stroke: stroke,
        points: 3,
        radius: 10,
        rotation: Math.PI / 4,
        angle: 0
      })
    }));
    vectorSource.addFeature(feature);

    feature = new _ol_Feature_({
      geometry: new Point([-10, -8])
    });
    // star
    feature.setStyle(new _ol_style_Style_({
      image: new _ol_style_RegularShape_({
        fill: fill,
        stroke: stroke,
        points: 5,
        radius: 10,
        radius2: 4,
        angle: 0
      })
    }));
    vectorSource.addFeature(feature);

    feature = new _ol_Feature_({
      geometry: new Point([12, -8])
    });
    // cross
    feature.setStyle(new _ol_style_Style_({
      image: new _ol_style_RegularShape_({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: 10,
        radius2: 0,
        angle: 0
      })
    }));
    vectorSource.addFeature(feature);
  }


  describe('#render', function() {
    var stroke = new _ol_style_Stroke_({width: 2});
    var fill = new _ol_style_Fill_({color: 'red'});

    it('tests the canvas renderer', function(done) {
      createMap('canvas');
      createFeatures(stroke, fill);
      expectResemble(map, 'rendering/ol/style/expected/regularshape-canvas.png', 9.4, done);
    });

    it('supports lineDash', function(done) {
      createMap('canvas');
      createFeatures(new _ol_style_Stroke_({
        lineDash: [10, 5]
      }));
      expectResemble(map, 'rendering/ol/style/expected/regularshape-canvas-linedash.png', 5, done);
    });

    it('supports lineDashOffset', function(done) {
      createMap('canvas');
      createFeatures(new _ol_style_Stroke_({
        lineDash: [10, 5],
        lineDashOffset: 5
      }));
      expectResemble(map, 'rendering/ol/style/expected/regularshape-canvas-linedashoffset.png', 5, done);
    });

    where('WebGL').it('tests the WebGL renderer', function(done) {
      assertWebGL();
      createMap('webgl');
      createFeatures(stroke, fill);
      expectResemble(map, 'rendering/ol/style/expected/regularshape-webgl.png', 8.2, done);
    });
  });

  describe('uses the default fill and stroke color', function() {
    var stroke = new _ol_style_Stroke_();
    var fill = new _ol_style_Fill_();

    it('tests the canvas renderer', function(done) {
      createMap('canvas');
      createFeatures(stroke, fill);
      expectResemble(map, 'rendering/ol/style/expected/regularshape-canvas-default-style.png', 3.0, done);
    });

    where('WebGL').it('tests the WebGL renderer', function(done) {
      assertWebGL();
      createMap('webgl');
      createFeatures(stroke, fill);
      expectResemble(map, 'rendering/ol/style/expected/regularshape-webgl-default-style.png', 3.0, done);
    });
  });
});
