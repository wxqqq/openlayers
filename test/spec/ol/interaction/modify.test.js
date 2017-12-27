import _ol_Collection_ from '../../../../src/ol/Collection.js';
import _ol_Feature_ from '../../../../src/ol/Feature.js';
import Map from '../../../../src/ol/Map.js';
import MapBrowserPointerEvent from '../../../../src/ol/MapBrowserPointerEvent.js';
import _ol_View_ from '../../../../src/ol/View.js';
import _ol_events_ from '../../../../src/ol/events.js';
import _ol_events_condition_ from '../../../../src/ol/events/condition.js';
import Circle from '../../../../src/ol/geom/Circle.js';
import LineString from '../../../../src/ol/geom/LineString.js';
import Point from '../../../../src/ol/geom/Point.js';
import Polygon from '../../../../src/ol/geom/Polygon.js';
import _ol_interaction_Modify_ from '../../../../src/ol/interaction/Modify.js';
import _ol_layer_Vector_ from '../../../../src/ol/layer/Vector.js';
import _ol_pointer_PointerEvent_ from '../../../../src/ol/pointer/PointerEvent.js';
import _ol_source_Vector_ from '../../../../src/ol/source/Vector.js';


describe('ol.interaction.Modify', function() {

  var target, map, source, features;

  var width = 360;
  var height = 180;

  beforeEach(function(done) {
    target = document.createElement('div');

    var style = target.style;
    style.position = 'absolute';
    style.left = '-1000px';
    style.top = '-1000px';
    style.width = width + 'px';
    style.height = height + 'px';
    document.body.appendChild(target);

    features = [
      new _ol_Feature_({
        geometry: new Polygon([
          [[0, 0], [10, 20], [0, 40], [40, 40], [40, 0]]
        ])
      })
    ];

    source = new _ol_source_Vector_({
      features: features
    });

    var layer = new _ol_layer_Vector_({source: source});

    map = new Map({
      target: target,
      layers: [layer],
      view: new _ol_View_({
        projection: 'EPSG:4326',
        center: [0, 0],
        resolution: 1
      })
    });

    map.once('postrender', function() {
      done();
    });
  });

  afterEach(function() {
    map.dispose();
    document.body.removeChild(target);
  });

  /**
   * Simulates a browser event on the map viewport.  The client x/y location
   * will be adjusted as if the map were centered at 0,0.
   * @param {string} type Event type.
   * @param {number} x Horizontal offset from map center.
   * @param {number} y Vertical offset from map center.
   * @param {Object} modifiers Lookup of modifier keys.
   * @param {number} button The mouse button.
   */
  function simulateEvent(type, x, y, modifiers, button) {
    modifiers = modifiers || {};
    var viewport = map.getViewport();
    // calculated in case body has top < 0 (test runner with small window)
    var position = viewport.getBoundingClientRect();
    var pointerEvent = new _ol_pointer_PointerEvent_(type, {
      type: type,
      clientX: position.left + x + width / 2,
      clientY: position.top + y + height / 2,
      shiftKey: modifiers.shift || false,
      altKey: modifiers.alt || false
    }, {
      button: button,
      isPrimary: true
    });
    var event = new MapBrowserPointerEvent(type, map, pointerEvent);
    event.pointerEvent.pointerId = 1;
    map.handleMapBrowserEvent(event);
  }

  /**
   * Tracks events triggered by the interaction as well as feature
   * modifications. Helper function to
   * @param {ol.Feature} feature Modified feature.
   * @param {ol.interaction.Modify} interaction The interaction.
   * @return {Array<ol.interaction.Modify.Event|string>} events
   */
  function trackEvents(feature, interaction) {
    var events = [];
    feature.on('change', function(event) {
      events.push('change');
    });
    interaction.on('modifystart', function(event) {
      events.push(event);
    });
    interaction.on('modifyend', function(event) {
      events.push(event);
    });
    return events;
  }

  /**
  * Validates the event array to verify proper event sequence. Checks
  * that first and last event are correct ModifyEvents and that feature
  * modifications event are in between.
  * @param {Array<ol.interaction.Modify.Event|string>} events The events.
  * @param {Array<ol.Feature>} features The features.
  */
  function validateEvents(events, features) {

    var startevent = events[0];
    var endevent = events[events.length - 1];

    // first event should be modifystary
    expect(startevent).to.be.an(_ol_interaction_Modify_.Event);
    expect(startevent.type).to.eql('modifystart');

    // last event should be modifyend
    expect(endevent).to.be.an(_ol_interaction_Modify_.Event);
    expect(endevent.type).to.eql('modifyend');

    // make sure we get change events to events array
    expect(events.length > 2).to.be(true);
    // middle events should be feature modification events
    for (var i = 1; i < events.length - 1; i++) {
      expect(events[i]).to.equal('change');
    }

    // ModifyEvents should include the expected features
    expect(startevent.features.getArray()).to.eql(features);
    expect(endevent.features.getArray()).to.eql(features);
  }

  describe('constructor', function() {
    it('adds features to the RTree', function() {
      var feature = new _ol_Feature_(
          new Point([0, 0]));
      var features = new _ol_Collection_([feature]);
      var modify = new _ol_interaction_Modify_({
        features: features
      });
      var rbushEntries = modify.rBush_.getAll();
      expect(rbushEntries.length).to.be(1);
      expect(rbushEntries[0].feature).to.be(feature);
    });

    it('accepts feature without geometry', function() {
      var feature = new _ol_Feature_();
      var features = new _ol_Collection_([feature]);
      var modify = new _ol_interaction_Modify_({
        features: features
      });
      var rbushEntries = modify.rBush_.getAll();
      expect(rbushEntries.length).to.be(0);

      feature.setGeometry(new Point([0, 10]));
      rbushEntries = modify.rBush_.getAll();
      expect(rbushEntries.length).to.be(1);
      expect(rbushEntries[0].feature).to.be(feature);
    });

    it('accepts a source', function() {
      var feature = new _ol_Feature_(
          new Point([0, 0]));
      var source = new _ol_source_Vector_({features: [feature]});
      var modify = new _ol_interaction_Modify_({source: source});
      var rbushEntries = modify.rBush_.getAll();
      expect(rbushEntries.length).to.be(1);
      expect(rbushEntries[0].feature).to.be(feature);
    });

  });

  describe('vertex deletion', function() {

    it('works when clicking on a shared vertex', function() {
      features.push(features[0].clone());

      var first = features[0];
      var firstRevision = first.getGeometry().getRevision();
      var second = features[1];
      var secondRevision = second.getGeometry().getRevision();

      var modify = new _ol_interaction_Modify_({
        features: new _ol_Collection_(features)
      });
      map.addInteraction(modify);

      var events = trackEvents(first, modify);

      expect(first.getGeometry().getRevision()).to.equal(firstRevision);
      expect(first.getGeometry().getCoordinates()[0]).to.have.length(5);
      expect(second.getGeometry().getRevision()).to.equal(secondRevision);
      expect(second.getGeometry().getCoordinates()[0]).to.have.length(5);

      simulateEvent('pointerdown', 10, -20, {alt: true}, 0);
      simulateEvent('pointerup', 10, -20, {alt: true}, 0);
      simulateEvent('click', 10, -20, {alt: true}, 0);
      simulateEvent('singleclick', 10, -20, {alt: true}, 0);

      expect(first.getGeometry().getRevision()).to.equal(firstRevision + 1);
      expect(first.getGeometry().getCoordinates()[0]).to.have.length(4);
      expect(second.getGeometry().getRevision()).to.equal(secondRevision + 1);
      expect(second.getGeometry().getCoordinates()[0]).to.have.length(4);

      validateEvents(events, features);
    });

    it('deletes first vertex of a LineString', function() {
      var lineFeature = new _ol_Feature_({
        geometry: new LineString(
            [[0, 0], [10, 20], [0, 40], [40, 40], [40, 0]]
        )
      });
      features.length = 0;
      features.push(lineFeature);
      features.push(lineFeature.clone());

      var first = features[0];
      var firstRevision = first.getGeometry().getRevision();

      var modify = new _ol_interaction_Modify_({
        features: new _ol_Collection_(features)
      });
      map.addInteraction(modify);

      var events = trackEvents(first, modify);

      expect(first.getGeometry().getRevision()).to.equal(firstRevision);
      expect(first.getGeometry().getCoordinates()).to.have.length(5);

      simulateEvent('pointerdown', 0, 0, {alt: true}, 0);
      simulateEvent('pointerup', 0, 0, {alt: true}, 0);
      simulateEvent('click', 0, 0, {alt: true}, 0);
      simulateEvent('singleclick', 0, 0, {alt: true}, 0);

      expect(first.getGeometry().getRevision()).to.equal(firstRevision + 1);
      expect(first.getGeometry().getCoordinates()).to.have.length(4);
      expect(first.getGeometry().getCoordinates()[0][0]).to.equal(10);
      expect(first.getGeometry().getCoordinates()[0][1]).to.equal(20);

      validateEvents(events, features);
    });

    it('deletes last vertex of a LineString', function() {
      var lineFeature = new _ol_Feature_({
        geometry: new LineString(
            [[0, 0], [10, 20], [0, 40], [40, 40], [40, 0]]
        )
      });
      features.length = 0;
      features.push(lineFeature);
      features.push(lineFeature.clone());

      var first = features[0];
      var firstRevision = first.getGeometry().getRevision();

      var modify = new _ol_interaction_Modify_({
        features: new _ol_Collection_(features)
      });
      map.addInteraction(modify);

      var events = trackEvents(first, modify);

      expect(first.getGeometry().getRevision()).to.equal(firstRevision);
      expect(first.getGeometry().getCoordinates()).to.have.length(5);

      simulateEvent('pointerdown', 40, 0, {alt: true}, 0);
      simulateEvent('pointerup', 40, 0, {alt: true}, 0);
      simulateEvent('click', 40, 0, {alt: true}, 0);
      simulateEvent('singleclick', 40, 0, {alt: true}, 0);

      expect(first.getGeometry().getRevision()).to.equal(firstRevision + 1);
      expect(first.getGeometry().getCoordinates()).to.have.length(4);
      expect(first.getGeometry().getCoordinates()[3][0]).to.equal(40);
      expect(first.getGeometry().getCoordinates()[3][1]).to.equal(40);

      validateEvents(events, features);
    });

    it('deletes vertex of a LineString programmatically', function() {
      var lineFeature = new _ol_Feature_({
        geometry: new LineString(
            [[0, 0], [10, 20], [0, 40], [40, 40], [40, 0]]
        )
      });
      features.length = 0;
      features.push(lineFeature);
      features.push(lineFeature.clone());

      var first = features[0];
      var firstRevision = first.getGeometry().getRevision();

      var modify = new _ol_interaction_Modify_({
        features: new _ol_Collection_(features)
      });
      map.addInteraction(modify);

      var events = trackEvents(first, modify);

      expect(first.getGeometry().getRevision()).to.equal(firstRevision);
      expect(first.getGeometry().getCoordinates()).to.have.length(5);

      simulateEvent('pointerdown', 40, 0, null, 0);
      simulateEvent('pointerup', 40, 0, null, 0);

      var removed = modify.removePoint();

      expect(removed).to.be(true);
      expect(first.getGeometry().getRevision()).to.equal(firstRevision + 1);
      expect(first.getGeometry().getCoordinates()).to.have.length(4);
      expect(first.getGeometry().getCoordinates()[3][0]).to.equal(40);
      expect(first.getGeometry().getCoordinates()[3][1]).to.equal(40);

      validateEvents(events, features);
    });


  });

  describe('vertex modification', function() {

    it('keeps the third dimension', function() {
      var lineFeature = new _ol_Feature_({
        geometry: new LineString(
            [[0, 0, 10], [10, 20, 20], [0, 40, 30], [40, 40, 40], [40, 0, 50]]
        )
      });
      features.length = 0;
      features.push(lineFeature);

      var modify = new _ol_interaction_Modify_({
        features: new _ol_Collection_(features)
      });
      map.addInteraction(modify);

      // Move first vertex
      simulateEvent('pointermove', 0, 0, null, 0);
      simulateEvent('pointerdown', 0, 0, null, 0);
      simulateEvent('pointermove', -10, -10, null, 0);
      simulateEvent('pointerdrag', -10, -10, null, 0);
      simulateEvent('pointerup', -10, -10, null, 0);

      // Move middle vertex
      simulateEvent('pointermove', 0, -40, null, 0);
      simulateEvent('pointerdown', 0, -40, null, 0);
      simulateEvent('pointermove', 10, -30, null, 0);
      simulateEvent('pointerdrag', 10, -30, null, 0);
      simulateEvent('pointerup', 10, -30, null, 0);

      // Move last vertex
      simulateEvent('pointermove', 40, 0, null, 0);
      simulateEvent('pointerdown', 40, 0, null, 0);
      simulateEvent('pointermove', 50, -10, null, 0);
      simulateEvent('pointerdrag', 50, -10, null, 0);
      simulateEvent('pointerup', 50, -10, null, 0);

      expect(lineFeature.getGeometry().getCoordinates()[0][2]).to.equal(10);
      expect(lineFeature.getGeometry().getCoordinates()[2][2]).to.equal(30);
      expect(lineFeature.getGeometry().getCoordinates()[4][2]).to.equal(50);
    });

  });

  describe('circle modification', function() {
    it('changes the circle radius and center', function() {
      var circleFeature = new _ol_Feature_(new Circle([10, 10], 20));
      features.length = 0;
      features.push(circleFeature);

      var modify = new _ol_interaction_Modify_({
        features: new _ol_Collection_(features)
      });
      map.addInteraction(modify);

      // Change center
      simulateEvent('pointermove', 10, -10, null, 0);
      simulateEvent('pointerdown', 10, -10, null, 0);
      simulateEvent('pointermove', 5, -5, null, 0);
      simulateEvent('pointerdrag', 5, -5, null, 0);
      simulateEvent('pointerup', 5, -5, null, 0);

      expect(circleFeature.getGeometry().getRadius()).to.equal(20);
      expect(circleFeature.getGeometry().getCenter()).to.eql([5, 5]);

      // Increase radius
      simulateEvent('pointermove', 25, -4, null, 0);
      simulateEvent('pointerdown', 25, -4, null, 0);
      simulateEvent('pointermove', 30, -5, null, 0);
      simulateEvent('pointerdrag', 30, -5, null, 0);
      simulateEvent('pointerup', 30, -5, null, 0);

      expect(circleFeature.getGeometry().getRadius()).to.equal(25);
      expect(circleFeature.getGeometry().getCenter()).to.eql([5, 5]);
    });
  });

  describe('boundary modification', function() {
    var modify, feature, events;

    beforeEach(function() {
      modify = new _ol_interaction_Modify_({
        features: new _ol_Collection_(features)
      });
      map.addInteraction(modify);

      feature = features[0];

      events = trackEvents(feature, modify);
    });

    it('clicking vertex should delete it and +r1', function() {
      expect(feature.getGeometry().getRevision()).to.equal(1);
      expect(feature.getGeometry().getCoordinates()[0]).to.have.length(5);

      simulateEvent('pointerdown', 10, -20, {alt: true}, 0);
      simulateEvent('pointerup', 10, -20, {alt: true}, 0);
      simulateEvent('click', 10, -20, {alt: true}, 0);
      simulateEvent('singleclick', 10, -20, {alt: true}, 0);

      expect(feature.getGeometry().getRevision()).to.equal(2);
      expect(feature.getGeometry().getCoordinates()[0]).to.have.length(4);

      validateEvents(events, [feature]);
    });

    it('single clicking boundary should add vertex and +r1', function() {
      expect(feature.getGeometry().getRevision()).to.equal(1);
      expect(feature.getGeometry().getCoordinates()[0]).to.have.length(5);

      simulateEvent('pointerdown', 40, -20, null, 0);
      simulateEvent('pointerup', 40, -20, null, 0);
      simulateEvent('click', 40, -20, null, 0);
      simulateEvent('singleclick', 40, -20, null, 0);

      expect(feature.getGeometry().getRevision()).to.equal(2);
      expect(feature.getGeometry().getCoordinates()[0]).to.have.length(6);

      validateEvents(events, [feature]);
    });

    it('single clicking on created vertex should delete it again', function() {
      expect(feature.getGeometry().getRevision()).to.equal(1);
      expect(feature.getGeometry().getCoordinates()[0]).to.have.length(5);

      simulateEvent('pointerdown', 40, -20, null, 0);
      simulateEvent('pointerup', 40, -20, null, 0);
      simulateEvent('click', 40, -20, null, 0);
      simulateEvent('singleclick', 40, -20, null, 0);

      expect(feature.getGeometry().getRevision()).to.equal(2);
      expect(feature.getGeometry().getCoordinates()[0]).to.have.length(6);

      validateEvents(events, [feature]);
      events.length = 0;

      simulateEvent('pointerdown', 40, -20, {alt: true}, 0);
      simulateEvent('pointerup', 40, -20, {alt: true}, 0);
      simulateEvent('click', 40, -20, {alt: true}, 0);
      simulateEvent('singleclick', 40, -20, {alt: true}, 0);

      expect(feature.getGeometry().getRevision()).to.equal(3);
      expect(feature.getGeometry().getCoordinates()[0]).to.have.length(5);

      validateEvents(events, [feature]);
    });

    it('clicking with drag should add vertex and +r3', function() {
      expect(feature.getGeometry().getRevision()).to.equal(1);
      expect(feature.getGeometry().getCoordinates()[0]).to.have.length(5);

      simulateEvent('pointermove', 40, -20, null, 0);
      simulateEvent('pointerdown', 40, -20, null, 0);
      simulateEvent('pointermove', 30, -20, null, 0);
      simulateEvent('pointerdrag', 30, -20, null, 0);
      simulateEvent('pointerup', 30, -20, null, 0);

      expect(feature.getGeometry().getRevision()).to.equal(4);
      expect(feature.getGeometry().getCoordinates()[0]).to.have.length(6);

      validateEvents(events, [feature]);
    });

    it('clicking with right button should not add a vertex', function() {
      expect(feature.getGeometry().getRevision()).to.equal(1);
      expect(feature.getGeometry().getCoordinates()[0]).to.have.length(5);

      simulateEvent('pointermove', 40, -20, null, 0);
      // right click
      simulateEvent('pointerdown', 40, -20, null, 1);
      simulateEvent('pointermove', 30, -20, null, 1);
      simulateEvent('pointerdrag', 30, -20, null, 1);
      simulateEvent('pointerup', 30, -20, null, 1);

      expect(feature.getGeometry().getRevision()).to.equal(1);
      expect(feature.getGeometry().getCoordinates()[0]).to.have.length(5);
      expect(events).to.have.length(0);
    });

  });

  describe('double click deleteCondition', function() {

    var modify, feature, events;

    beforeEach(function() {
      modify = new _ol_interaction_Modify_({
        features: new _ol_Collection_(features),
        deleteCondition: _ol_events_condition_.doubleClick
      });
      map.addInteraction(modify);

      feature = features[0];

      events = trackEvents(feature, modify);
    });

    it('should delete vertex on double click', function() {

      expect(feature.getGeometry().getRevision()).to.equal(1);
      expect(feature.getGeometry().getCoordinates()[0]).to.have.length(5);

      simulateEvent('pointerdown', 10, -20, null, 0);
      simulateEvent('pointerup', 10, -20, null, 0);
      simulateEvent('click', 10, -20, null, 0);
      simulateEvent('pointerdown', 10, -20, null, 0);
      simulateEvent('pointerup', 10, -20, null, 0);
      simulateEvent('click', 10, -20, null, 0);
      simulateEvent('dblclick', 10, -20, null, 0);

      expect(feature.getGeometry().getRevision()).to.equal(2);
      expect(feature.getGeometry().getCoordinates()[0]).to.have.length(4);

      validateEvents(events, features);
    });

    it('should do nothing on single click', function() {

      expect(feature.getGeometry().getRevision()).to.equal(1);
      expect(feature.getGeometry().getCoordinates()[0]).to.have.length(5);

      simulateEvent('pointerdown', 10, -20, null, 0);
      simulateEvent('pointerup', 10, -20, null, 0);
      simulateEvent('click', 10, -20, null, 0);
      simulateEvent('singleclick', 10, -20, null, 0);

      expect(feature.getGeometry().getRevision()).to.equal(1);
      expect(feature.getGeometry().getCoordinates()[0]).to.have.length(5);

      expect(events.length).to.eql(0);
    });
  });

  describe('insertVertexCondition', function() {
    it('calls the callback function', function() {
      var listenerSpy = sinon.spy(function(event) {
        return false;
      });

      var modify = new _ol_interaction_Modify_({
        features: new _ol_Collection_(features),
        insertVertexCondition: listenerSpy
      });
      map.addInteraction(modify);
      var feature = features[0];

      // move first vertex
      simulateEvent('pointermove', 0, 0, null, 0);
      simulateEvent('pointerdown', 0, 0, null, 0);
      simulateEvent('pointermove', -10, -10, null, 0);
      simulateEvent('pointerdrag', -10, -10, null, 0);
      simulateEvent('pointerup', -10, -10, null, 0);

      expect(listenerSpy.callCount).to.be(0);
      expect(feature.getGeometry().getCoordinates()[0]).to.have.length(5);

      // try to add vertex
      simulateEvent('pointerdown', 40, -20, null, 0);
      simulateEvent('pointerup', 40, -20, null, 0);
      simulateEvent('click', 40, -20, null, 0);
      simulateEvent('singleclick', 40, -20, null, 0);

      expect(listenerSpy.callCount).to.be(1);
      expect(feature.getGeometry().getCoordinates()[0]).to.have.length(5);
    });
  });

  describe('handle feature change', function() {
    var getListeners;

    beforeEach(function() {
      getListeners = function(feature, modify) {
        var listeners = _ol_events_.getListeners(
            feature, 'change');
        return listeners.filter(function(listener) {
          return listener.bindTo === modify;
        });
      };
    });

    it('updates circle segment data', function() {
      var feature = new _ol_Feature_(new Circle([10, 10], 20));
      features.length = 0;
      features.push(feature);

      var modify = new _ol_interaction_Modify_({
        features: new _ol_Collection_(features)
      });
      map.addInteraction(modify);

      var listeners;

      listeners = getListeners(feature, modify);
      expect(listeners).to.have.length(1);

      var firstSegmentData;

      firstSegmentData = modify.rBush_.forEachInExtent([0, 0, 5, 5],
          function(node) {
            return node;
          });
      expect(firstSegmentData.segment[0]).to.eql([10, 10]);
      expect(firstSegmentData.segment[1]).to.eql([10, 10]);

      var center = feature.getGeometry().getCenter();
      center[0] = 1;
      center[1] = 1;
      feature.getGeometry().setCenter(center);

      firstSegmentData = modify.rBush_.forEachInExtent([0, 0, 5, 5],
          function(node) {
            return node;
          });
      expect(firstSegmentData.segment[0]).to.eql([1, 1]);
      expect(firstSegmentData.segment[1]).to.eql([1, 1]);

      listeners = getListeners(feature, modify);
      expect(listeners).to.have.length(1);
    });

    it('updates polygon segment data', function() {
      var modify = new _ol_interaction_Modify_({
        features: new _ol_Collection_(features)
      });
      map.addInteraction(modify);

      var feature = features[0];
      var listeners;

      listeners = getListeners(feature, modify);
      expect(listeners).to.have.length(1);

      var firstSegmentData;

      firstSegmentData = modify.rBush_.forEachInExtent([0, 0, 5, 5],
          function(node) {
            return node;
          });
      expect(firstSegmentData.segment[0]).to.eql([0, 0]);
      expect(firstSegmentData.segment[1]).to.eql([10, 20]);

      var coordinates = feature.getGeometry().getCoordinates();
      var firstVertex = coordinates[0][0];
      firstVertex[0] = 1;
      firstVertex[1] = 1;
      feature.getGeometry().setCoordinates(coordinates);

      firstSegmentData = modify.rBush_.forEachInExtent([0, 0, 5, 5],
          function(node) {
            return node;
          });
      expect(firstSegmentData.segment[0]).to.eql([1, 1]);
      expect(firstSegmentData.segment[1]).to.eql([10, 20]);

      listeners = getListeners(feature, modify);
      expect(listeners).to.have.length(1);
    });
  });

  describe('#setActive', function() {
    it('removes the vertexFeature of deactivation', function() {
      var modify = new _ol_interaction_Modify_({
        features: new _ol_Collection_(features)
      });
      map.addInteraction(modify);
      expect(modify.vertexFeature_).to.be(null);

      simulateEvent('pointermove', 10, -20, null, 0);
      expect(modify.vertexFeature_).to.not.be(null);

      modify.setActive(false);
      expect(modify.vertexFeature_).to.be(null);
    });
  });

});
