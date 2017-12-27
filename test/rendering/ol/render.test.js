import LineString from '../../../src/ol/geom/LineString.js';
import Point from '../../../src/ol/geom/Point.js';
import Polygon from '../../../src/ol/geom/Polygon.js';
import _ol_render_ from '../../../src/ol/render.js';
import _ol_render_VectorContext_ from '../../../src/ol/render/VectorContext.js';
import _ol_render_canvas_Immediate_ from '../../../src/ol/render/canvas/Immediate.js';
import _ol_style_Circle_ from '../../../src/ol/style/Circle.js';
import _ol_style_Fill_ from '../../../src/ol/style/Fill.js';
import _ol_style_Stroke_ from '../../../src/ol/style/Stroke.js';
import _ol_style_Style_ from '../../../src/ol/style/Style.js';

function getContext() {
  return document.createElement('canvas').getContext('2d');
}

describe('ol.render', function() {

  describe('ol.render.toContext()', function() {

    it('creates a vector context from a Canvas 2d context', function() {
      var vectorContext = _ol_render_.toContext(getContext(), {
        pixelRatio: 1,
        size: [100, 100]
      });
      expect(vectorContext).to.be.a(_ol_render_VectorContext_);
      expect(vectorContext).to.be.a(_ol_render_canvas_Immediate_);
    });

    it('can be used to render a point geometry', function(done) {
      var context = getContext();
      var vectorContext = _ol_render_.toContext(context, {
        pixelRatio: 1,
        size: [100, 100]
      });

      var style = new _ol_style_Style_({
        image: new _ol_style_Circle_({
          fill: new _ol_style_Fill_({
            color: 'green'
          }),
          radius: 10
        })
      });

      vectorContext.setStyle(style);
      vectorContext.drawGeometry(new Point([50, 50]));

      resembleCanvas(context.canvas,
          'rendering/ol/expected/render-point.png', IMAGE_TOLERANCE, done);

    });

    it('can be used to render a linestring geometry', function(done) {
      var context = getContext();
      var vectorContext = _ol_render_.toContext(context, {
        pixelRatio: 1,
        size: [100, 100]
      });

      var style = new _ol_style_Style_({
        stroke: new _ol_style_Stroke_({
          color: 'red',
          width: 14
        })
      });

      vectorContext.setStyle(style);
      vectorContext.drawGeometry(new LineString([
        [10, 60], [30, 40], [50, 60], [70, 40], [90, 60]
      ]));

      resembleCanvas(context.canvas,
          'rendering/ol/expected/render-linestring.png', IMAGE_TOLERANCE, done);

    });

    it('respects lineCap for linestring', function(done) {
      var context = getContext();
      var vectorContext = _ol_render_.toContext(context, {
        pixelRatio: 1,
        size: [100, 100]
      });

      var style = new _ol_style_Style_({
        stroke: new _ol_style_Stroke_({
          lineCap: 'butt',
          color: 'red',
          width: 14
        })
      });

      vectorContext.setStyle(style);
      vectorContext.drawGeometry(new LineString([
        [10, 60], [30, 40], [50, 60], [70, 40], [90, 60]
      ]));

      resembleCanvas(context.canvas,
          'rendering/ol/expected/render-linestring-butt.png', IMAGE_TOLERANCE, done);

    });

    it('respects lineJoin for linestring', function(done) {
      var context = getContext();
      var vectorContext = _ol_render_.toContext(context, {
        pixelRatio: 1,
        size: [100, 100]
      });

      var style = new _ol_style_Style_({
        stroke: new _ol_style_Stroke_({
          lineJoin: 'bevel',
          color: 'red',
          width: 14
        })
      });

      vectorContext.setStyle(style);
      vectorContext.drawGeometry(new LineString([
        [10, 60], [30, 40], [50, 60], [70, 40], [90, 60]
      ]));

      resembleCanvas(context.canvas,
          'rendering/ol/expected/render-linestring-bevel.png', IMAGE_TOLERANCE, done);

    });

    it('can be used to render a polygon geometry', function(done) {
      var context = getContext();
      var vectorContext = _ol_render_.toContext(context, {
        pixelRatio: 1,
        size: [100, 100]
      });

      var style = new _ol_style_Style_({
        stroke: new _ol_style_Stroke_({
          color: 'blue',
          width: 8
        }),
        fill: new _ol_style_Fill_({
          color: 'rgba(0,0,255,0.5)'
        })
      });

      vectorContext.setStyle(style);

      vectorContext.drawGeometry(new Polygon([
        [[25, 25], [75, 25], [75, 75], [25, 75], [25, 25]],
        [[40, 40], [40, 60], [60, 60], [60, 40], [40, 40]]
      ]));

      resembleCanvas(context.canvas,
          'rendering/ol/expected/render-polygon.png', IMAGE_TOLERANCE, done);

    });

    it('supports lineDash styles', function(done) {
      var context = getContext();
      var vectorContext = _ol_render_.toContext(context, {
        pixelRatio: 1,
        size: [100, 100]
      });

      var style = new _ol_style_Style_({
        stroke: new _ol_style_Stroke_({
          lineDash: [10, 5]
        })
      });

      vectorContext.setStyle(style);

      vectorContext.drawGeometry(new Polygon([
        [[25, 25], [75, 25], [75, 75], [25, 75], [25, 25]],
        [[40, 40], [40, 60], [60, 60], [60, 40], [40, 40]]
      ]));

      resembleCanvas(context.canvas,
          'rendering/ol/expected/render-polygon-linedash.png', IMAGE_TOLERANCE, done);

    });

    it('supports lineDashOffset', function(done) {
      var context = getContext();
      var vectorContext = _ol_render_.toContext(context, {
        pixelRatio: 1,
        size: [100, 100]
      });

      var style = new _ol_style_Style_({
        stroke: new _ol_style_Stroke_({
          lineDash: [10, 5],
          lineDashOffset: 5
        })
      });

      vectorContext.setStyle(style);

      vectorContext.drawGeometry(new Polygon([
        [[25, 25], [75, 25], [75, 75], [25, 75], [25, 25]],
        [[40, 40], [40, 60], [60, 60], [60, 40], [40, 40]]
      ]));

      resembleCanvas(context.canvas,
          'rendering/ol/expected/render-polygon-linedashoffset.png', IMAGE_TOLERANCE, done);

    });

  });

});
