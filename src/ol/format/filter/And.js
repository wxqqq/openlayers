/**
 * @module ol/format/filter/And
 */
import {inherits} from '../../index.js';
import LogicalNary from '../filter/LogicalNary.js';

/**
 * @classdesc
 * Represents a logical `<And>` operator between two or more filter conditions.
 *
 * @constructor
 * @abstract
 * @param {...ol.format.filter.Filter} conditions Conditions.
 * @extends {ol.format.filter.LogicalNary}
 */
var And = function(conditions) {
  var params = ['And'].concat(Array.prototype.slice.call(arguments));
  LogicalNary.apply(this, params);
};

inherits(And, LogicalNary);

export default And;
