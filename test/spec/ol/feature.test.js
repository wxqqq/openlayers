import _ol_Feature_ from '../../../src/ol/Feature.js';
import Point from '../../../src/ol/geom/Point.js';
import _ol_obj_ from '../../../src/ol/obj.js';
import _ol_style_Style_ from '../../../src/ol/style/Style.js';


describe('ol.Feature', function() {

  describe('constructor', function() {

    it('creates a new feature', function() {
      var feature = new _ol_Feature_();
      expect(feature).to.be.a(_ol_Feature_);
    });

    it('takes properties', function() {
      var feature = new _ol_Feature_({
        foo: 'bar'
      });
      expect(feature.get('foo')).to.be('bar');
    });

    it('can store the feature\'s commonly used id', function() {
      var feature = new _ol_Feature_();
      feature.setId('foo');
      expect(feature.getId()).to.be('foo');
    });

    it('will set the default geometry', function() {
      var feature = new _ol_Feature_({
        geometry: new Point([10, 20]),
        foo: 'bar'
      });
      var geometry = feature.getGeometry();
      expect(geometry).to.be.a(Point);
      expect(feature.get('geometry')).to.be(geometry);
    });

  });

  describe('#get()', function() {

    it('returns values set at construction', function() {
      var feature = new _ol_Feature_({
        a: 'first',
        b: 'second'
      });
      expect(feature.get('a')).to.be('first');
      expect(feature.get('b')).to.be('second');
    });

    it('returns undefined for unset attributes', function() {
      var feature = new _ol_Feature_();
      expect(feature.get('a')).to.be(undefined);
    });

    it('returns values set by set', function() {
      var feature = new _ol_Feature_();
      feature.set('a', 'b');
      expect(feature.get('a')).to.be('b');
    });

  });

  describe('#getProperties()', function() {

    it('returns an object with all attributes', function() {
      var point = new Point([15, 30]);
      var feature = new _ol_Feature_({
        foo: 'bar',
        ten: 10,
        geometry: point
      });

      var attributes = feature.getProperties();

      var keys = Object.keys(attributes);
      expect(keys.sort()).to.eql(['foo', 'geometry', 'ten']);

      expect(attributes.foo).to.be('bar');
      expect(attributes.geometry).to.be(point);
      expect(attributes.ten).to.be(10);
    });

    it('is empty by default', function() {
      var feature = new _ol_Feature_();
      var properties = feature.getProperties();
      expect(_ol_obj_.isEmpty(properties)).to.be(true);
    });

  });


  describe('#getGeometry()', function() {

    var point = new Point([15, 30]);

    it('returns undefined for unset geometry', function() {
      var feature = new _ol_Feature_();
      expect(feature.getGeometry()).to.be(undefined);
    });

    it('returns null for null geometry (constructor)', function() {
      var feature = new _ol_Feature_(null);
      expect(feature.getGeometry()).to.be(null);
    });

    it('returns null for null geometry (setGeometry())', function() {
      var feature = new _ol_Feature_();
      feature.setGeometry(null);
      expect(feature.getGeometry()).to.be(null);
    });

    it('gets the geometry set at construction', function() {
      var feature = new _ol_Feature_({
        geometry: point
      });
      expect(feature.getGeometry()).to.be(point);
    });

    it('gets any geometry set by setGeometry', function() {
      var feature = new _ol_Feature_();
      feature.setGeometry(point);
      expect(feature.getGeometry()).to.be(point);

      var point2 = new Point([1, 2]);
      feature.setGeometry(point2);
      expect(feature.getGeometry()).to.be(point2);
    });

  });

  describe('#set()', function() {

    it('sets values', function() {
      var feature = new _ol_Feature_({
        a: 'first',
        b: 'second'
      });
      feature.set('a', 'new');
      expect(feature.get('a')).to.be('new');
    });

    it('can be used to set the geometry', function() {
      var point = new Point([3, 4]);
      var feature = new _ol_Feature_({
        geometry: new Point([1, 2])
      });
      feature.set('geometry', point);
      expect(feature.get('geometry')).to.be(point);
      expect(feature.getGeometry()).to.be(point);
    });

    it('can be used to set attributes with arbitrary names', function() {

      var feature = new _ol_Feature_();

      feature.set('toString', 'string');
      expect(feature.get('toString')).to.be('string');
      expect(typeof feature.toString).to.be('function');

      feature.set('getGeometry', 'x');
      expect(feature.get('getGeometry')).to.be('x');

      feature.set('geometry', new Point([1, 2]));
      expect(feature.getGeometry()).to.be.a(Point);

    });

  });

  describe('#setGeometry()', function() {

    var point = new Point([15, 30]);

    it('sets the default geometry', function() {
      var feature = new _ol_Feature_();
      feature.setGeometry(point);
      expect(feature.get('geometry')).to.be(point);
    });

    it('replaces previous default geometry', function() {
      var feature = new _ol_Feature_({
        geometry: point
      });
      expect(feature.getGeometry()).to.be(point);

      var point2 = new Point([1, 2]);
      feature.setGeometry(point2);
      expect(feature.getGeometry()).to.be(point2);
    });

  });

  describe('#setGeometryName()', function() {

    var point = new Point([15, 30]);

    it('sets property where to to look at geometry', function() {
      var feature = new _ol_Feature_();
      feature.setGeometry(point);
      expect(feature.getGeometry()).to.be(point);

      var point2 = new Point([1, 2]);
      feature.set('altGeometry', point2);
      expect(feature.getGeometry()).to.be(point);
      feature.setGeometryName('altGeometry');
      expect(feature.getGeometry()).to.be(point2);

      feature.on('change', function() {
        expect.fail();
      });
      point.setCoordinates([0, 2]);
    });

    it('changes property listener', function() {
      var feature = new _ol_Feature_();
      feature.setGeometry(point);
      var point2 = new Point([1, 2]);
      feature.set('altGeometry', point2);
      feature.setGeometryName('altGeometry');

      var spy = sinon.spy();
      feature.on('change', spy);
      point2.setCoordinates([0, 2]);
      expect(spy.callCount).to.be(1);
    });

    it('can use a different geometry name', function() {
      var feature = new _ol_Feature_();
      feature.setGeometryName('foo');
      var point = new Point([10, 20]);
      feature.setGeometry(point);
      expect(feature.getGeometry()).to.be(point);
    });

  });

  describe('#setId()', function() {

    it('sets the feature identifier', function() {
      var feature = new _ol_Feature_();
      expect(feature.getId()).to.be(undefined);
      feature.setId('foo');
      expect(feature.getId()).to.be('foo');
    });

    it('accepts a string or number', function() {
      var feature = new _ol_Feature_();
      feature.setId('foo');
      expect(feature.getId()).to.be('foo');
      feature.setId(2);
      expect(feature.getId()).to.be(2);
    });

    it('dispatches the "change" event', function(done) {
      var feature = new _ol_Feature_();
      feature.on('change', function() {
        expect(feature.getId()).to.be('foo');
        done();
      });
      feature.setId('foo');
    });

  });

  describe('#getStyleFunction()', function() {

    var styleFunction = function(resolution) {
      return null;
    };

    it('returns undefined after construction', function() {
      var feature = new _ol_Feature_();
      expect(feature.getStyleFunction()).to.be(undefined);
    });

    it('returns the function passed to setStyle', function() {
      var feature = new _ol_Feature_();
      feature.setStyle(styleFunction);
      expect(feature.getStyleFunction()).to.be(styleFunction);
    });

    it('does not get confused with user "styleFunction" property', function() {
      var feature = new _ol_Feature_();
      feature.set('styleFunction', 'foo');
      expect(feature.getStyleFunction()).to.be(undefined);
    });

    it('does not get confused with "styleFunction" option', function() {
      var feature = new _ol_Feature_({
        styleFunction: 'foo'
      });
      expect(feature.getStyleFunction()).to.be(undefined);
    });

  });

  describe('#setStyle()', function() {

    var style = new _ol_style_Style_();

    var styleFunction = function(feature, resolution) {
      return resolution;
    };

    it('accepts a single style', function() {
      var feature = new _ol_Feature_();
      feature.setStyle(style);
      var func = feature.getStyleFunction();
      expect(func()).to.eql([style]);
    });

    it('accepts an array of styles', function() {
      var feature = new _ol_Feature_();
      feature.setStyle([style]);
      var func = feature.getStyleFunction();
      expect(func()).to.eql([style]);
    });

    it('accepts a style function', function() {
      var feature = new _ol_Feature_();
      function featureStyleFunction(resolution) {
        return styleFunction(this, resolution);
      }
      feature.setStyle(featureStyleFunction);
      expect(feature.getStyleFunction()).to.be(featureStyleFunction);
      expect(feature.getStyleFunction()(42)).to.be(42);
    });

    it('accepts a layer style function', function() {
      var feature = new _ol_Feature_();
      feature.setStyle(styleFunction);
      expect(feature.getStyleFunction()).to.not.be(styleFunction);
      expect(feature.getStyleFunction()(42)).to.be(42);
    });

    it('accepts null', function() {
      var feature = new _ol_Feature_();
      feature.setStyle(style);
      feature.setStyle(null);
      expect(feature.getStyle()).to.be(null);
      expect(feature.getStyleFunction()).to.be(undefined);
    });

    it('dispatches a change event', function() {
      var feature = new _ol_Feature_();
      var spy = sinon.spy();
      feature.on('change', spy);
      feature.setStyle(style);
      expect(spy.callCount).to.be(1);
    });

  });

  describe('#getStyle()', function() {

    var style = new _ol_style_Style_();

    var styleFunction = function(resolution) {
      return null;
    };

    it('returns what is passed to setStyle', function() {
      var feature = new _ol_Feature_();

      expect(feature.getStyle()).to.be(null);

      feature.setStyle(style);
      expect(feature.getStyle()).to.be(style);

      feature.setStyle([style]);
      expect(feature.getStyle()).to.eql([style]);

      feature.setStyle(styleFunction);
      expect(feature.getStyle()).to.be(styleFunction);

    });

    it('does not get confused with "style" option to constructor', function() {
      var feature = new _ol_Feature_({
        style: 'foo'
      });

      expect(feature.getStyle()).to.be(null);
    });

    it('does not get confused with user set "style" property', function() {
      var feature = new _ol_Feature_();
      feature.set('style', 'foo');

      expect(feature.getStyle()).to.be(null);
    });

  });

  describe('#clone', function() {

    it('correctly clones features', function() {
      var feature = new _ol_Feature_();
      feature.setProperties({'fookey': 'fooval'});
      feature.setId(1);
      feature.setGeometryName('geom');
      var geometry = new Point([1, 2]);
      feature.setGeometry(geometry);
      var style = new _ol_style_Style_({});
      feature.setStyle(style);
      feature.set('barkey', 'barval');

      var clone = feature.clone();
      expect(clone.get('fookey')).to.be('fooval');
      expect(clone.getId()).to.be(undefined);
      expect(clone.getGeometryName()).to.be('geom');
      var geometryClone = clone.getGeometry();
      expect(geometryClone).not.to.be(geometry);
      var coordinates = geometryClone.getFlatCoordinates();
      expect(coordinates[0]).to.be(1);
      expect(coordinates[1]).to.be(2);
      expect(clone.getStyle()).to.be(style);
      expect(clone.get('barkey')).to.be('barval');
    });

    it('correctly clones features with no geometry and no style', function() {
      var feature = new _ol_Feature_();
      feature.set('fookey', 'fooval');

      var clone = feature.clone();
      expect(clone.get('fookey')).to.be('fooval');
      expect(clone.getGeometry()).to.be(undefined);
      expect(clone.getStyle()).to.be(null);
    });
  });

  describe('#setGeometry()', function() {

    it('dispatches a change event when geometry is set to null',
        function() {
          var feature = new _ol_Feature_({
            geometry: new Point([0, 0])
          });
          var spy = sinon.spy();
          feature.on('change', spy);
          feature.setGeometry(null);
          expect(spy.callCount).to.be(1);
        });
  });

});

describe('ol.Feature.createStyleFunction()', function() {
  var style = new _ol_style_Style_();

  it('creates a feature style function from a single style', function() {
    var styleFunction = _ol_Feature_.createStyleFunction(style);
    expect(styleFunction()).to.eql([style]);
  });

  it('creates a feature style function from an array of styles', function() {
    var styleFunction = _ol_Feature_.createStyleFunction([style]);
    expect(styleFunction()).to.eql([style]);
  });

  it('passes through a function', function() {
    var original = function() {
      return [style];
    };
    var styleFunction = _ol_Feature_.createStyleFunction(original);
    expect(styleFunction).to.be(original);
  });

  it('throws on (some) unexpected input', function() {
    expect(function() {
      _ol_Feature_.createStyleFunction({bogus: 'input'});
    }).to.throwException();
  });

});
