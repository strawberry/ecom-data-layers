"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagManager = void 0;
const EventHandler_1 = require("./EventHandler");
class TagManager {
    constructor(observers, debugMode = false) {
        observers.map(observer => new EventHandler_1.EventHandler(observer, debugMode));
    }
}
exports.TagManager = TagManager;
//# sourceMappingURL=TagManager.js.map