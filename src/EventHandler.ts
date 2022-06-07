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
        document.addEventListener(this.observer.listener, (event: CustomEvent) => {
            window.dataLayer.push({
                event: this.observer.eventName,
                ...this.getDataCallback()(event.detail)
            });
        });
    }

    getDataCallback(): DataTransformer {
        if (this.observer.dataSource === 'event') {
            return data => data;
        }

        if (typeof this.observer.dataSource === 'function') {
            return this.observer.dataSource;
        }

        const element = document.querySelector(this.observer.dataSource.toString()) as HTMLElement | null;

        return () => JSON.parse(element?.innerText || '{}');
    }
}
