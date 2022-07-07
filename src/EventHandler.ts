import {TagObserver} from "./types/TagObserver";
import {DataTransformer} from "./types/DataTransformer";

/**
 * The EventHandler registers the listeners and handles pushing the data to the GTM data layer.
 */
export class EventHandler {
    private readonly observer: TagObserver;
    private readonly debugMode: boolean;

    constructor(observer: TagObserver, debugMode: boolean) {
        this.observer = observer;
        this.debugMode = debugMode || this.observer.debugMode;

        if (this.observer.waitForPageLoad) {
            document.addEventListener('DOMContentLoaded', () => {
                this.register()
            });
        } else {
            this.register();
        }
    }

    register(): void {
        if (!this.validateDataSource()) {
            if (this.observer.strictDataSource !== 'silent') {
                console.warn('Strict dataSource checking failed. Data source is:', this.observer.dataSource);
            }

            this.runAlwaysCallback();

            return;
        }

        const event = this.getEventName();

        if (typeof this.observer.listener === 'object' && this.observer.listener.delegate) {
            this.attachListener(document, event, (e: CustomEvent | Event) => {
                if (this.shouldExecuteDelegatedEvent(e)) {
                    this.eventListenerBody(e);
                }
            });
        }

        this.getListenableElements().forEach(element => {
            if (this.debugMode) {
                console.info(`Attaching event [${event}] listener to element:`, element);
            }

            this.attachListener(element, event, (event: CustomEvent | Event) => () => {
                this.eventListenerBody(event)
            });
        });
    }

    shouldExecuteDelegatedEvent(event: CustomEvent | Event): Boolean {
        this.debug('Checking if to execute delegated event');

        if (
            typeof this.observer.listener === 'object' &&
            typeof this.observer.listener.element === 'string' &&
            event.target !== null &&
            event.target instanceof Element
        ) {
            this.debug('Trying to delegate...');

            const selector = this.observer.listener.element;

            this.debug(
                'selector',
                selector,
                'event.target',
                event.target,
                'event.target.classList',
                event.target.classList,
                'event.target.id',
                event.target.id,
                'event.target.attributes',
                event.target.attributes
            );

            switch (this.observer.listener.delegate.type) {
                case 'classname':
                    this.debug(`Delegated event by classname [${selector}]`);
                    return event.target.classList.contains(selector);
                case 'id':
                    this.debug(`Delegated event by id [${selector}]`)
                    return event.target.id === selector;
                case 'dataAttribute':
                    this.debug(`Delegated event by dataAttribute [${selector}]`);
                    return event.target.hasAttribute(selector.replace('[', '').replace(']', ''));
            }
        }

        this.debug('Delegated event NOT executed.');

        return false;
    }

    eventListenerBody(event: CustomEvent | Event) {
        const dataAfterTransformations = this.getData(event);

        if (dataAfterTransformations === null) {
            console.warn('Final data set was null – aborting.');

            return false;
        }

        const data = {
            event: this.observer.eventName,
            ...dataAfterTransformations
        };

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
            console.info('Final event data to be pushed:')
            console.table(data);
        }

        // @todo Can we make these before/after callbacks Promises?
        this.runBeforeCallback();

        window.dataLayer.push(data);

        this.runAfterCallback();

        this.runAlwaysCallback();
    }

    getListenableElements(): Element[] | Document[] {
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

    getEventName(): string {
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

    attachListener(element: Element | Document, event: string, callback: EventListenerOrEventListenerObject) {
        element.addEventListener(event, callback);
    }

    checkConditions(event: CustomEvent | Event, data: object) {
        if (typeof this.observer.condition !== 'function') {
            return true;
        }

        return this.observer.condition(event, data);
    }

    getData(event: CustomEvent | Event): object | null {
        let data = this.getDataCallback()(event);

        if (typeof this.observer.transformData === 'function') {
            return this.observer.transformData(data);
        }

        return data;
    }

    getDataCallback(): DataTransformer | Function {
        if (typeof this.observer.dataSource === 'object') {
            return () => this.observer.dataSource;
        }

        if (this.observer.dataSource === 'event') {
            return (event: CustomEvent) => event.detail;
        }

        if (typeof this.observer.dataSource === 'function') {
            return this.observer.dataSource;
        }

        const element = document.querySelector(this.observer.dataSource.toString()) as HTMLElement | null;

        return () => JSON.parse(element?.innerText || 'null');
    }

    validateDataSource(): boolean {
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

    runBeforeCallback(): void {
        if (typeof this.observer.before !== 'function') {
            return;
        }

        if (this.debugMode) {
            console.info('Executing `before` callback');
        }

        this.observer.before();
    }

    runAfterCallback(): void {
        if (typeof this.observer.after !== 'function') {
            return;
        }

        if (this.debugMode) {
            console.info('Executing `after` callback');
        }

        this.observer.after();
    }

    runAlwaysCallback(): void {
        if (typeof this.observer.always !== 'function') {
            return;
        }

        if (this.debugMode) {
            console.info('Executing `always` callback');
        }

        this.observer.always();
    }

    debug(...args: any) {
        if (this.debugMode) {
            console.info(...args);
        }
    }
}
