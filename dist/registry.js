'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SpyRegistry = undefined;

var _utils = require('./utils');

var restoreAttributeForEntry = function restoreAttributeForEntry(value) {
    var obj = value.obj,
        method = value.method,
        methodName = value.methodName;

    if (obj) {
        obj[methodName] = method;
    }
};

/**
 * @ModifiedOnly by viktor.luft@freiheit.com
 *
 * The SpyRegistry is a class to handle the
 * correct restoration of spied objects.
 *
 * You may push an objects information about
 * a spied method to store it and be able to
 * restore it at any time.
 * Consider the SpyRegistry as information storage
 * for spied objects.
 *
 */


var SpyRegistry = function () {
    /**
     * @constructor
     */
    function SpyRegistry() {
        if (!(this instanceof SpyRegistry)) {
            throw new Error('\n\nPlease make sure to use this ' + 'constructor only with "new" keyword.\n\n');
        }
        this.register = {};
        this.persReg = {};
        this.registerCount = 0;
    }

    /**
     * If called, the SypRegistry will be resetting to its initial state.
     * Exception: the unique register count will not be touched.
     * Meaning that all stored object information will be restored
     * to their individual previous state.
     */
    SpyRegistry.prototype.restoreAll = function () {
        (0, _utils.forEach)(this.register, function (ignored, entry) {
            restoreAttributeForEntry(entry);
        });
        this.register = {};
    };

    /**
     * If called, the SpyRegistry will restore the object,
     * which was registered at given index and is getting lose
     * of the stored information.
     *
     * If the registry entry for the given index does not exist,
     * nothing will happen.
     *
     * @param {number} index -> the unique identifier of stored information.
     */
    SpyRegistry.prototype.restore = function (index) {
        var entry = this.register[index];
        if (entry) {
            restoreAttributeForEntry(entry);
            delete this.register[index];
        }
    };

    /**
     * If called, the SpyRegistry will store the given information.
     * The unique identifier index will be returned.
     *
     * @param {Object} obj -> The related object, which will be spied.
     * @param {string} methodName -> The name of the mocked method.
     * @return {number} -> The unique store index.
     */
    SpyRegistry.prototype.push = function (obj, methodName) {
        this.registerCount++;
        this.register[this.registerCount] = { obj: obj, method: obj[methodName], methodName: methodName };
        return this.registerCount;
    };

    /**
     * If called, the stored method for the corresponding index
     * will be returned. If the registry entry does not exist,
     * undefined will be returned.
     *
     * @param {number} index -> the unique identifier of stored information.
     * @return {any} -> Any stored information can be returned.
     *                   BUT: Usually this method returns a function or
     *                        undefined.
     */
    SpyRegistry.prototype.getOriginalMethod = function (index) {
        var entry = this.register[index];
        if (entry) {
            return entry.method;
        }
    };

    /**
     * If called, the stored method will be moved from the standard
     * registry into the persistent registry or vice versa.
     * This can make restore and restoreAll having no effect anymore.
     *
     * @param {number} index -> the unique identifier of stored information.
     * @param {boolean} intoPersReg -> boolean to determine the moving
     *                                 direction.
     */
    SpyRegistry.prototype.persist = function (index, intoPersReg) {
        var fromReg = intoPersReg ? this.register : this.persReg;
        var toReg = intoPersReg ? this.persReg : this.register;
        var entry = fromReg[index];
        if (entry) {
            toReg[index] = entry;
            delete fromReg[index];
        }
    };

    return SpyRegistry;
}();

exports.SpyRegistry = SpyRegistry;