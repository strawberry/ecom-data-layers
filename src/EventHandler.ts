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
        document.addEventListener(this.observer.listener, (event: CustomEvent | Event) => {
            const data = {
                event: this.observer.eventName,
                ...this.getDataCallback()(event)
            };

            if (!this.checkConditions(event, data)) {
                return;
            }

            window.dataLayer.push(data);
        });
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
