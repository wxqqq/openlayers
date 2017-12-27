import _ol_Collection_ from '../../../../src/ol/Collection.js';
import _ol_Feature_ from '../../../../src/ol/Feature.js';
import Map from '../../../../src/ol/Map.js';
import _ol_View_ from '../../../../src/ol/View.js';
import Circle from '../../../../src/ol/geom/Circle.js';
import Point from '../../../../src/ol/geom/Point.js';
import LineString from '../../../../src/ol/geom/LineString.js';
import _ol_interaction_Snap_ from '../../../../src/ol/interaction/Snap.js';


describe('ol.interaction.Snap', function() {

  describe('constructor', function() {

    it('can be constructed without arguments', function() {
      var instance = new _ol_interaction_Snap_();
      expect(instance).to.be.an(_ol_interaction_Snap_);
    });

  });

  describe('handleEvent_', function() {
    var target, map;

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

      map = new Map({
        target: target,
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

    it('can handle XYZ coordinates', function() {
      var point = new _ol_Feature_(new Point([0, 0, 123]));
      var snapInteraction = new _ol_interaction_Snap_({
        features: new _ol_Collection_([point])
      });
      snapInteraction.setMap(map);

      var event = {
        pixel: [width / 2, height / 2],
        coordinate: [0, 0],
        map: map
      };
      _ol_interaction_Snap_.handleEvent_.call(snapInteraction, event);
      // check that the coordinate is in XY and not XYZ
      expect(event.coordinate).to.eql([0, 0]);
    });

    it('snaps to edges only', function() {
      var point = new _ol_Feature_(new LineString([[-10, 0], [10, 0]]));
      var snapInteraction = new _ol_interaction_Snap_({
        features: new _ol_Collection_([point]),
        pixelTolerance: 5,
        vertex: false
      });
      snapInteraction.setMap(map);

      var event = {
        pixel: [7 + width / 2,  height / 2 - 4],
        coordinate: [7, 4],
        map: map
      };
      _ol_interaction_Snap_.handleEvent_.call(snapInteraction, event);
      expect(event.coordinate).to.eql([7, 0]);
    });

    it('snaps to vertices only', function() {
      var point = new _ol_Feature_(new LineString([[-10, 0], [10, 0]]));
      var snapInteraction = new _ol_interaction_Snap_({
        features: new _ol_Collection_([point]),
        pixelTolerance: 5,
        edge: false
      });
      snapInteraction.setMap(map);

      var event = {
        pixel: [7 + width / 2,  height / 2 - 4],
        coordinate: [7, 4],
        map: map
      };
      _ol_interaction_Snap_.handleEvent_.call(snapInteraction, event);
      expect(event.coordinate).to.eql([10, 0]);
    });

    it('snaps to circle', function() {
      var circle = new _ol_Feature_(new Circle([0, 0], 10));
      var snapInteraction = new _ol_interaction_Snap_({
        features: new _ol_Collection_([circle]),
        pixelTolerance: 5
      });
      snapInteraction.setMap(map);

      var event = {
        pixel: [5 + width / 2,  height / 2 - 5],
        coordinate: [5, 5],
        map: map
      };
      _ol_interaction_Snap_.handleEvent_.call(snapInteraction, event);

      expect(event.coordinate[0]).to.roughlyEqual(Math.sin(Math.PI / 4) * 10, 1e-10);
      expect(event.coordinate[1]).to.roughlyEqual(Math.sin(Math.PI / 4) * 10, 1e-10);
    });

    it('handle feature without geometry', function() {
      var feature = new _ol_Feature_();
      var snapInteraction = new _ol_interaction_Snap_({
        features: new _ol_Collection_([feature]),
        pixelTolerance: 5,
        edge: false
      });
      snapInteraction.setMap(map);

      feature.setGeometry(new LineString([[-10, 0], [10, 0]]));

      var event = {
        pixel: [7 + width / 2, height / 2 - 4],
        coordinate: [7, 4],
        map: map
      };
      _ol_interaction_Snap_.handleEvent_.call(snapInteraction, event);
      expect(event.coordinate).to.eql([10, 0]);
    });

    it('handle geometry changes', function() {
      var line = new _ol_Feature_(new LineString([[-10, 0], [0, 0]]));
      var snapInteraction = new _ol_interaction_Snap_({
        features: new _ol_Collection_([line]),
        pixelTolerance: 5,
        edge: false
      });
      snapInteraction.setMap(map);

      line.getGeometry().setCoordinates([[-10, 0], [10, 0]]);

      var event = {
        pixel: [7 + width / 2, height / 2 - 4],
        coordinate: [7, 4],
        map: map
      };
      _ol_interaction_Snap_.handleEvent_.call(snapInteraction, event);
      expect(event.coordinate).to.eql([10, 0]);
    });

    it('handle geometry name changes', function() {
      var line = new _ol_Feature_({
        geometry: new LineString([[-10, 0], [0, 0]]),
        alt_geometry: new LineString([[-10, 0], [10, 0]])
      });
      var snapInteraction = new _ol_interaction_Snap_({
        features: new _ol_Collection_([line]),
        pixelTolerance: 5,
        edge: false
      });
      snapInteraction.setMap(map);

      line.setGeometryName('alt_geometry');

      var event = {
        pixel: [7 + width / 2, height / 2 - 4],
        coordinate: [7, 4],
        map: map
      };
      _ol_interaction_Snap_.handleEvent_.call(snapInteraction, event);
      expect(event.coordinate).to.eql([10, 0]);
    });


  });

});
