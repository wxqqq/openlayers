import _ol_Object_ from '../../../src/ol/Object.js';
import _ol_events_ from '../../../src/ol/events.js';


describe('ol.Object', function() {

  var o;
  beforeEach(function() {
    o = new _ol_Object_();
  });

  describe('get, set and unset', function() {

    describe('get an unset property', function() {
      var v;
      beforeEach(function() {
        v = o.get('k');
      });

      it('returns undefined', function() {
        expect(v).to.be(undefined);
      });
    });

    describe('get a set property', function() {
      var v;
      beforeEach(function() {
        o.set('k', 1);
        v = o.get('k');
      });

      it('returns expected value', function() {
        expect(v).to.eql(1);
      });
    });

    describe('unset a set property', function() {
      beforeEach(function() {
        o.set('k', 1);
      });

      it('returns undefined', function() {
        var v = o.unset('k');
        expect(v).to.be(undefined);
      });
    });
  });

  describe('#get()', function() {

    it('does not return values that are not explicitly set', function() {
      var o = new _ol_Object_();
      expect(o.get('constructor')).to.be(undefined);
      expect(o.get('hasOwnProperty')).to.be(undefined);
      expect(o.get('isPrototypeOf')).to.be(undefined);
      expect(o.get('propertyIsEnumerable')).to.be(undefined);
      expect(o.get('toLocaleString')).to.be(undefined);
      expect(o.get('toString')).to.be(undefined);
      expect(o.get('valueOf')).to.be(undefined);
    });

  });

  describe('#set()', function() {
    it('can be used with arbitrary names', function() {
      var o = new _ol_Object_();

      o.set('set', 'sat');
      expect(o.get('set')).to.be('sat');

      o.set('get', 'got');
      expect(o.get('get')).to.be('got');

      o.set('toString', 'string');
      expect(o.get('toString')).to.be('string');
      expect(typeof o.toString).to.be('function');
    });
  });

  describe('#getKeys()', function() {

    it('returns property names set at construction', function() {
      var o = new _ol_Object_({
        prop1: 'val1',
        prop2: 'val2',
        toString: 'string',
        get: 'foo'
      });

      var keys = o.getKeys();
      expect(keys.length).to.be(4);
      expect(keys.sort()).to.eql(['get', 'prop1', 'prop2', 'toString']);
    });

  });

  describe('setProperties', function() {

    it('sets multiple values at once', function() {
      o.setProperties({
        k1: 1,
        k2: 2
      });
      expect(o.get('k1')).to.eql(1);
      expect(o.get('k2')).to.eql(2);

      var keys = o.getKeys().sort();
      expect(keys).to.eql(['k1', 'k2']);
    });
  });

  describe('notify', function() {

    var listener1, listener2;

    beforeEach(function() {
      listener1 = sinon.spy();
      _ol_events_.listen(o, 'change:k', listener1);

      listener2 = sinon.spy();
      _ol_events_.listen(o, 'propertychange', listener2);
    });

    it('dispatches events', function() {
      o.notify('k', 1);
      expect(listener1.calledOnce).to.be(true);
      var args = listener1.firstCall.args;
      expect(args).to.have.length(1);
      var event = args[0];
      expect(event.key).to.be('k');
      expect(event.oldValue).to.be(1);
    });

    it('dispatches generic change events to bound objects', function() {
      o.notify('k', 1);
      expect(listener2.calledOnce).to.be(true);
      var args = listener2.firstCall.args;
      expect(args).to.have.length(1);
      var event = args[0];
      expect(event.key).to.be('k');
      expect(event.oldValue).to.be(1);
    });
  });

  describe('set', function() {

    var listener1, listener2;

    beforeEach(function() {
      listener1 = sinon.spy();
      _ol_events_.listen(o, 'change:k', listener1);

      listener2 = sinon.spy();
      _ol_events_.listen(o, 'propertychange', listener2);
    });

    it('dispatches events to object', function() {
      o.set('k', 1);
      expect(listener1).to.be.called();

      expect(o.getKeys()).to.eql(['k']);
    });

    it('dispatches generic change events to object', function() {
      o.set('k', 1);
      expect(listener2.calledOnce).to.be(true);
      var args = listener2.firstCall.args;
      expect(args).to.have.length(1);
      var event = args[0];
      expect(event.key).to.be('k');
    });

    it('dispatches events only if the value is different', function() {
      o.set('k', 1);
      o.set('k', 1);
      expect(listener1.calledOnce).to.be(true);
      expect(listener2.calledOnce).to.be(true);
    });

  });

  describe('setter', function() {
    beforeEach(function() {
      o.setX = function(x) {
        this.set('x', x);
      };
      sinon.spy(o, 'setX');
    });

    it('does not call the setter', function() {
      o.set('x', 1);
      expect(o.get('x')).to.eql(1);
      expect(o.setX).to.not.be.called();

      expect(o.getKeys()).to.eql(['x']);
    });
  });

  describe('getter', function() {
    beforeEach(function() {
      o.getX = function() {
        return 1;
      };
      sinon.spy(o, 'getX');
    });

    it('does not call the getter', function() {
      expect(o.get('x')).to.be(undefined);
      expect(o.getX).to.not.be.called();
    });
  });

  describe('create with options', function() {
    it('sets the property', function() {
      var o = new _ol_Object_({k: 1});
      expect(o.get('k')).to.eql(1);

      expect(o.getKeys()).to.eql(['k']);
    });
  });

  describe('case sensitivity', function() {
    var listener1, listener2;

    beforeEach(function() {
      listener1 = sinon.spy();
      _ol_events_.listen(o, 'change:k', listener1);
      listener2 = sinon.spy();
      _ol_events_.listen(o, 'change:K', listener2);
    });

    it('dispatches the expected event', function() {
      o.set('K', 1);
      expect(listener1).to.not.be.called();
      expect(listener2).to.be.called();

      expect(o.getKeys()).to.eql(['K']);
    });
  });

});
