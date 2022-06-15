"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventHandler = void 0;
/**
 * The EventHandler registers the listeners and handles pushing the data to the GTM data layer.
 */
class EventHandler {
    constructor(observer, debugMode) {
        this.observer = observer;
        this.debugMode = debugMode;
        if (this.observer.waitForPageLoad) {
            document.addEventListener('DOMContentLoaded', () => {
                this.register();
            });
        }
        else {
            this.register();
        }
    }
    register() {
        const event = this.getEventName();
        this.getListenableElements().forEach(element => {
            if (this.debugMode) {
                console.info(`Attaching event [${event}] listener to element:`, element);
            }
            this.attachListener(element, event, (event) => {
                const data = Object.assign({ event: this.observer.eventName }, this.getData(event));
                if (this.debugMode) {
                    console.info('Event fired:', event);
                    console.info('Event data:', data);
                }
                if (!this.checkConditions(event, data)) {
                    if (this.debugMode) {
                        console.warn('Event check conditions failed');
                    }
                    return;
                }
                if (this.debugMode) {
                    console.info('Event check conditions passed, pushing to data layer');
                    console.info('Final event data to be pushed:');
                    console.table(data);
                }
                window.dataLayer.push(data);
                if (typeof this.observer.after === 'function') {
                    if (this.debugMode) {
                        console.info('Executing after callback');
                    }
                    this.observer.after();
                }
            });
        });
    }
    getListenableElements() {
        if (typeof this.observer.listener === 'object') {
            if (this.debugMode) {
                console.info('Observer listener is an object:', this.observer.listener);
            }
            if (typeof this.observer.listener.element === 'string') {
                if (this.debugMode) {
                    console.info(`Observer listener element is a selector [${this.observer.listener.element}]`);
                }
                return [...document.querySelectorAll(this.observer.listener.element)];
            }
            if (this.observer.listener.element instanceof Element) {
                if (this.debugMode) {
                    console.info('Observer listener element is an Element:', this.observer.listener.element);
                }
                return [this.observer.listener.element];
            }
        }
        return [document];
    }
    getEventName() {
        if (typeof this.observer.listener === 'object') {
            if (this.debugMode) {
                console.info(`Got event name from ListenerDefinition object: [${this.observer.listener.event}]`);
            }
            return this.observer.listener.event;
        }
        if (this.debugMode) {
            console.info(`Got event name: [${this.observer.listener}]`);
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
    getData(event) {
        let data = this.getDataCallback()(event);
        if (typeof this.observer.transformData === 'function') {
            return this.observer.transformData(data);
        }
        return data;
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