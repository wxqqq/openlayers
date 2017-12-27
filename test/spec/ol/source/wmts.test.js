import _ol_format_WMTSCapabilities_ from '../../../../src/ol/format/WMTSCapabilities.js';
import {get as getProjection} from '../../../../src/ol/proj.js';
import _ol_proj_Projection_ from '../../../../src/ol/proj/Projection.js';
import WMTSTileGrid from '../../../../src/ol/tilegrid/WMTS.js';
import _ol_source_WMTS_ from '../../../../src/ol/source/WMTS.js';


describe('ol.source.WMTS', function() {

  describe('when creating options from capabilities', function() {
    var parser = new _ol_format_WMTSCapabilities_();
    var capabilities, content;
    before(function(done) {
      afterLoadText('spec/ol/format/wmts/ogcsample.xml', function(xml) {
        try {
          content = xml;
          capabilities = parser.read(xml);
        } catch (e) {
          done(e);
        }
        done();
      });
    });

    it('returns null if the layer was not found in the capabilities', function() {
      var options = _ol_source_WMTS_.optionsFromCapabilities(capabilities, {
        layer: 'invalid'
      });

      expect(options).to.be(null);
    });

    it('passes the crossOrigin option', function() {
      var options = _ol_source_WMTS_.optionsFromCapabilities(capabilities, {
        layer: 'BlueMarbleNextGeneration',
        matrixSet: 'google3857',
        crossOrigin: ''
      });

      expect(options.crossOrigin).to.be.eql('');
    });

    it('can create KVP options from spec/ol/format/wmts/ogcsample.xml',
        function() {
          var options = _ol_source_WMTS_.optionsFromCapabilities(
              capabilities,
              {layer: 'BlueMarbleNextGeneration', matrixSet: 'google3857'});

          expect(options.urls).to.be.an('array');
          expect(options.urls).to.have.length(1);
          expect(options.urls[0]).to.be.eql(
              'http://www.maps.bob/cgi-bin/MiraMon5_0.cgi?');

          expect(options.layer).to.be.eql('BlueMarbleNextGeneration');

          expect(options.matrixSet).to.be.eql('google3857');

          expect(options.format).to.be.eql('image/jpeg');

          expect(options.projection).to.be.a(_ol_proj_Projection_);
          expect(options.projection).to.be.eql(getProjection('EPSG:3857'));

          expect(options.requestEncoding).to.be.eql('KVP');

          expect(options.tileGrid).to.be.a(WMTSTileGrid);

          expect(options.style).to.be.eql('DarkBlue');

          expect(options.dimensions).to.eql({Time: '20110805'});

          expect(options.crossOrigin).to.be(undefined);

        });

    it('can create REST options from spec/ol/format/wmts/ogcsample.xml',
        function() {
          var options = _ol_source_WMTS_.optionsFromCapabilities(capabilities, {
            layer: 'BlueMarbleNextGeneration',
            matrixSet: 'google3857',
            requestEncoding: 'REST'
          });

          expect(options.urls).to.be.an('array');
          expect(options.urls).to.have.length(1);
          expect(options.urls[0]).to.be.eql(
              'http://www.example.com/wmts/coastlines/{TileMatrix}/{TileRow}/{TileCol}.png');

          expect(options.layer).to.be.eql('BlueMarbleNextGeneration');

          expect(options.matrixSet).to.be.eql('google3857');

          expect(options.format).to.be.eql('image/png');

          expect(options.projection).to.be.a(_ol_proj_Projection_);
          expect(options.projection).to.be.eql(getProjection('EPSG:3857'));

          expect(options.requestEncoding).to.be.eql('REST');

          expect(options.tileGrid).to.be.a(WMTSTileGrid);

          expect(options.style).to.be.eql('DarkBlue');

          expect(options.dimensions).to.eql({Time: '20110805'});

        });

    it('can find a MatrixSet by SRS identifier', function() {
      var options = _ol_source_WMTS_.optionsFromCapabilities(capabilities, {
        layer: 'BlueMarbleNextGeneration',
        projection: 'EPSG:3857',
        requestEncoding: 'REST'
      });

      expect(options.matrixSet).to.be.eql('google3857');
      expect(options.projection.getCode()).to.be.eql('EPSG:3857');
    });

    it('can find a MatrixSet by equivalent SRS identifier', function() {
      var options = _ol_source_WMTS_.optionsFromCapabilities(capabilities, {
        layer: 'BlueMarbleNextGeneration',
        projection: 'EPSG:900913',
        requestEncoding: 'REST'
      });

      expect(options.matrixSet).to.be.eql('google3857');
      expect(options.projection.getCode()).to.be.eql('EPSG:900913');
    });

    it('can find the default MatrixSet', function() {
      var options = _ol_source_WMTS_.optionsFromCapabilities(capabilities, {
        layer: 'BlueMarbleNextGeneration',
        requestEncoding: 'REST'
      });

      expect(options.matrixSet).to.be.eql('BigWorldPixel');
      expect(options.projection.getCode()).to.be.eql('urn:ogc:def:crs:OGC:1.3:CRS84');
    });

    it('uses the projection of the default MatrixSet if the config\'s projection is not supported', function() {
      var options = _ol_source_WMTS_.optionsFromCapabilities(capabilities, {
        layer: 'BlueMarbleNextGeneration',
        projection: new _ol_proj_Projection_({
          code: 'EPSG:2056',
          units: 'm'
        })
      });

      expect(options.matrixSet).to.be.eql('BigWorldPixel');
      expect(options.projection.getCode()).to.be.eql('urn:ogc:def:crs:OGC:1.3:CRS84');
    });

    it('doesn\'t fail if the GetCap doesn\'t contains Constraint tags', function() {
      var tmpXml = content.replace(/<ows:Constraint[\s\S]*?<\/ows:Constraint>/g, '');
      var tmpCapabilities = parser.read(tmpXml);
      expect(tmpCapabilities['OperationsMetadata']['GetTile']['DCP']['HTTP']['Get'][0]['Constraint']).to.be(undefined);
      var options = _ol_source_WMTS_.optionsFromCapabilities(tmpCapabilities,
          {layer: 'BlueMarbleNextGeneration', matrixSet: 'google3857'});
      expect(options.layer).to.be.eql('BlueMarbleNextGeneration');
      expect(options.matrixSet).to.be.eql('google3857');
    });

    it('set KVP as default request encoding if the GetCap doesn\'t contains Constraint and ResourceUrl tags', function() {
      var tmpXml = content.replace(/<ows:Constraint[\s\S]*?<\/ows:Constraint>/g, '');
      tmpXml = tmpXml.replace(/<ResourceURL[\s\S]*?"\/>/g, '');

      var tmpCapabilities = parser.read(tmpXml);
      expect(tmpCapabilities['OperationsMetadata']['GetTile']['DCP']['HTTP']['Get'][0]['Constraint']).to.be(undefined);
      expect(tmpCapabilities['Contents']['Layer'][0]['ResourceURL']).to.be(undefined);
      var options = _ol_source_WMTS_.optionsFromCapabilities(tmpCapabilities,
          {layer: 'BlueMarbleNextGeneration', matrixSet: 'google3857'});
      expect(options.layer).to.be.eql('BlueMarbleNextGeneration');
      expect(options.matrixSet).to.be.eql('google3857');
      expect(options.urls).to.be.an('array');
      expect(options.urls).to.have.length(1);
      expect(options.urls[0]).to.be.eql('http://www.maps.bob/cgi-bin/MiraMon5_0.cgi?');
    });
  });

  describe('when creating tileUrlFunction', function() {

    it('can replace lowercase REST parameters',
        function() {
          var source = new _ol_source_WMTS_({
            layer: 'layer',
            style: 'default',
            urls: ['http://www.example.com/wmts/coastlines/{layer}/{style}/' +
             '{tilematrixset}/{TileMatrix}/{TileCol}/{TileRow}.jpg'],
            matrixSet: 'EPSG:3857',
            requestEncoding: 'REST',
            tileGrid: new WMTSTileGrid({
              origin: [-20037508.342789244, 20037508.342789244],
              resolutions: [559082264.029 * 0.28E-3,
                279541132.015 * 0.28E-3,
                139770566.007 * 0.28E-3],
              matrixIds: [0, 1, 2]
            })
          });

          var projection = getProjection('EPSG:3857');
          var url = source.tileUrlFunction(
              source.getTileCoordForTileUrlFunction([1, 1, -2]), 1, projection);
          expect(url).to.be.eql('http://www.example.com/wmts/coastlines/' +
             'layer/default/EPSG:3857/1/1/1.jpg');

        });

    it('can replace camelcase REST parameters',
        function() {
          var source = new _ol_source_WMTS_({
            layer: 'layer',
            style: 'default',
            urls: ['http://www.example.com/wmts/coastlines/{Layer}/{Style}/' +
             '{tilematrixset}/{TileMatrix}/{TileCol}/{TileRow}.jpg'],
            matrixSet: 'EPSG:3857',
            requestEncoding: 'REST',
            tileGrid: new WMTSTileGrid({
              origin: [-20037508.342789244, 20037508.342789244],
              resolutions: [559082264.029 * 0.28E-3,
                279541132.015 * 0.28E-3,
                139770566.007 * 0.28E-3],
              matrixIds: [0, 1, 2]
            })
          });

          var projection = getProjection('EPSG:3857');
          var url = source.tileUrlFunction(
              source.getTileCoordForTileUrlFunction([1, 1, -2]), 1, projection);
          expect(url).to.be.eql('http://www.example.com/wmts/coastlines/' +
             'layer/default/EPSG:3857/1/1/1.jpg');

        });
  });

  describe('when creating options from Esri capabilities', function() {
    var parser = new _ol_format_WMTSCapabilities_();
    var capabilities;
    before(function(done) {
      afterLoadText('spec/ol/format/wmts/arcgis.xml', function(xml) {
        try {
          capabilities = parser.read(xml);
        } catch (e) {
          done(e);
        }
        done();
      });
    });

    it('can create KVP options from spec/ol/format/wmts/arcgis.xml',
        function() {
          var options = _ol_source_WMTS_.optionsFromCapabilities(
              capabilities, {
                layer: 'Demographics_USA_Population_Density',
                requestEncoding: 'KVP',
                matrixSet: 'default028mm'
              });

          expect(options.urls).to.be.an('array');
          expect(options.urls).to.have.length(1);
          expect(options.urls[0]).to.be.eql(
              'https://services.arcgisonline.com/arcgis/rest/services/' +
             'Demographics/USA_Population_Density/MapServer/WMTS?');
        });

    it('can create REST options from spec/ol/format/wmts/arcgis.xml',
        function() {
          var options = _ol_source_WMTS_.optionsFromCapabilities(
              capabilities, {
                layer: 'Demographics_USA_Population_Density',
                matrixSet: 'default028mm'
              });

          expect(options.urls).to.be.an('array');
          expect(options.urls).to.have.length(1);
          expect(options.urls[0]).to.be.eql(
              'https://services.arcgisonline.com/arcgis/rest/services/' +
             'Demographics/USA_Population_Density/MapServer/WMTS/' +
             'tile/1.0.0/Demographics_USA_Population_Density/' +
             '{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png');
        });
  });

  describe('#setUrls()', function() {
    it('sets the URL for the source', function() {
      var source = new _ol_source_WMTS_({});

      var urls = [
        'https://a.example.com/',
        'https://b.example.com/',
        'https://c.example.com/'
      ];
      source.setUrls(urls);

      expect(source.getUrls()).to.eql(urls);
    });

    it('updates the key for the source', function() {
      var source = new _ol_source_WMTS_({});

      var urls = [
        'https://a.example.com/',
        'https://b.example.com/',
        'https://c.example.com/'
      ];
      source.setUrls(urls);

      expect(source.getKey()).to.eql(urls.join('\n'));
    });

    it('generates the correct tileUrlFunction during application of setUrl()', function() {
      var projection = getProjection('EPSG:3857');
      var source = new _ol_source_WMTS_({
        projection: projection,
        requestEncoding: 'REST',
        urls: [
          'http://1.example.com/{TileMatrix}/{TileRow}/{TileCol}.jpeg',
          'http://2.example.com/{TileMatrix}/{TileRow}/{TileCol}.jpeg'
        ],
        tileGrid: new WMTSTileGrid({
          matrixIds: [0, 1, 2, 3, 4, 5, 6, 7],
          origin: [2690000, 1285000],
          resolutions: [4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250]
        })
      });

      var urls = [
        'https://a.example.com/{TileMatrix}/{TileRow}/{TileCol}.jpg',
        'https://b.example.com/{TileMatrix}/{TileRow}/{TileCol}.jpg'
      ];
      source.setUrls(urls);
      var tileUrl1 = source.tileUrlFunction([2, 9, 4], 1, projection);
      expect(tileUrl1).to.match(/https\:\/\/[ab]\.example\.com\/2\/-5\/9\.jpg/);
    });
  });

  describe('url option', function() {
    it('expands url template', function() {
      var tileSource = new _ol_source_WMTS_({
        url: '{1-3}'
      });

      var urls = tileSource.getUrls();
      expect(urls).to.eql(['1', '2', '3']);
    });
  });

  describe('#getUrls', function() {

    var sourceOptions;
    var source;

    beforeEach(function() {
      sourceOptions = {
        layer: 'layer',
        style: 'default',
        matrixSet: 'foo',
        requestEncoding: 'REST',
        tileGrid: new WMTSTileGrid({
          origin: [0, 0],
          resolutions: [],
          matrixIds: []
        })
      };
    });

    describe('using a "url" option', function() {
      beforeEach(function() {
        sourceOptions.url = 'some_wmts_url';
        source = new _ol_source_WMTS_(sourceOptions);
      });

      it('returns the WMTS URLs', function() {
        var urls = source.getUrls();
        expect(urls).to.be.eql(['some_wmts_url']);
      });

    });

    describe('using a "urls" option', function() {
      beforeEach(function() {
        sourceOptions.urls = ['some_wmts_url1', 'some_wmts_url2'];
        source = new _ol_source_WMTS_(sourceOptions);
      });

      it('returns the WMTS URLs', function() {
        var urls = source.getUrls();
        expect(urls).to.be.eql(['some_wmts_url1', 'some_wmts_url2']);
      });

    });

  });

  describe('#getRequestEncoding', function() {

    var source;

    beforeEach(function() {
      source = new _ol_source_WMTS_({
        layer: 'layer',
        style: 'default',
        matrixSet: 'foo',
        requestEncoding: 'REST',
        tileGrid: new WMTSTileGrid({
          origin: [0, 0],
          resolutions: [],
          matrixIds: []
        })
      });
    });

    it('returns the request encoding', function() {
      var requestEncoding = source.getRequestEncoding();
      expect(requestEncoding).to.be.eql('REST');
    });

  });

});
