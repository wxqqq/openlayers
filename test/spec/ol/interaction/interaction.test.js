import Map from '../../../../src/ol/Map.js';
import _ol_View_ from '../../../../src/ol/View.js';
import EventTarget from '../../../../src/ol/events/EventTarget.js';
import Interaction from '../../../../src/ol/interaction/Interaction.js';

describe('ol.interaction.Interaction', function() {

  describe('constructor', function() {
    var interaction;

    beforeEach(function() {
      interaction = new Interaction({});
    });

    it('creates a new interaction', function() {
      expect(interaction).to.be.a(Interaction);
      expect(interaction).to.be.a(EventTarget);
    });

    it('creates an active interaction', function() {
      expect(interaction.getActive()).to.be(true);
    });

  });

  describe('#getMap()', function() {

    it('retrieves the associated map', function() {
      var map = new Map({});
      var interaction = new Interaction({});
      interaction.setMap(map);
      expect(interaction.getMap()).to.be(map);
    });

    it('returns null if no map', function() {
      var interaction = new Interaction({});
      expect(interaction.getMap()).to.be(null);
    });

  });

  describe('#setMap()', function() {

    it('allows a map to be set', function() {
      var map = new Map({});
      var interaction = new Interaction({});
      interaction.setMap(map);
      expect(interaction.getMap()).to.be(map);
    });

    it('accepts null', function() {
      var interaction = new Interaction({});
      interaction.setMap(null);
      expect(interaction.getMap()).to.be(null);
    });

  });

  describe('zoomByDelta()', function() {

    it('changes view resolution', function() {
      var view = new _ol_View_({
        resolution: 1,
        resolutions: [4, 2, 1, 0.5, 0.25]
      });

      Interaction.zoomByDelta(view, 1);
      expect(view.getResolution()).to.be(0.5);

      Interaction.zoomByDelta(view, -1);
      expect(view.getResolution()).to.be(1);

      Interaction.zoomByDelta(view, 2);
      expect(view.getResolution()).to.be(0.25);

      Interaction.zoomByDelta(view, -2);
      expect(view.getResolution()).to.be(1);
    });

    it('changes view resolution and center relative to the anchor', function() {
      var view = new _ol_View_({
        center: [0, 0],
        resolution: 1,
        resolutions: [4, 2, 1, 0.5, 0.25]
      });

      Interaction.zoomByDelta(view, 1, [10, 10]);
      expect(view.getCenter()).to.eql([5, 5]);

      Interaction.zoomByDelta(view, -1, [0, 0]);
      expect(view.getCenter()).to.eql([10, 10]);

      Interaction.zoomByDelta(view, 2, [0, 0]);
      expect(view.getCenter()).to.eql([2.5, 2.5]);

      Interaction.zoomByDelta(view, -2, [0, 0]);
      expect(view.getCenter()).to.eql([10, 10]);
    });

    it('changes view resolution and center relative to the anchor, while respecting the extent', function() {
      var view = new _ol_View_({
        center: [0, 0],
        extent: [-2.5, -2.5, 2.5, 2.5],
        resolution: 1,
        resolutions: [4, 2, 1, 0.5, 0.25]
      });

      Interaction.zoomByDelta(view, 1, [10, 10]);
      expect(view.getCenter()).to.eql([2.5, 2.5]);

      Interaction.zoomByDelta(view, -1, [0, 0]);
      expect(view.getCenter()).to.eql([2.5, 2.5]);

      Interaction.zoomByDelta(view, 2, [10, 10]);
      expect(view.getCenter()).to.eql([2.5, 2.5]);

      Interaction.zoomByDelta(view, -2, [0, 0]);
      expect(view.getCenter()).to.eql([2.5, 2.5]);
    });
  });

});
