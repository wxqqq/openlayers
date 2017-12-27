/**
 * @module ol/format/filter/LessThanOrEqualTo
 */
import {inherits} from '../../index.js';
import ComparisonBinary from '../filter/ComparisonBinary.js';

/**
 * @classdesc
 * Represents a `<PropertyIsLessThanOrEqualTo>` comparison operator.
 *
 * @constructor
 * @param {!string} propertyName Name of the context property to compare.
 * @param {!number} expression The value to compare.
 * @extends {ol.format.filter.ComparisonBinary}
 * @api
 */
var LessThanOrEqualTo = function(propertyName, expression) {
  ComparisonBinary.call(this, 'PropertyIsLessThanOrEqualTo', propertyName, expression);
};

inherits(LessThanOrEqualTo, ComparisonBinary);
export default LessThanOrEqualTo;
