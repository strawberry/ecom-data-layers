import {DataTransformer} from "./DataTransformer";
import {ConditionChecker} from "./ConditionChecker";
import {ListenerDefinition} from "./ListenerDefinition";

export interface TagObserver {
    /* The name of the event to be pushed to the data layer. */
    eventName: string;

    /** The name of the CustomEvent to listen for in order to push to the data layer, or a ListenerDefinition. */
    listener: string | ListenerDefinition;

    /**
     * The source of the data to be pushed to the data layer.
     * Can be "event", a CSS selector string, or a DataTransformer callback.
     */
    dataSource: "event" | string | DataTransformer;

    /**
     * A conditional statement that, if it returns falsey, will not push
     * the data to the data layer.
     */
    condition: null | ConditionChecker;
}
