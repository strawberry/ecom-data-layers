import {TagObserver} from "./types/TagObserver";
import {EventHandler} from "./EventHandler";

declare global {
    interface Window {
        dataLayer: any;
    }
}

export class TagManager {
    constructor(observers: TagObserver[], debugMode: boolean = false) {
        observers.map(observer => new EventHandler(observer, debugMode));
    }
}
