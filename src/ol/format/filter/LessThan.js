/**
 * @module ol/format/filter/LessThan
 */
import {inherits} from '../../index.js';
import ComparisonBinary from '../filter/ComparisonBinary.js';

/**
 * @classdesc
 * Represents a `<PropertyIsLessThan>` comparison operator.
 *
 * @constructor
 * @param {!string} propertyName Name of the context property to compare.
 * @param {!number} expression The value to compare.
 * @extends {ol.format.filter.ComparisonBinary}
 * @api
 */
var LessThan = function(propertyName, expression) {
  ComparisonBinary.call(this, 'PropertyIsLessThan', propertyName, expression);
};

inherits(LessThan, ComparisonBinary);
export default LessThan;
