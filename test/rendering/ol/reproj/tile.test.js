import TileState from '../../../../src/ol/TileState.js';
import _ol_events_ from '../../../../src/ol/events.js';
import {get as getProjection} from '../../../../src/ol/proj.js';
import _ol_reproj_Tile_ from '../../../../src/ol/reproj/Tile.js';
import _ol_source_XYZ_ from '../../../../src/ol/source/XYZ.js';
import _ol_tilegrid_ from '../../../../src/ol/tilegrid.js';
import {register} from '../../../../src/ol/proj/proj4.js';


describe('ol.rendering.reproj.Tile', function() {

  function testSingleTile(source, targetProjection, targetTileGrid, z, x, y,
      pixelRatio, expectedUrl, expectedRequests, done) {
    var sourceProjection = source.getProjection();
    var sourceGutter = source.getGutter(sourceProjection);

    var tilesRequested = 0;

    var tile = new _ol_reproj_Tile_(sourceProjection, source.getTileGrid(),
        getProjection(targetProjection), targetTileGrid,
        [z, x, y], null, pixelRatio, sourceGutter,
        function(z, x, y, pixelRatio) {
          tilesRequested++;
          return source.getTile(z, x, y, pixelRatio, sourceProjection);
        });
    if (tile.getState() == TileState.IDLE) {
      _ol_events_.listen(tile, 'change', function(e) {
        if (tile.getState() == TileState.LOADED) {
          expect(tilesRequested).to.be(expectedRequests);
          resembleCanvas(tile.getImage(), expectedUrl, 7.5, done);
        }
      });
      tile.load();
    }
  }

  var source;

  describe('single tile reprojections from EPSG:3857', function() {
    beforeEach(function() {
      source = new _ol_source_XYZ_({
        projection: 'EPSG:3857',
        url: 'rendering/ol/data/tiles/osm/{z}/{x}/{y}.png'
      });
    });

    it('works for identity reprojection', function(done) {
      testSingleTile(source, 'EPSG:3857', source.getTileGrid(), 5, 5, -13, 1,
          'rendering/ol/data/tiles/osm/5/5/12.png', 1, done);
    });

    it('to EPSG:4326', function(done) {
      var tileGrid = _ol_tilegrid_.createForProjection('EPSG:4326', 7, [64, 64]);
      testSingleTile(source, 'EPSG:4326', tileGrid, 7, 21, -20, 1,
          'rendering/ol/reproj/expected/osm4326.png', 1, done);
    });

    it('to EPSG:5070', function(done) {
      proj4.defs('EPSG:5070',
          '+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 ' +
          '+y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
      register(proj4);
      var proj5070 = getProjection('EPSG:5070');
      proj5070.setExtent([-6e6, 0, 4e6, 6e6]);

      var tileGrid = _ol_tilegrid_.createForProjection('EPSG:5070', 5, [64, 64]);
      testSingleTile(source, 'EPSG:5070', tileGrid, 5, 13, -15, 1,
          'rendering/ol/reproj/expected/osm5070.png', 1, done);
    });

    it('to ESRI:54009', function(done) {
      proj4.defs('ESRI:54009',
          '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs');
      register(proj4);
      var proj54009 = getProjection('ESRI:54009');
      proj54009.setExtent([-18e6, -9e6, 18e6, 9e6]);

      var tileGrid = _ol_tilegrid_.createForProjection('ESRI:54009', 7, [64, 64]);
      testSingleTile(source, 'ESRI:54009', tileGrid, 7, 27, -16, 1,
          'rendering/ol/reproj/expected/osm54009.png', 1, done);
    });
  });

  describe('stitching several tiles from EPSG:3857', function() {
    beforeEach(function() {
      source = new _ol_source_XYZ_({
        projection: 'EPSG:3857',
        url: 'rendering/ol/data/tiles/osm/{z}/{x}/{y}.png'
      });
    });

    it('to EPSG:4326', function(done) {
      var tileGrid = _ol_tilegrid_.createForProjection('EPSG:4326', 7, [64, 64]);
      testSingleTile(source, 'EPSG:4326', tileGrid, 7, 23, -21, 1,
          'rendering/ol/reproj/expected/stitch-osm4326.png', 2, done);
    });

    it('to EPSG:3740', function(done) {
      proj4.defs('EPSG:3740',
          '+proj=utm +zone=10 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 ' +
          '+units=m +no_defs');
      register(proj4);
      var proj3740 = getProjection('EPSG:3740');
      proj3740.setExtent([318499.05, 2700792.39, 4359164.89, 7149336.98]);

      var tileGrid = _ol_tilegrid_.createForProjection('EPSG:3740', 4, [64, 64]);
      testSingleTile(source, 'EPSG:3740', tileGrid, 4, 4, -13, 1,
          'rendering/ol/reproj/expected/stitch-osm3740.png', 4, done);
    });
  });

  describe('tile projection from EPSG:4326', function() {
    beforeEach(function() {
      source = new _ol_source_XYZ_({
        projection: 'EPSG:4326',
        maxZoom: 0,
        url: 'rendering/ol/data/tiles/4326/{z}/{x}/{y}.png'
      });
    });

    it('works for identity reprojection', function(done) {
      testSingleTile(source, 'EPSG:4326', source.getTileGrid(), 0, 0, -1, 1,
          'rendering/ol/data/tiles/4326/0/0/0.png', 1, done);
    });

    it('to EPSG:3857', function(done) {
      var tileGrid = _ol_tilegrid_.createForProjection('EPSG:3857', 0, [64, 64]);
      testSingleTile(source, 'EPSG:3857', tileGrid, 0, 0, -1, 1,
          'rendering/ol/reproj/expected/4326-to-3857.png', 1, done);
    });
  });

  describe('non-square source tiles', function() {
    beforeEach(function() {
      source = new _ol_source_XYZ_({
        projection: 'EPSG:3857',
        url: 'rendering/ol/data/tiles/osm-512x256/{z}/{x}/{y}.png',
        tileSize: [512, 256]
      });
    });

    it('works for identity reprojection', function(done) {
      testSingleTile(source, 'EPSG:3857', source.getTileGrid(), 5, 3, -13, 1,
          'rendering/ol/data/tiles/osm-512x256/5/3/12.png', 1, done);
    });

    it('to 64x128 EPSG:4326', function(done) {
      var tileGrid = _ol_tilegrid_.createForProjection('EPSG:4326', 7, [64, 128]);
      testSingleTile(source, 'EPSG:4326', tileGrid, 7, 27, -10, 1,
          'rendering/ol/reproj/expected/512x256-to-64x128.png', 1, done);
    });
  });

  describe('dateline wrapping', function() {
    beforeEach(function() {
      source = new _ol_source_XYZ_({
        projection: 'EPSG:4326',
        maxZoom: 0,
        url: 'rendering/ol/data/tiles/4326/{z}/{x}/{y}.png'
      });
    });

    it('wraps X when prime meridian is shifted', function(done) {
      proj4.defs('merc_180', '+proj=merc +lon_0=180 +units=m +no_defs');
      register(proj4);
      var proj_ = getProjection('merc_180');
      proj_.setExtent([-20026376.39, -20048966.10, 20026376.39, 20048966.10]);

      var tileGrid = _ol_tilegrid_.createForProjection('merc_180', 0, [64, 64]);
      testSingleTile(source, 'merc_180', tileGrid, 0, 0, -1, 1,
          'rendering/ol/reproj/expected/dateline-merc-180.png', 2, done);
    });

    it('displays north pole correctly (EPSG:3413)', function(done) {
      proj4.defs('EPSG:3413', '+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 ' +
          '+k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs');
      register(proj4);
      var proj3413 = getProjection('EPSG:3413');
      proj3413.setExtent([-4194304, -4194304, 4194304, 4194304]);

      var tileGrid = _ol_tilegrid_.createForProjection('EPSG:3413', 0, [64, 64]);
      testSingleTile(source, 'EPSG:3413', tileGrid, 0, 0, -1, 1,
          'rendering/ol/reproj/expected/dateline-pole.png', 2, done);
    });
  });
});
