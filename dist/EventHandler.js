"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventHandler = void 0;
/**
 * The EventHandler registers the listeners and handles pushing the data to the GTM data layer.
 */
class EventHandler {
    constructor(observer, debugMode) {
        this.observer = observer;
        this.debugMode = debugMode || this.observer.debugMode;
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
        if (!this.validateDataSource()) {
            if (this.observer.strictDataSource !== 'silent') {
                console.warn('Strict dataSource checking failed. Data source is:', this.observer.dataSource);
            }
            this.runAlwaysCallback();
            return;
        }
        const event = this.getEventName();
        this.getListenableElements().forEach(element => {
            if (this.debugMode) {
                console.info(`Attaching event [${event}] listener to element:`, element);
            }
            this.attachListener(element, event, (event) => {
                const dataAfterTransformations = this.getData(event);
                if (dataAfterTransformations === null) {
                    console.warn('Final data set was null – aborting.');
                    return false;
                }
                const data = Object.assign({ event: this.observer.eventName }, dataAfterTransformations);
                if (this.debugMode) {
                    console.info('Event fired:', event);
                    console.info('Event data:', data);
                }
                if (!this.checkConditions(event, data)) {
                    if (this.debugMode) {
                        console.warn('Event check conditions failed');
                    }
                    this.runAlwaysCallback();
                    return;
                }
                if (this.debugMode) {
                    console.info('Event check conditions passed, pushing to data layer');
                    console.info('Final event data to be pushed:');
                    console.table(data);
                }
                window.dataLayer.push(data);
                this.runAfterCallback();
                this.runAlwaysCallback();
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
        return () => JSON.parse((element === null || element === void 0 ? void 0 : element.innerText) || 'null');
    }
    validateDataSource() {
        if (!this.observer.strictDataSource) {
            return true;
        }
        if (this.observer.dataSource === 'event' || typeof this.observer.dataSource === 'function') {
            return true;
        }
        if (typeof this.observer.dataSource === 'string') {
            return [...document.querySelectorAll(this.observer.dataSource)].length > 0;
        }
        if (typeof this.observer.dataSource === 'object') {
            return Object.keys(this.observer.dataSource).length > 0;
        }
        return false;
    }
    runAfterCallback() {
        if (typeof this.observer.after !== 'function') {
            return;
        }
        if (this.debugMode) {
            console.info('Executing `after` callback');
        }
        this.observer.after();
    }
    runAlwaysCallback() {
        if (typeof this.observer.always !== 'function') {
            return;
        }
        if (this.debugMode) {
            console.info('Executing `always` callback');
        }
        this.observer.always();
    }
}
exports.EventHandler = EventHandler;
//# sourceMappingURL=EventHandler.js.map