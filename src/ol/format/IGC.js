/**
 * @module ol/format/IGC
 */
import {inherits} from '../index.js';
import _ol_Feature_ from '../Feature.js';
import {transformWithOptions} from '../format/Feature.js';
import _ol_format_IGCZ_ from '../format/IGCZ.js';
import TextFeature from '../format/TextFeature.js';
import GeometryLayout from '../geom/GeometryLayout.js';
import LineString from '../geom/LineString.js';
import {get as getProjection} from '../proj.js';

/**
 * @classdesc
 * Feature format for `*.igc` flight recording files.
 *
 * @constructor
 * @extends {ol.format.TextFeature}
 * @param {olx.format.IGCOptions=} opt_options Options.
 * @api
 */
var IGC = function(opt_options) {

  var options = opt_options ? opt_options : {};

  TextFeature.call(this);

  /**
   * @inheritDoc
   */
  this.defaultDataProjection = getProjection('EPSG:4326');

  /**
   * @private
   * @type {ol.format.IGCZ}
   */
  this.altitudeMode_ = options.altitudeMode ?
    options.altitudeMode : _ol_format_IGCZ_.NONE;

};

inherits(IGC, TextFeature);


/**
 * @const
 * @type {RegExp}
 * @private
 */
IGC.B_RECORD_RE_ =
    /^B(\d{2})(\d{2})(\d{2})(\d{2})(\d{5})([NS])(\d{3})(\d{5})([EW])([AV])(\d{5})(\d{5})/;


/**
 * @const
 * @type {RegExp}
 * @private
 */
IGC.H_RECORD_RE_ = /^H.([A-Z]{3}).*?:(.*)/;


/**
 * @const
 * @type {RegExp}
 * @private
 */
IGC.HFDTE_RECORD_RE_ = /^HFDTE(\d{2})(\d{2})(\d{2})/;


/**
 * A regular expression matching the newline characters `\r\n`, `\r` and `\n`.
 *
 * @const
 * @type {RegExp}
 * @private
 */
IGC.NEWLINE_RE_ = /\r\n|\r|\n/;


/**
 * Read the feature from the IGC source.
 *
 * @function
 * @param {Document|Node|Object|string} source Source.
 * @param {olx.format.ReadOptions=} opt_options Read options.
 * @return {ol.Feature} Feature.
 * @api
 */
IGC.prototype.readFeature;


/**
 * @inheritDoc
 */
IGC.prototype.readFeatureFromText = function(text, opt_options) {
  var altitudeMode = this.altitudeMode_;
  var lines = text.split(IGC.NEWLINE_RE_);
  /** @type {Object.<string, string>} */
  var properties = {};
  var flatCoordinates = [];
  var year = 2000;
  var month = 0;
  var day = 1;
  var lastDateTime = -1;
  var i, ii;
  for (i = 0, ii = lines.length; i < ii; ++i) {
    var line = lines[i];
    var m;
    if (line.charAt(0) == 'B') {
      m = IGC.B_RECORD_RE_.exec(line);
      if (m) {
        var hour = parseInt(m[1], 10);
        var minute = parseInt(m[2], 10);
        var second = parseInt(m[3], 10);
        var y = parseInt(m[4], 10) + parseInt(m[5], 10) / 60000;
        if (m[6] == 'S') {
          y = -y;
        }
        var x = parseInt(m[7], 10) + parseInt(m[8], 10) / 60000;
        if (m[9] == 'W') {
          x = -x;
        }
        flatCoordinates.push(x, y);
        if (altitudeMode != _ol_format_IGCZ_.NONE) {
          var z;
          if (altitudeMode == _ol_format_IGCZ_.GPS) {
            z = parseInt(m[11], 10);
          } else if (altitudeMode == _ol_format_IGCZ_.BAROMETRIC) {
            z = parseInt(m[12], 10);
          } else {
            z = 0;
          }
          flatCoordinates.push(z);
        }
        var dateTime = Date.UTC(year, month, day, hour, minute, second);
        // Detect UTC midnight wrap around.
        if (dateTime < lastDateTime) {
          dateTime = Date.UTC(year, month, day + 1, hour, minute, second);
        }
        flatCoordinates.push(dateTime / 1000);
        lastDateTime = dateTime;
      }
    } else if (line.charAt(0) == 'H') {
      m = IGC.HFDTE_RECORD_RE_.exec(line);
      if (m) {
        day = parseInt(m[1], 10);
        month = parseInt(m[2], 10) - 1;
        year = 2000 + parseInt(m[3], 10);
      } else {
        m = IGC.H_RECORD_RE_.exec(line);
        if (m) {
          properties[m[1]] = m[2].trim();
        }
      }
    }
  }
  if (flatCoordinates.length === 0) {
    return null;
  }
  var lineString = new LineString(null);
  var layout = altitudeMode == _ol_format_IGCZ_.NONE ?
    GeometryLayout.XYM : GeometryLayout.XYZM;
  lineString.setFlatCoordinates(layout, flatCoordinates);
  var feature = new _ol_Feature_(transformWithOptions(lineString, false, opt_options));
  feature.setProperties(properties);
  return feature;
};


/**
 * Read the feature from the source. As IGC sources contain a single
 * feature, this will return the feature in an array.
 *
 * @function
 * @param {Document|Node|Object|string} source Source.
 * @param {olx.format.ReadOptions=} opt_options Read options.
 * @return {Array.<ol.Feature>} Features.
 * @api
 */
IGC.prototype.readFeatures;


/**
 * @inheritDoc
 */
IGC.prototype.readFeaturesFromText = function(text, opt_options) {
  var feature = this.readFeatureFromText(text, opt_options);
  if (feature) {
    return [feature];
  } else {
    return [];
  }
};


/**
 * Read the projection from the IGC source.
 *
 * @function
 * @param {Document|Node|Object|string} source Source.
 * @return {ol.proj.Projection} Projection.
 * @api
 */
IGC.prototype.readProjection;


/**
 * Not implemented.
 * @inheritDoc
 */
IGC.prototype.writeFeatureText = function(feature, opt_options) {};


/**
 * Not implemented.
 * @inheritDoc
 */
IGC.prototype.writeFeaturesText = function(features, opt_options) {};


/**
 * Not implemented.
 * @inheritDoc
 */
IGC.prototype.writeGeometryText = function(geometry, opt_options) {};


/**
 * Not implemented.
 * @inheritDoc
 */
IGC.prototype.readGeometryFromText = function(text, opt_options) {};
export default IGC;
