import {TagObserver} from "./types/TagObserver";
import {EventHandler} from "./EventHandler";

declare global {
    interface Window {
        dataLayer: any;
    }
}

export class TagManager {
    private debugMode: boolean;

    constructor(observers: TagObserver[]) {
        observers.map(observer => new EventHandler(observer));
    }

    static init(observers: TagObserver[]) {
        return new TagManager(observers);
    }

    debug(debug: boolean = true) {
        this.debugMode = debug;
    }
}
