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
     * Require the data source to be present and valid before registering the listener.
     *
     * - When the dataSource is a string, the observer checks for the element's (or elements') existence on the page.
     * - When the dataSource is a StaticDataObject, it checks that the object is not empty.
     * - When the dataSource is 'event' or a DataTransformer, this is ignored.
     *
     * If this option is 'silent' (as opposed to true), then this is treated as truthy but not reported when the strict check fails.
     */
    strictDataSource: boolean | 'silent';

    /**
     * A secondary way of transforming the data after it's been parsed from an element on the page.
     */
    transformData: DataTransformer;

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
     * A callback to execute before the tag has been pushed to the data layer.
     */
    before: CallableFunction;

    /**
     * A callback to execute after the tag has been pushed to the data layer.
     */
    after: CallableFunction;

    /**
     * A callback that always executes; _when_ it executes depends on the success of the event handler's registration.
     *
     * It will only execute once, either:
     * - after strict data source validation fails (and the listener is never registered)
     * - after the conditions check fails (and the data is never pushed) or
     * - after the after() callback following the push to the data layer
     */
    always: CallableFunction,

    /**
     * Allows you to turn on debugMode for individual observers.
     */
    debugMode: boolean;
}
