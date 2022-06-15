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
        this.debugMode = debugMode;

        if (this.observer.waitForPageLoad) {
            document.addEventListener('DOMContentLoaded', () => {
                this.register()
            });
        } else {
            this.register();
        }
    }

    register(): void {
        const event = this.getEventName();

        this.getListenableElements().forEach(element => {
            if (this.debugMode) {
                console.info(`Attaching event [${event}] listener to element:`, element);
            }

            this.attachListener(element, event, (event: CustomEvent | Event) => {
                const data = {
                    event: this.observer.eventName,
                    ...this.getDataCallback()(event)
                };

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
                }

                window.dataLayer.push(data);

                if (typeof this.observer.after === 'function') {
                    if (this.debugMode) {
                        console.info('Executing after callback');
                    }

                    this.observer.after();
                }
            })
        });
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

        return () => JSON.parse(element?.innerText || '{}');
    }
}
