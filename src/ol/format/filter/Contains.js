/**
 * @module ol/format/filter/Contains
 */
import {inherits} from '../../index.js';
import Spatial from '../filter/Spatial.js';

/**
 * @classdesc
 * Represents a `<Contains>` operator to test whether a geometry-valued property
 * contains a given geometry.
 *
 * @constructor
 * @param {!string} geometryName Geometry name to use.
 * @param {!ol.geom.Geometry} geometry Geometry.
 * @param {string=} opt_srsName SRS name. No srsName attribute will be
 *    set on geometries when this is not provided.
 * @extends {ol.format.filter.Spatial}
 * @api
 */
var Contains = function(geometryName, geometry, opt_srsName) {

  Spatial.call(this, 'Contains', geometryName, geometry, opt_srsName);

};

inherits(Contains, Spatial);
export default Contains;
