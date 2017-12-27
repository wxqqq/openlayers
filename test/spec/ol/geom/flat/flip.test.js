import _ol_geom_flat_flip_ from '../../../../../src/ol/geom/flat/flip.js';


describe('ol.geom.flat.flip', function() {

  describe('ol.geom.flat.flip.flipXY', function() {

    it('can flip XY coordinates', function() {
      var flatCoordinates = _ol_geom_flat_flip_.flipXY([1, 2, 3, 4], 0, 4, 2);
      expect(flatCoordinates).to.eql([2, 1, 4, 3]);
    });

    it('can flip XY coordinates while preserving other dimensions', function() {
      var flatCoordinates = _ol_geom_flat_flip_.flipXY(
          [1, 2, 3, 4, 5, 6, 7, 8], 0, 8, 4);
      expect(flatCoordinates).to.eql([2, 1, 3, 4, 6, 5, 7, 8]);
    });

    it('can flip XY coordinates in place', function() {
      var flatCoordinates = [1, 2, 3, 4];
      expect(_ol_geom_flat_flip_.flipXY(
          flatCoordinates, 0, 4, 2, flatCoordinates)).to.be(flatCoordinates);
      expect(flatCoordinates).to.eql([2, 1, 4, 3]);
    });

    it('can flip XY coordinates in place while preserving other dimensions',
        function() {
          var flatCoordinates = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          expect(_ol_geom_flat_flip_.flipXY(
              flatCoordinates, 0, 9, 3, flatCoordinates)).
              to.be(flatCoordinates);
          expect(flatCoordinates).to.eql([2, 1, 3, 5, 4, 6, 8, 7, 9]);
        });

  });

});
