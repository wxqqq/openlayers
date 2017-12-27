import TileLayer from '../../../../src/ol/layer/Tile.js';
import _ol_source_OSM_ from '../../../../src/ol/source/OSM.js';


describe('ol.layer.Tile', function() {

  describe('constructor (defaults)', function() {

    var layer;

    beforeEach(function() {
      layer = new TileLayer({
        source: new _ol_source_OSM_()
      });
    });

    afterEach(function() {
      layer.dispose();
    });

    it('creates an instance', function() {
      expect(layer).to.be.a(TileLayer);
    });

    it('provides default preload', function() {
      expect(layer.getPreload()).to.be(0);
    });

    it('provides default useInterimTilesOnError', function() {
      expect(layer.getUseInterimTilesOnError()).to.be(true);
    });

  });

});
