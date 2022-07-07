import {DelegationDefintion} from "./DelegationDefintion";

export interface ListenerDefinition {
    /* The event to listen for (e.g., 'click') */
    event: string;

    /** The selector of the element, or a specific element */
    element: string | Element | Document;

    /**
     * Use event delagation so that dynamically created elements will also have the event attached to them.
     */
    delegate: DelegationDefintion;
}
