/**
 * @module ol/format/filter/GreaterThanOrEqualTo
 */
import {inherits} from '../../index.js';
import ComparisonBinary from '../filter/ComparisonBinary.js';

/**
 * @classdesc
 * Represents a `<PropertyIsGreaterThanOrEqualTo>` comparison operator.
 *
 * @constructor
 * @param {!string} propertyName Name of the context property to compare.
 * @param {!number} expression The value to compare.
 * @extends {ol.format.filter.ComparisonBinary}
 * @api
 */
var GreaterThanOrEqualTo = function(propertyName, expression) {
  ComparisonBinary.call(this, 'PropertyIsGreaterThanOrEqualTo', propertyName, expression);
};

inherits(GreaterThanOrEqualTo, ComparisonBinary);
export default GreaterThanOrEqualTo;
