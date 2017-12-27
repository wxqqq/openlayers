/**
 * @module ol/format/filter/IsNull
 */
import {inherits} from '../../index.js';
import Comparison from '../filter/Comparison.js';

/**
 * @classdesc
 * Represents a `<PropertyIsNull>` comparison operator.
 *
 * @constructor
 * @param {!string} propertyName Name of the context property to compare.
 * @extends {ol.format.filter.Comparison}
 * @api
 */
var IsNull = function(propertyName) {
  Comparison.call(this, 'PropertyIsNull', propertyName);
};

inherits(IsNull, Comparison);
export default IsNull;
