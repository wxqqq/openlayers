/**
 * @module ol/format/filter/GreaterThan
 */
import {inherits} from '../../index.js';
import ComparisonBinary from '../filter/ComparisonBinary.js';

/**
 * @classdesc
 * Represents a `<PropertyIsGreaterThan>` comparison operator.
 *
 * @constructor
 * @param {!string} propertyName Name of the context property to compare.
 * @param {!number} expression The value to compare.
 * @extends {ol.format.filter.ComparisonBinary}
 * @api
 */
var GreaterThan = function(propertyName, expression) {
  ComparisonBinary.call(this, 'PropertyIsGreaterThan', propertyName, expression);
};

inherits(GreaterThan, ComparisonBinary);
export default GreaterThan;
