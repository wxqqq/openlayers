/**
 * @module ol/format/WKT
 */
import {inherits} from '../index.js';
import _ol_Feature_ from '../Feature.js';
import {transformWithOptions} from '../format/Feature.js';
import TextFeature from '../format/TextFeature.js';
import GeometryCollection from '../geom/GeometryCollection.js';
import GeometryType from '../geom/GeometryType.js';
import GeometryLayout from '../geom/GeometryLayout.js';
import LineString from '../geom/LineString.js';
import MultiLineString from '../geom/MultiLineString.js';
import MultiPoint from '../geom/MultiPoint.js';
import MultiPolygon from '../geom/MultiPolygon.js';
import Point from '../geom/Point.js';
import Polygon from '../geom/Polygon.js';
import SimpleGeometry from '../geom/SimpleGeometry.js';

/**
 * @classdesc
 * Geometry format for reading and writing data in the `WellKnownText` (WKT)
 * format.
 *
 * @constructor
 * @extends {ol.format.TextFeature}
 * @param {olx.format.WKTOptions=} opt_options Options.
 * @api
 */
var WKT = function(opt_options) {

  var options = opt_options ? opt_options : {};

  TextFeature.call(this);

  /**
   * Split GeometryCollection into multiple features.
   * @type {boolean}
   * @private
   */
  this.splitCollection_ = options.splitCollection !== undefined ?
    options.splitCollection : false;

};

inherits(WKT, TextFeature);


/**
 * @const
 * @type {string}
 */
WKT.EMPTY = 'EMPTY';


/**
 * @const
 * @type {string}
 */
WKT.Z = 'Z';


/**
 * @const
 * @type {string}
 */
WKT.M = 'M';


/**
 * @const
 * @type {string}
 */
WKT.ZM = 'ZM';


/**
 * @param {ol.geom.Point} geom Point geometry.
 * @return {string} Coordinates part of Point as WKT.
 * @private
 */
WKT.encodePointGeometry_ = function(geom) {
  var coordinates = geom.getCoordinates();
  if (coordinates.length === 0) {
    return '';
  }
  return coordinates.join(' ');
};


/**
 * @param {ol.geom.MultiPoint} geom MultiPoint geometry.
 * @return {string} Coordinates part of MultiPoint as WKT.
 * @private
 */
WKT.encodeMultiPointGeometry_ = function(geom) {
  var array = [];
  var components = geom.getPoints();
  for (var i = 0, ii = components.length; i < ii; ++i) {
    array.push('(' + WKT.encodePointGeometry_(components[i]) + ')');
  }
  return array.join(',');
};


/**
 * @param {ol.geom.GeometryCollection} geom GeometryCollection geometry.
 * @return {string} Coordinates part of GeometryCollection as WKT.
 * @private
 */
WKT.encodeGeometryCollectionGeometry_ = function(geom) {
  var array = [];
  var geoms = geom.getGeometries();
  for (var i = 0, ii = geoms.length; i < ii; ++i) {
    array.push(WKT.encode_(geoms[i]));
  }
  return array.join(',');
};


/**
 * @param {ol.geom.LineString|ol.geom.LinearRing} geom LineString geometry.
 * @return {string} Coordinates part of LineString as WKT.
 * @private
 */
WKT.encodeLineStringGeometry_ = function(geom) {
  var coordinates = geom.getCoordinates();
  var array = [];
  for (var i = 0, ii = coordinates.length; i < ii; ++i) {
    array.push(coordinates[i].join(' '));
  }
  return array.join(',');
};


/**
 * @param {ol.geom.MultiLineString} geom MultiLineString geometry.
 * @return {string} Coordinates part of MultiLineString as WKT.
 * @private
 */
WKT.encodeMultiLineStringGeometry_ = function(geom) {
  var array = [];
  var components = geom.getLineStrings();
  for (var i = 0, ii = components.length; i < ii; ++i) {
    array.push('(' + WKT.encodeLineStringGeometry_(
        components[i]) + ')');
  }
  return array.join(',');
};


/**
 * @param {ol.geom.Polygon} geom Polygon geometry.
 * @return {string} Coordinates part of Polygon as WKT.
 * @private
 */
WKT.encodePolygonGeometry_ = function(geom) {
  var array = [];
  var rings = geom.getLinearRings();
  for (var i = 0, ii = rings.length; i < ii; ++i) {
    array.push('(' + WKT.encodeLineStringGeometry_(
        rings[i]) + ')');
  }
  return array.join(',');
};


/**
 * @param {ol.geom.MultiPolygon} geom MultiPolygon geometry.
 * @return {string} Coordinates part of MultiPolygon as WKT.
 * @private
 */
WKT.encodeMultiPolygonGeometry_ = function(geom) {
  var array = [];
  var components = geom.getPolygons();
  for (var i = 0, ii = components.length; i < ii; ++i) {
    array.push('(' + WKT.encodePolygonGeometry_(
        components[i]) + ')');
  }
  return array.join(',');
};

/**
 * @param {ol.geom.SimpleGeometry} geom SimpleGeometry geometry.
 * @return {string} Potential dimensional information for WKT type.
 * @private
 */
WKT.encodeGeometryLayout_ = function(geom) {
  var layout = geom.getLayout();
  var dimInfo = '';
  if (layout === GeometryLayout.XYZ || layout === GeometryLayout.XYZM) {
    dimInfo += WKT.Z;
  }
  if (layout === GeometryLayout.XYM || layout === GeometryLayout.XYZM) {
    dimInfo += WKT.M;
  }
  return dimInfo;
};


/**
 * Encode a geometry as WKT.
 * @param {ol.geom.Geometry} geom The geometry to encode.
 * @return {string} WKT string for the geometry.
 * @private
 */
WKT.encode_ = function(geom) {
  var type = geom.getType();
  var geometryEncoder = WKT.GeometryEncoder_[type];
  var enc = geometryEncoder(geom);
  type = type.toUpperCase();
  if (geom instanceof SimpleGeometry) {
    var dimInfo = WKT.encodeGeometryLayout_(geom);
    if (dimInfo.length > 0) {
      type += ' ' + dimInfo;
    }
  }
  if (enc.length === 0) {
    return type + ' ' + WKT.EMPTY;
  }
  return type + '(' + enc + ')';
};


/**
 * @const
 * @type {Object.<string, function(ol.geom.Geometry): string>}
 * @private
 */
WKT.GeometryEncoder_ = {
  'Point': WKT.encodePointGeometry_,
  'LineString': WKT.encodeLineStringGeometry_,
  'Polygon': WKT.encodePolygonGeometry_,
  'MultiPoint': WKT.encodeMultiPointGeometry_,
  'MultiLineString': WKT.encodeMultiLineStringGeometry_,
  'MultiPolygon': WKT.encodeMultiPolygonGeometry_,
  'GeometryCollection': WKT.encodeGeometryCollectionGeometry_
};


/**
 * Parse a WKT string.
 * @param {string} wkt WKT string.
 * @return {ol.geom.Geometry|undefined}
 *     The geometry created.
 * @private
 */
WKT.prototype.parse_ = function(wkt) {
  var lexer = new WKT.Lexer(wkt);
  var parser = new WKT.Parser(lexer);
  return parser.parse();
};


/**
 * Read a feature from a WKT source.
 *
 * @function
 * @param {Document|Node|Object|string} source Source.
 * @param {olx.format.ReadOptions=} opt_options Read options.
 * @return {ol.Feature} Feature.
 * @api
 */
WKT.prototype.readFeature;


/**
 * @inheritDoc
 */
WKT.prototype.readFeatureFromText = function(text, opt_options) {
  var geom = this.readGeometryFromText(text, opt_options);
  if (geom) {
    var feature = new _ol_Feature_();
    feature.setGeometry(geom);
    return feature;
  }
  return null;
};


/**
 * Read all features from a WKT source.
 *
 * @function
 * @param {Document|Node|Object|string} source Source.
 * @param {olx.format.ReadOptions=} opt_options Read options.
 * @return {Array.<ol.Feature>} Features.
 * @api
 */
WKT.prototype.readFeatures;


/**
 * @inheritDoc
 */
WKT.prototype.readFeaturesFromText = function(text, opt_options) {
  var geometries = [];
  var geometry = this.readGeometryFromText(text, opt_options);
  if (this.splitCollection_ &&
      geometry.getType() == GeometryType.GEOMETRY_COLLECTION) {
    geometries = (/** @type {ol.geom.GeometryCollection} */ (geometry))
        .getGeometriesArray();
  } else {
    geometries = [geometry];
  }
  var feature, features = [];
  for (var i = 0, ii = geometries.length; i < ii; ++i) {
    feature = new _ol_Feature_();
    feature.setGeometry(geometries[i]);
    features.push(feature);
  }
  return features;
};


/**
 * Read a single geometry from a WKT source.
 *
 * @function
 * @param {Document|Node|Object|string} source Source.
 * @param {olx.format.ReadOptions=} opt_options Read options.
 * @return {ol.geom.Geometry} Geometry.
 * @api
 */
WKT.prototype.readGeometry;


/**
 * @inheritDoc
 */
WKT.prototype.readGeometryFromText = function(text, opt_options) {
  var geometry = this.parse_(text);
  if (geometry) {
    return (
      /** @type {ol.geom.Geometry} */ transformWithOptions(geometry, false, opt_options)
    );
  } else {
    return null;
  }
};


/**
 * Encode a feature as a WKT string.
 *
 * @function
 * @param {ol.Feature} feature Feature.
 * @param {olx.format.WriteOptions=} opt_options Write options.
 * @return {string} WKT string.
 * @api
 */
WKT.prototype.writeFeature;


/**
 * @inheritDoc
 */
WKT.prototype.writeFeatureText = function(feature, opt_options) {
  var geometry = feature.getGeometry();
  if (geometry) {
    return this.writeGeometryText(geometry, opt_options);
  }
  return '';
};


/**
 * Encode an array of features as a WKT string.
 *
 * @function
 * @param {Array.<ol.Feature>} features Features.
 * @param {olx.format.WriteOptions=} opt_options Write options.
 * @return {string} WKT string.
 * @api
 */
WKT.prototype.writeFeatures;


/**
 * @inheritDoc
 */
WKT.prototype.writeFeaturesText = function(features, opt_options) {
  if (features.length == 1) {
    return this.writeFeatureText(features[0], opt_options);
  }
  var geometries = [];
  for (var i = 0, ii = features.length; i < ii; ++i) {
    geometries.push(features[i].getGeometry());
  }
  var collection = new GeometryCollection(geometries);
  return this.writeGeometryText(collection, opt_options);
};


/**
 * Write a single geometry as a WKT string.
 *
 * @function
 * @param {ol.geom.Geometry} geometry Geometry.
 * @param {olx.format.WriteOptions=} opt_options Write options.
 * @return {string} WKT string.
 * @api
 */
WKT.prototype.writeGeometry;


/**
 * @inheritDoc
 */
WKT.prototype.writeGeometryText = function(geometry, opt_options) {
  return WKT.encode_(/** @type {ol.geom.Geometry} */ (
    transformWithOptions(geometry, true, opt_options)));
};


/**
 * @const
 * @enum {number}
 * @private
 */
WKT.TokenType_ = {
  TEXT: 1,
  LEFT_PAREN: 2,
  RIGHT_PAREN: 3,
  NUMBER: 4,
  COMMA: 5,
  EOF: 6
};


/**
 * Class to tokenize a WKT string.
 * @param {string} wkt WKT string.
 * @constructor
 * @protected
 */
WKT.Lexer = function(wkt) {

  /**
   * @type {string}
   */
  this.wkt = wkt;

  /**
   * @type {number}
   * @private
   */
  this.index_ = -1;
};


/**
 * @param {string} c Character.
 * @return {boolean} Whether the character is alphabetic.
 * @private
 */
WKT.Lexer.prototype.isAlpha_ = function(c) {
  return c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z';
};


/**
 * @param {string} c Character.
 * @param {boolean=} opt_decimal Whether the string number
 *     contains a dot, i.e. is a decimal number.
 * @return {boolean} Whether the character is numeric.
 * @private
 */
WKT.Lexer.prototype.isNumeric_ = function(c, opt_decimal) {
  var decimal = opt_decimal !== undefined ? opt_decimal : false;
  return c >= '0' && c <= '9' || c == '.' && !decimal;
};


/**
 * @param {string} c Character.
 * @return {boolean} Whether the character is whitespace.
 * @private
 */
WKT.Lexer.prototype.isWhiteSpace_ = function(c) {
  return c == ' ' || c == '\t' || c == '\r' || c == '\n';
};


/**
 * @return {string} Next string character.
 * @private
 */
WKT.Lexer.prototype.nextChar_ = function() {
  return this.wkt.charAt(++this.index_);
};


/**
 * Fetch and return the next token.
 * @return {!ol.WKTToken} Next string token.
 */
WKT.Lexer.prototype.nextToken = function() {
  var c = this.nextChar_();
  var token = {position: this.index_, value: c};

  if (c == '(') {
    token.type = WKT.TokenType_.LEFT_PAREN;
  } else if (c == ',') {
    token.type = WKT.TokenType_.COMMA;
  } else if (c == ')') {
    token.type = WKT.TokenType_.RIGHT_PAREN;
  } else if (this.isNumeric_(c) || c == '-') {
    token.type = WKT.TokenType_.NUMBER;
    token.value = this.readNumber_();
  } else if (this.isAlpha_(c)) {
    token.type = WKT.TokenType_.TEXT;
    token.value = this.readText_();
  } else if (this.isWhiteSpace_(c)) {
    return this.nextToken();
  } else if (c === '') {
    token.type = WKT.TokenType_.EOF;
  } else {
    throw new Error('Unexpected character: ' + c);
  }

  return token;
};


/**
 * @return {number} Numeric token value.
 * @private
 */
WKT.Lexer.prototype.readNumber_ = function() {
  var c, index = this.index_;
  var decimal = false;
  var scientificNotation = false;
  do {
    if (c == '.') {
      decimal = true;
    } else if (c == 'e' || c == 'E') {
      scientificNotation = true;
    }
    c = this.nextChar_();
  } while (
    this.isNumeric_(c, decimal) ||
      // if we haven't detected a scientific number before, 'e' or 'E'
      // hint that we should continue to read
      !scientificNotation && (c == 'e' || c == 'E') ||
      // once we know that we have a scientific number, both '-' and '+'
      // are allowed
      scientificNotation && (c == '-' || c == '+')
  );
  return parseFloat(this.wkt.substring(index, this.index_--));
};


/**
 * @return {string} String token value.
 * @private
 */
WKT.Lexer.prototype.readText_ = function() {
  var c, index = this.index_;
  do {
    c = this.nextChar_();
  } while (this.isAlpha_(c));
  return this.wkt.substring(index, this.index_--).toUpperCase();
};


/**
 * Class to parse the tokens from the WKT string.
 * @param {ol.format.WKT.Lexer} lexer The lexer.
 * @constructor
 * @protected
 */
WKT.Parser = function(lexer) {

  /**
   * @type {ol.format.WKT.Lexer}
   * @private
   */
  this.lexer_ = lexer;

  /**
   * @type {ol.WKTToken}
   * @private
   */
  this.token_;

  /**
   * @type {ol.geom.GeometryLayout}
   * @private
   */
  this.layout_ = GeometryLayout.XY;
};


/**
 * Fetch the next token form the lexer and replace the active token.
 * @private
 */
WKT.Parser.prototype.consume_ = function() {
  this.token_ = this.lexer_.nextToken();
};

/**
 * Tests if the given type matches the type of the current token.
 * @param {ol.format.WKT.TokenType_} type Token type.
 * @return {boolean} Whether the token matches the given type.
 */
WKT.Parser.prototype.isTokenType = function(type) {
  var isMatch = this.token_.type == type;
  return isMatch;
};


/**
 * If the given type matches the current token, consume it.
 * @param {ol.format.WKT.TokenType_} type Token type.
 * @return {boolean} Whether the token matches the given type.
 */
WKT.Parser.prototype.match = function(type) {
  var isMatch = this.isTokenType(type);
  if (isMatch) {
    this.consume_();
  }
  return isMatch;
};


/**
 * Try to parse the tokens provided by the lexer.
 * @return {ol.geom.Geometry} The geometry.
 */
WKT.Parser.prototype.parse = function() {
  this.consume_();
  var geometry = this.parseGeometry_();
  return geometry;
};


/**
 * Try to parse the dimensional info.
 * @return {ol.geom.GeometryLayout} The layout.
 * @private
 */
WKT.Parser.prototype.parseGeometryLayout_ = function() {
  var layout = GeometryLayout.XY;
  var dimToken = this.token_;
  if (this.isTokenType(WKT.TokenType_.TEXT)) {
    var dimInfo = dimToken.value;
    if (dimInfo === WKT.Z) {
      layout = GeometryLayout.XYZ;
    } else if (dimInfo === WKT.M) {
      layout = GeometryLayout.XYM;
    } else if (dimInfo === WKT.ZM) {
      layout = GeometryLayout.XYZM;
    }
    if (layout !== GeometryLayout.XY) {
      this.consume_();
    }
  }
  return layout;
};


/**
 * @return {!ol.geom.Geometry} The geometry.
 * @private
 */
WKT.Parser.prototype.parseGeometry_ = function() {
  var token = this.token_;
  if (this.match(WKT.TokenType_.TEXT)) {
    var geomType = token.value;
    this.layout_ = this.parseGeometryLayout_();
    if (geomType == GeometryType.GEOMETRY_COLLECTION.toUpperCase()) {
      var geometries = this.parseGeometryCollectionText_();
      return new GeometryCollection(geometries);
    } else {
      var parser = WKT.Parser.GeometryParser_[geomType];
      var ctor = WKT.Parser.GeometryConstructor_[geomType];
      if (!parser || !ctor) {
        throw new Error('Invalid geometry type: ' + geomType);
      }
      var coordinates = parser.call(this);
      return new ctor(coordinates, this.layout_);
    }
  }
  throw new Error(this.formatErrorMessage_());
};


/**
 * @return {!Array.<ol.geom.Geometry>} A collection of geometries.
 * @private
 */
WKT.Parser.prototype.parseGeometryCollectionText_ = function() {
  if (this.match(WKT.TokenType_.LEFT_PAREN)) {
    var geometries = [];
    do {
      geometries.push(this.parseGeometry_());
    } while (this.match(WKT.TokenType_.COMMA));
    if (this.match(WKT.TokenType_.RIGHT_PAREN)) {
      return geometries;
    }
  } else if (this.isEmptyGeometry_()) {
    return [];
  }
  throw new Error(this.formatErrorMessage_());
};


/**
 * @return {Array.<number>} All values in a point.
 * @private
 */
WKT.Parser.prototype.parsePointText_ = function() {
  if (this.match(WKT.TokenType_.LEFT_PAREN)) {
    var coordinates = this.parsePoint_();
    if (this.match(WKT.TokenType_.RIGHT_PAREN)) {
      return coordinates;
    }
  } else if (this.isEmptyGeometry_()) {
    return null;
  }
  throw new Error(this.formatErrorMessage_());
};


/**
 * @return {!Array.<!Array.<number>>} All points in a linestring.
 * @private
 */
WKT.Parser.prototype.parseLineStringText_ = function() {
  if (this.match(WKT.TokenType_.LEFT_PAREN)) {
    var coordinates = this.parsePointList_();
    if (this.match(WKT.TokenType_.RIGHT_PAREN)) {
      return coordinates;
    }
  } else if (this.isEmptyGeometry_()) {
    return [];
  }
  throw new Error(this.formatErrorMessage_());
};


/**
 * @return {!Array.<!Array.<number>>} All points in a polygon.
 * @private
 */
WKT.Parser.prototype.parsePolygonText_ = function() {
  if (this.match(WKT.TokenType_.LEFT_PAREN)) {
    var coordinates = this.parseLineStringTextList_();
    if (this.match(WKT.TokenType_.RIGHT_PAREN)) {
      return coordinates;
    }
  } else if (this.isEmptyGeometry_()) {
    return [];
  }
  throw new Error(this.formatErrorMessage_());
};


/**
 * @return {!Array.<!Array.<number>>} All points in a multipoint.
 * @private
 */
WKT.Parser.prototype.parseMultiPointText_ = function() {
  if (this.match(WKT.TokenType_.LEFT_PAREN)) {
    var coordinates;
    if (this.token_.type == WKT.TokenType_.LEFT_PAREN) {
      coordinates = this.parsePointTextList_();
    } else {
      coordinates = this.parsePointList_();
    }
    if (this.match(WKT.TokenType_.RIGHT_PAREN)) {
      return coordinates;
    }
  } else if (this.isEmptyGeometry_()) {
    return [];
  }
  throw new Error(this.formatErrorMessage_());
};


/**
 * @return {!Array.<!Array.<number>>} All linestring points
 *                                        in a multilinestring.
 * @private
 */
WKT.Parser.prototype.parseMultiLineStringText_ = function() {
  if (this.match(WKT.TokenType_.LEFT_PAREN)) {
    var coordinates = this.parseLineStringTextList_();
    if (this.match(WKT.TokenType_.RIGHT_PAREN)) {
      return coordinates;
    }
  } else if (this.isEmptyGeometry_()) {
    return [];
  }
  throw new Error(this.formatErrorMessage_());
};


/**
 * @return {!Array.<!Array.<number>>} All polygon points in a multipolygon.
 * @private
 */
WKT.Parser.prototype.parseMultiPolygonText_ = function() {
  if (this.match(WKT.TokenType_.LEFT_PAREN)) {
    var coordinates = this.parsePolygonTextList_();
    if (this.match(WKT.TokenType_.RIGHT_PAREN)) {
      return coordinates;
    }
  } else if (this.isEmptyGeometry_()) {
    return [];
  }
  throw new Error(this.formatErrorMessage_());
};


/**
 * @return {!Array.<number>} A point.
 * @private
 */
WKT.Parser.prototype.parsePoint_ = function() {
  var coordinates = [];
  var dimensions = this.layout_.length;
  for (var i = 0; i < dimensions; ++i) {
    var token = this.token_;
    if (this.match(WKT.TokenType_.NUMBER)) {
      coordinates.push(token.value);
    } else {
      break;
    }
  }
  if (coordinates.length == dimensions) {
    return coordinates;
  }
  throw new Error(this.formatErrorMessage_());
};


/**
 * @return {!Array.<!Array.<number>>} An array of points.
 * @private
 */
WKT.Parser.prototype.parsePointList_ = function() {
  var coordinates = [this.parsePoint_()];
  while (this.match(WKT.TokenType_.COMMA)) {
    coordinates.push(this.parsePoint_());
  }
  return coordinates;
};


/**
 * @return {!Array.<!Array.<number>>} An array of points.
 * @private
 */
WKT.Parser.prototype.parsePointTextList_ = function() {
  var coordinates = [this.parsePointText_()];
  while (this.match(WKT.TokenType_.COMMA)) {
    coordinates.push(this.parsePointText_());
  }
  return coordinates;
};


/**
 * @return {!Array.<!Array.<number>>} An array of points.
 * @private
 */
WKT.Parser.prototype.parseLineStringTextList_ = function() {
  var coordinates = [this.parseLineStringText_()];
  while (this.match(WKT.TokenType_.COMMA)) {
    coordinates.push(this.parseLineStringText_());
  }
  return coordinates;
};


/**
 * @return {!Array.<!Array.<number>>} An array of points.
 * @private
 */
WKT.Parser.prototype.parsePolygonTextList_ = function() {
  var coordinates = [this.parsePolygonText_()];
  while (this.match(WKT.TokenType_.COMMA)) {
    coordinates.push(this.parsePolygonText_());
  }
  return coordinates;
};


/**
 * @return {boolean} Whether the token implies an empty geometry.
 * @private
 */
WKT.Parser.prototype.isEmptyGeometry_ = function() {
  var isEmpty = this.isTokenType(WKT.TokenType_.TEXT) &&
      this.token_.value == WKT.EMPTY;
  if (isEmpty) {
    this.consume_();
  }
  return isEmpty;
};


/**
 * Create an error message for an unexpected token error.
 * @return {string} Error message.
 * @private
 */
WKT.Parser.prototype.formatErrorMessage_ = function() {
  return 'Unexpected `' + this.token_.value + '` at position ' +
      this.token_.position + ' in `' + this.lexer_.wkt + '`';
};


/**
 * @enum {function (new:ol.geom.Geometry, Array, ol.geom.GeometryLayout)}
 * @private
 */
WKT.Parser.GeometryConstructor_ = {
  'POINT': Point,
  'LINESTRING': LineString,
  'POLYGON': Polygon,
  'MULTIPOINT': MultiPoint,
  'MULTILINESTRING': MultiLineString,
  'MULTIPOLYGON': MultiPolygon
};


/**
 * @enum {(function(): Array)}
 * @private
 */
WKT.Parser.GeometryParser_ = {
  'POINT': WKT.Parser.prototype.parsePointText_,
  'LINESTRING': WKT.Parser.prototype.parseLineStringText_,
  'POLYGON': WKT.Parser.prototype.parsePolygonText_,
  'MULTIPOINT': WKT.Parser.prototype.parseMultiPointText_,
  'MULTILINESTRING': WKT.Parser.prototype.parseMultiLineStringText_,
  'MULTIPOLYGON': WKT.Parser.prototype.parseMultiPolygonText_
};
export default WKT;
