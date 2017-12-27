import {get as getProjection} from '../../../../src/ol/proj.js';
import Source from '../../../../src/ol/source/Source.js';


describe('ol.source.Source', function() {

  describe('constructor', function() {
    it('returns a source', function() {
      var source = new Source({
        projection: getProjection('EPSG:4326')
      });
      expect(source).to.be.a(Source);
    });
  });

  describe('config option `attributions`', function() {
    it('accepts undefined', function() {
      var source = new Source({});
      var attributions = source.getAttributions();
      expect(attributions).to.be(null);
    });

    it('accepts a single string', function() {
      var source = new Source({
        attributions: 'Humpty'
      });
      var attributions = source.getAttributions();
      expect(attributions).to.not.be(null);
      expect(typeof attributions).to.be('function');
      expect(attributions()).to.eql(['Humpty']);
    });

    it('accepts an array of strings', function() {
      var source = new Source({
        attributions: ['Humpty', 'Dumpty']
      });
      var attributions = source.getAttributions();
      expect(attributions).to.not.be(null);
      expect(typeof attributions).to.be('function');
      expect(attributions()).to.eql(['Humpty', 'Dumpty']);
    });

    it('accepts a function that returns a string', function() {
      var source = new Source({
        attributions: function() {
          return 'Humpty';
        }
      });
      var attributions = source.getAttributions();
      expect(attributions).to.not.be(null);
      expect(typeof attributions).to.be('function');
      expect(attributions()).to.be('Humpty');
    });

    it('accepts a function that returns an array of strings', function() {
      var source = new Source({
        attributions: function() {
          return ['Humpty', 'Dumpty'];
        }
      });
      var attributions = source.getAttributions();
      expect(attributions).to.not.be(null);
      expect(typeof attributions).to.be('function');
      expect(attributions()).to.eql(['Humpty', 'Dumpty']);
    });
  });

  describe('#refresh()', function() {
    it('dispatches the change event', function() {
      var source = new Source({
        projection: getProjection('EPSG:4326')
      });
      var changedSpy = sinon.spy();
      source.on('change', changedSpy);
      source.refresh();
      expect(changedSpy.called).to.be.ok();
    });
  });

  describe('#setAttributions()', function() {
    var source = null;

    beforeEach(function() {
      source = new Source({
        attributions: 'before'
      });
    });

    afterEach(function() {
      source = null;
    });

    it('accepts undefined', function() {
      source.setAttributions();
      var attributions = source.getAttributions();
      expect(attributions).to.be(null);
    });

    it('accepts a single string', function() {
      source.setAttributions('Humpty');
      var attributions = source.getAttributions();
      expect(attributions).to.not.be(null);
      expect(typeof attributions).to.be('function');
      expect(attributions()).to.eql(['Humpty']);
    });

    it('accepts an array of strings', function() {
      source.setAttributions(['Humpty', 'Dumpty']);
      var attributions = source.getAttributions();
      expect(attributions).to.not.be(null);
      expect(typeof attributions).to.be('function');
      expect(attributions()).to.eql(['Humpty', 'Dumpty']);
    });

    it('accepts a function that returns a string', function() {
      source.setAttributions(function() {
        return 'Humpty';
      });
      var attributions = source.getAttributions();
      expect(attributions).to.not.be(null);
      expect(typeof attributions).to.be('function');
      expect(attributions()).to.eql('Humpty');
    });

    it('accepts a function that returns an array of strings', function() {
      source.setAttributions(function() {
        return ['Humpty', 'Dumpty'];
      });
      var attributions = source.getAttributions();
      expect(attributions).to.not.be(null);
      expect(typeof attributions).to.be('function');
      expect(attributions()).to.eql(['Humpty', 'Dumpty']);
    });
  });

});
