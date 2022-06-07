"use strict";
exports.__esModule = true;
var TagManager;
(function (DataLayer_1) {
    var DataLayer = /** @class */ (function () {
        function DataLayer(events) {
            this.events = events;
        }
        DataLayer.initGtm = function (options, events) {
            return new DataLayer(events).configureGtm(options);
        };
        DataLayer.prototype.configureGtm = function (options) {
            console.log(options);
            return this;
        };
        return DataLayer;
    }());
    DataLayer_1.DataLayer = DataLayer;
})(TagManager || (TagManager = {}));
