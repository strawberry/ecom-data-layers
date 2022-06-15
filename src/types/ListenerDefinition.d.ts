export interface ListenerDefinition {
    /* The event to listen for (e.g., 'click') */
    event: string;

    /** The selector of the element, or a specific element */
    element: string | Element | Document;
}
