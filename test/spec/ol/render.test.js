import {equals} from '../../../src/ol/array.js';
import _ol_has_ from '../../../src/ol/has.js';
import _ol_render_ from '../../../src/ol/render.js';
import _ol_render_canvas_Immediate_ from '../../../src/ol/render/canvas/Immediate.js';
import _ol_transform_ from '../../../src/ol/transform.js';


describe('ol.render', function() {

  describe('toContext', function() {

    it('creates an ol.render.canvas.Immediate and sets defaults', function() {
      var canvas = document.createElement('canvas');
      var render = _ol_render_.toContext(canvas.getContext('2d'));
      expect(render).to.be.a(_ol_render_canvas_Immediate_);
      expect(render.pixelRatio_).to.be(_ol_has_.DEVICE_PIXEL_RATIO);
    });

    it('sets size and pixel ratio from options', function() {
      var canvas = document.createElement('canvas');
      var pixelRatio = 1.5;
      var size = [100, 50];
      var render = _ol_render_.toContext(canvas.getContext('2d'),
          {pixelRatio: pixelRatio, size: size});
      expect(render.pixelRatio_).to.be(pixelRatio);
      expect(render.extent_).to.eql(
          [0, 0, size[0] * pixelRatio, size[1] * pixelRatio]);
      expect(canvas.style.width).to.be(size[0] + 'px');
      expect(canvas.style.height).to.be(size[1] + 'px');
      var transform = _ol_transform_.scale(_ol_transform_.create(),
          pixelRatio, pixelRatio);
      expect(equals(render.transform_, transform)).to.be.ok();
    });
  });

});
