import {DataTransformer} from "./DataTransformer";
import {ConditionChecker} from "./ConditionChecker";
import {ListenerDefinition} from "./ListenerDefinition";
import {StaticDataObject} from "./StaticDataObject";

export interface TagObserver {
    /* The name of the event to be pushed to the data layer. */
    eventName: string;

    /** The name of the CustomEvent to listen for in order to push to the data layer, or a ListenerDefinition. */
    listener: string | ListenerDefinition;

    /**
     * The source of the data to be pushed to the data layer.
     * Can be "event", a CSS selector string, or a DataTransformer callback.
     */
    dataSource: "event" | string | DataTransformer | StaticDataObject;

    /**
     * A conditional statement that, if it returns falsey, will not push
     * the data to the data layer.
     */
    condition: null | ConditionChecker;

    /**
     * Whether or not to wait for the page to finish loading before attaching the event to the element(s).
     * Useful for attaching events to elements that might not exist, yet.
     */
    waitForPageLoad: boolean;

    /**
     * A callback to execute after the tag has been pushed to the data layer.
     */
    after: CallableFunction;
}
