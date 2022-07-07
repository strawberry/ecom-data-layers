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
        this.debug('Registering event handler', this);

        if (!this.validateDataSource()) {
            if (this.observer.strictDataSource !== 'silent') {
                console.warn('Strict dataSource checking failed. Data source is:', this.observer.dataSource);
            }

            this.runAlwaysCallback();

            return;
        }

        const event = this.getEventName();

        if (typeof this.observer.listener === 'object' && this.observer.listener.delegate) {
            this.debug(`Preparing delegated listener on [document] for [${event}] event`);

            this.attachListener(document, event, (e: CustomEvent | Event) => {
                if (this.shouldExecuteDelegatedEvent(e)) {
                    this.eventListenerBody(e);
                }
            });

            return;
        }

        this.getListenableElements().forEach(element => {
            this.debug(`Attaching event [${event}] listener to element:`, element);

            this.attachListener(element, event, (event: CustomEvent | Event) => this.eventListenerBody(event));
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
            this.debug('Checking if event.target matches selector', event.target, this.observer.listener.element);

            return event.target.matches(this.observer.listener.element);
        }

        this.debug('Delegated event NOT executed.');

        return false;
    }

    eventListenerBody(event: CustomEvent | Event) {
        this.debug('Event fired, executing event listener body', event);

        const dataAfterTransformations = this.getData(event);

        if (dataAfterTransformations === null) {
            console.warn('Final data set was null – aborting.');

            return false;
        }

        const data = {
            event: this.observer.eventName,
            ...dataAfterTransformations
        };

        this.debug('Event fired:', event, 'Event data:', data);

        if (!this.checkConditions(event, data)) {
            this.debug('Event check conditions failed');

            this.runAlwaysCallback();

            return;
        }

        this.debug('Event check conditions passed, pushing to data layer', 'Final event data to be pushed:', data);

        // @todo Can we make these before/after callbacks Promises?
        this.runBeforeCallback();

        window.dataLayer.push(data);

        this.runAfterCallback();

        this.runAlwaysCallback();
    }

    getListenableElements(): Element[] | Document[] {
        if (typeof this.observer.listener === 'object') {
            this.debug('Observer listener is an object:', this.observer.listener);

            if (typeof this.observer.listener.element === 'string') {
                this.debug(`Observer listener element is a selector [${this.observer.listener.element}]`);

                return [...document.querySelectorAll(this.observer.listener.element)];
            }

            if (this.observer.listener.element instanceof Element) {
                this.debug('Observer listener element is an Element:', this.observer.listener.element);

                return [this.observer.listener.element];
            }
        }

        return [document];
    }

    getEventName(): string {
        if (typeof this.observer.listener === 'object') {
            this.debug(`Got event name from ListenerDefinition object: [${this.observer.listener.event}]`);

            return this.observer.listener.event;
        }

        this.debug(`Got event name: [${this.observer.listener}]`);

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
        this.debug('Getting data');

        if (typeof this.observer.dataSource === 'object') {
            this.debug('Data source is object, returning', this.observer.dataSource);

            return () => this.observer.dataSource;
        }

        if (this.observer.dataSource === 'event') {
            this.debug('Data source is event, returning the event detail');

            return (event: CustomEvent) => event.detail;
        }

        if (typeof this.observer.dataSource === 'function') {
            this.debug('Data source is function, returning callback');

            return this.observer.dataSource;
        }

        const element = document.querySelector(this.observer.dataSource.toString()) as HTMLElement | null;

        this.debug('Data source is an element, parsing element:', element);

        return () => JSON.parse(element?.innerText || 'null');
    }

    validateDataSource(): boolean {
        this.debug('Validating data source');

        if (!this.observer.strictDataSource) {
            this.debug('Data source validated: validation is not strict; auto-approving.');

            return true;
        }

        if (this.observer.dataSource === 'event' || typeof this.observer.dataSource === 'function') {
            this.debug('Data source validated: data source is an event or a callback.');

            return true;
        }

        if (typeof this.observer.dataSource === 'string') {
            const length = [...document.querySelectorAll(this.observer.dataSource)].length;

            this.debug(`Data source validating from element: checking ${length} > 0`);

            return length > 0;
        }

        if (typeof this.observer.dataSource === 'object') {
            const length = Object.keys(this.observer.dataSource).length;

            this.debug(`Data source validating from object: checking ${length} > 0`);

            return length > 0;
        }

        this.debug('Data source could not be validated; failing validation.');

        return false;
    }

    runBeforeCallback(): void {
        if (typeof this.observer.before !== 'function') {
            this.debug('No `before` callback registered; skipping.');

            return;
        }

        this.debug('Executing `before` callback');

        this.observer.before();
    }

    runAfterCallback(): void {
        if (typeof this.observer.after !== 'function') {
            this.debug('No `after` callback registered; skipping.');

            return;
        }

        this.debug('Executing `after` callback');

        this.observer.after();
    }

    runAlwaysCallback(): void {
        if (typeof this.observer.always !== 'function') {
            this.debug('No `always` callback registered; skipping.');

            return;
        }

        this.debug('Executing `always` callback');

        this.observer.always();
    }

    debug(...args: any) {
        if (this.debugMode) {
            console.info(...args);
        }
    }
}
