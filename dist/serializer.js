'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.serialize = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __serialize = function __serialize(o) {
    var alreadySerialized = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    if (o === _utils.IGNORE) {
        return '>IGNORED<';
    }
    if (o === undefined) {
        return 'undefined';
    }
    if (o === null) {
        return 'null';
    }
    var oClass = Object.prototype.toString.call(o);
    switch (oClass) {
        case '[object RegExp]':
            return '/' + String(o) + '/';
        case '[object String]':
            return '"' + o + '"';
        case '[object Function]':
            return 'Function';
        case '[object Date]':
            return '>Date:' + Number(o) + '<';
        case '[object Number]':
        case '[object Boolean]':
        case '[object Symbol]':
            return String(o);
        default:
        // nothing
    }
    if (alreadySerialized.indexOf(o) !== -1) {
        return '>CYCLOMATIC<';
    }
    var serialized = [].concat((0, _toConsumableArray3.default)(alreadySerialized), [o]);
    if (oClass === '[object Array]') {
        var _results = [];
        for (var i = 0; i < o.length; i++) {
            _results.push(__serialize(o[i], serialized));
        }
        return '[' + _results.join(', ') + ']';
    }

    var oKeys = (0, _utils.objectKeys)(o);
    var results = [];
    for (var _i = 0; _i < oKeys.length; _i++) {
        var key = oKeys[_i];
        results.push(key + ': ' + __serialize(o[key], serialized));
    }
    var objectType = o.constructor.name;
    var displayedType = objectType === 'Object' ? '' : objectType;
    return displayedType + '{' + results.join(', ') + '}';
};

var serialize = exports.serialize = function serialize(o) {
    return __serialize(o);
};