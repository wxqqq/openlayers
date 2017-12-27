import _ol_geom_flat_interpolate_ from '../../../../../src/ol/geom/flat/interpolate.js';


describe('ol.geom.flat.interpolate', function() {

  describe('ol.geom.flat.interpolate.lineString', function() {

    it('returns the expected value for single points', function() {
      var flatCoordinates = [0, 1];
      var point =
          _ol_geom_flat_interpolate_.lineString(flatCoordinates, 0, 2, 2, 0.5);
      expect(point).to.eql([0, 1]);
    });

    it('returns the expected value for simple line segments', function() {
      var flatCoordinates = [0, 1, 2, 3];
      var point =
          _ol_geom_flat_interpolate_.lineString(flatCoordinates, 0, 4, 2, 0.5);
      expect(point).to.eql([1, 2]);
    });

    it('returns the expected value when the mid point is an existing ' +
        'coordinate',
    function() {
      var flatCoordinates = [0, 1, 2, 3, 4, 5];
      var point = _ol_geom_flat_interpolate_.lineString(
          flatCoordinates, 0, 6, 2, 0.5);
      expect(point).to.eql([2, 3]);
    });

    xit('also when vertices are repeated', function() {
      var flatCoordinates = [0, 1, 2, 3, 2, 3, 4, 5];
      var point = _ol_geom_flat_interpolate_.lineString(
          flatCoordinates, 0, 6, 2, 0.5);
      expect(point).to.eql([2, 3]);
    });

    it('returns the expected value when the midpoint falls halfway between ' +
        'two existing coordinates',
    function() {
      var flatCoordinates = [0, 1, 2, 3, 4, 5, 6, 7];
      var point = _ol_geom_flat_interpolate_.lineString(
          flatCoordinates, 0, 8, 2, 0.5);
      expect(point).to.eql([3, 4]);
    });

    xit('also when vertices are repeated', function() {
      var flatCoordinates = [0, 1, 2, 3, 2, 3, 4, 5, 6, 7];
      var point = _ol_geom_flat_interpolate_.lineString(
          flatCoordinates, 0, 8, 2, 0.5);
      expect(point).to.eql([3, 4]);
    });

    it('returns the expected value when the coordinates are not evenly spaced',
        function() {
          var flatCoordinates = [0, 1, 2, 3, 6, 7];
          var point = _ol_geom_flat_interpolate_.lineString(
              flatCoordinates, 0, 6, 2, 0.5);
          expect(point).to.eql([3, 4]);
        });

    xit('also when vertices are repeated',
        function() {
          var flatCoordinates = [0, 1, 2, 3, 2, 3, 6, 7];
          var point = _ol_geom_flat_interpolate_.lineString(
              flatCoordinates, 0, 6, 2, 0.5);
          expect(point).to.eql([3, 4]);
        });

    it('returns the expected value when using opt_dest',
        function() {
          var flatCoordinates = [0, 1, 2, 3, 6, 7];
          var point = _ol_geom_flat_interpolate_.lineString(
              flatCoordinates, 0, 6, 2, 0.5, [0, 0]);
          expect(point).to.eql([3, 4]);
        });

  });

});
