import {TagObserver} from "./types/TagObserver";
import {DataTransformer} from "./types/DataTransformer";

/**
 * The EventHandler registers the listeners and handles pushing the data to the GTM data layer.
 */
export class EventHandler {
    private observer: TagObserver;

    constructor(observer: TagObserver) {
        this.observer = observer;

        this.register();
    }

    register(): void {
        const event = this.getEventName();

        this.getListenableElements().forEach(element => {
            this.attachListener(element, event, (event: CustomEvent | Event) => {
                const data = {
                    event: this.observer.eventName,
                    ...this.getDataCallback()(event)
                };

                if (!this.checkConditions(event, data)) {
                    return;
                }

                window.dataLayer.push(data);
            })
        });
    }

    getListenableElements(): Element[] | Document[] {
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

    getEventName(): string {
        if (typeof this.observer.listener === 'object') {
            return this.observer.listener.event;
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

    getDataCallback(): DataTransformer {
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
