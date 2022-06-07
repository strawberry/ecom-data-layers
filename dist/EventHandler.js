"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventHandler = void 0;
/**
 * The EventHandler registers the listeners and handles pushing the data to the GTM data layer.
 */
class EventHandler {
    constructor(observer) {
        this.observer = observer;
        this.register();
    }
    register() {
        document.addEventListener(this.observer.listener, (event) => {
            window.dataLayer.push(Object.assign({ event: this.observer.eventName }, this.getDataCallback()(event.detail)));
        });
    }
    getDataCallback() {
        if (this.observer.dataSource === 'event') {
            return data => data;
        }
        if (typeof this.observer.dataSource === 'function') {
            return this.observer.dataSource;
        }
        const element = document.querySelector(this.observer.dataSource.toString());
        return () => JSON.parse((element === null || element === void 0 ? void 0 : element.innerText) || '{}');
    }
}
exports.EventHandler = EventHandler;
//# sourceMappingURL=EventHandler.js.map