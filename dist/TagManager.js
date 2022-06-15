"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagManager = void 0;
const EventHandler_1 = require("./EventHandler");
class TagManager {
    constructor(observers) {
        observers.map(observer => new EventHandler_1.EventHandler(observer));
    }
    static init(observers) {
        return new TagManager(observers);
    }
    debug(debug = true) {
        this.debugMode = debug;
    }
}
exports.TagManager = TagManager;
//# sourceMappingURL=TagManager.js.map