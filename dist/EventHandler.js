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
            const data = Object.assign({ event: this.observer.eventName }, this.getDataCallback()(event));
            if (!this.checkConditions(event, data)) {
                return;
            }
            window.dataLayer.push(data);
        });
    }
    checkConditions(event, data) {
        if (this.observer.condition === null) {
            return true;
        }
        return this.observer.condition(event, data);
    }
    getDataCallback() {
        if (this.observer.dataSource === 'event') {
            return (event) => event.detail;
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