import _ol_geom_flat_length_ from '../../../../../src/ol/geom/flat/length.js';


describe('ol.geom.flat.length', function() {

  describe('ol.geom.flat.length.lineString', function() {

    describe('stride = 2', function() {
      var flatCoords = [0, 0, 1, 0, 1, 1, 0, 1];
      var stride = 2;

      it('calculates the total length of a lineString', function() {
        var offset = 0;
        var end = 8;
        var expected = 3;
        var got = _ol_geom_flat_length_.lineString(flatCoords, offset, end, stride);
        expect(got).to.be(expected);
      });

      it('calculates a partwise length of a lineString (offset)', function() {
        var offset = 2;
        var end = 8;
        var expected = 2;
        var got = _ol_geom_flat_length_.lineString(flatCoords, offset, end, stride);
        expect(got).to.be(expected);
      });

      it('calculates a partwise length of a lineString (end)', function() {
        var offset = 0;
        var end = 4;
        var expected = 1;
        var got = _ol_geom_flat_length_.lineString(flatCoords, offset, end, stride);
        expect(got).to.be(expected);
      });

    });

    describe('stride = 3', function() {
      var flatCoords = [0, 0, 42, 1, 0, 42, 1, 1, 42, 0, 1, 42];
      var stride = 3;

      it('calculates the total length of a lineString', function() {
        var offset = 0;
        var end = 12;
        var expected = 3;
        var got = _ol_geom_flat_length_.lineString(flatCoords, offset, end, stride);
        expect(got).to.be(expected);
      });

      it('calculates a partwise length of a lineString (offset)', function() {
        var offset = 3;
        var end = 12;
        var expected = 2;
        var got = _ol_geom_flat_length_.lineString(flatCoords, offset, end, stride);
        expect(got).to.be(expected);
      });

      it('calculates a partwise length of a lineString (end)', function() {
        var offset = 0;
        var end = 6;
        var expected = 1;
        var got = _ol_geom_flat_length_.lineString(flatCoords, offset, end, stride);
        expect(got).to.be(expected);
      });

    });
  });

  describe('ol.geom.flat.length.linearRing', function() {

    it('calculates the total length of a simple linearRing', function() {
      var flatCoords = [0, 0, 1, 0, 1, 1, 0, 1];
      var stride = 2;
      var offset = 0;
      var end = 8;
      var expected = 4;
      var got = _ol_geom_flat_length_.linearRing(flatCoords, offset, end, stride);
      expect(got).to.be(expected);
    });

    it('calculates the total length of a figure-8 linearRing', function() {
      var flatCoords = [0, 0, 1, 0, 1, 1, 0, 1, 0, -1, -1, -1, -1, 0];
      var stride = 2;
      var offset = 0;
      var end = 14;
      var expected = 8;
      var got = _ol_geom_flat_length_.linearRing(flatCoords, offset, end, stride);
      expect(got).to.be(expected);
    });

  });

});
