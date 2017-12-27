import _ol_Feature_ from '../../../../src/ol/Feature.js';
import OSMXML from '../../../../src/ol/format/OSMXML.js';
import Point from '../../../../src/ol/geom/Point.js';
import LineString from '../../../../src/ol/geom/LineString.js';
import {get as getProjection, transform} from '../../../../src/ol/proj.js';


describe('ol.format.OSMXML', function() {

  var format;
  beforeEach(function() {
    format = new OSMXML();
  });

  describe('#readProjection', function() {
    it('returns the default projection from document', function() {
      var projection = format.readProjectionFromDocument();
      expect(projection).to.eql(getProjection('EPSG:4326'));
    });

    it('returns the default projection from node', function() {
      var projection = format.readProjectionFromNode();
      expect(projection).to.eql(getProjection('EPSG:4326'));
    });
  });

  describe('#readFeatures', function() {

    it('can read an empty document', function() {
      var text =
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<osm version="0.6" generator="my hand">' +
          '</osm>';
      var fs = format.readFeatures(text);
      expect(fs).to.have.length(0);
    });

    it('can read nodes', function() {
      var text =
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<osm version="0.6" generator="my hand">' +
          '  <node id="1" lat="1" lon="2">' +
          '    <tag k="name" v="1"/>' +
          '  </node>' +
          '  <node id="2" lat="3" lon="4">' +
          '    <tag k="name" v="2"/>' +
          '  </node>' +
          '</osm>';
      var fs = format.readFeatures(text);
      expect(fs).to.have.length(2);
      var f = fs[0];
      expect(f).to.be.an(_ol_Feature_);
      var g = f.getGeometry();
      expect(g).to.be.an(Point);
      expect(g.getCoordinates()).to.eql([2, 1]);
    });

    it('can read nodes and ways', function() {
      var text =
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<osm version="0.6" generator="my hand">' +
          '  <node id="1" lat="1" lon="2">' +
          '    <tag k="name" v="1"/>' +
          '  </node>' +
          '  <node id="2" lat="3" lon="4">' +
          '    <tag k="name" v="2"/>' +
          '  </node>' +
          '  <way id="3">' +
          '    <tag k="name" v="3"/>' +
          '    <nd ref="1" />' +
          '    <nd ref="2" />' +
          '  </way>' +
          '</osm>';
      var fs = format.readFeatures(text);
      expect(fs).to.have.length(3);
      var point = fs[0];
      expect(point).to.be.an(_ol_Feature_);
      var g = point.getGeometry();
      expect(g).to.be.an(Point);
      expect(g.getCoordinates()).to.eql([2, 1]);
      var line = fs[2];
      expect(line).to.be.an(_ol_Feature_);
      g = line.getGeometry();
      expect(g).to.be.an(LineString);
      expect(g.getCoordinates()).to.eql([[2, 1], [4, 3]]);
    });


    it('can read ways before nodes', function() {
      var text =
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<osm version="0.6" generator="my hand">' +
          '  <way id="3">' +
          '    <tag k="name" v="3"/>' +
          '    <nd ref="1" />' +
          '    <nd ref="2" />' +
          '  </way>' +
          '  <node id="1" lat="1" lon="2">' +
          '    <tag k="name" v="1"/>' +
          '  </node>' +
          '  <node id="2" lat="3" lon="4">' +
          '    <tag k="name" v="2"/>' +
          '  </node>' +
          '</osm>';
      var fs = format.readFeatures(text);
      expect(fs).to.have.length(3);
      var line = fs[2];
      expect(line).to.be.an(_ol_Feature_);
      var g = line.getGeometry();
      expect(g).to.be.an(LineString);
      expect(g.getCoordinates()).to.eql([[2, 1], [4, 3]]);
    });


    it('can transform and read nodes', function() {
      var text =
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<osm version="0.6" generator="my hand">' +
          '  <node id="1" lat="1" lon="2">' +
          '    <tag k="name" v="1"/>' +
          '  </node>' +
          '  <node id="2" lat="3" lon="4">' +
          '    <tag k="name" v="2"/>' +
          '  </node>' +
          '</osm>';
      var fs = format.readFeatures(text, {
        featureProjection: 'EPSG:3857'
      });
      expect(fs).to.have.length(2);
      var f = fs[0];
      expect(f).to.be.an(_ol_Feature_);
      var g = f.getGeometry();
      expect(g).to.be.an(Point);
      expect(g.getCoordinates()).to.eql(
          transform([2, 1], 'EPSG:4326', 'EPSG:3857'));
    });

  });

});
