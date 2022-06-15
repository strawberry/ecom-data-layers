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
        const event = this.getEventName();
        this.getListenableElements().forEach(element => {
            this.attachListener(element, event, (event) => {
                const data = Object.assign({ event: this.observer.eventName }, this.getDataCallback()(event));
                if (!this.checkConditions(event, data)) {
                    return;
                }
                window.dataLayer.push(data);
            });
        });
    }
    getListenableElements() {
        if (typeof this.observer.listener === 'object') {
            if (typeof this.observer.listener.element === 'string') {
                return [...document.querySelectorAll(this.observer.listener.element)];
            }
            if (this.observer.listener.element instanceof Element) {
                return [this.observer.listener.element];
            }
        }
        return [document];
    }
    getEventName() {
        if (typeof this.observer.listener === 'object') {
            return this.observer.listener.event;
        }
        return this.observer.listener;
    }
    attachListener(element, event, callback) {
        element.addEventListener(event, callback);
    }
    checkConditions(event, data) {
        if (typeof this.observer.condition !== 'function') {
            return true;
        }
        return this.observer.condition(event, data);
    }
    getDataCallback() {
        if (typeof this.observer.dataSource === 'object') {
            return () => this.observer.dataSource;
        }
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