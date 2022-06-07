import {DataTransformer} from "./DataTransformer";

export interface TagObserver {
    /* The name of the event to be pushed to the data layer. */
    eventName: string;

    /** The name of the CustomEvent to listen for in order to push to the data layer. */
    listener: string;

    /**
     * The source of the data to be pushed to the data layer.
     * Can be "event", a CSS selector string, or a DataTransformer callback.
     */
    dataSource: "event" | string | DataTransformer;
}
