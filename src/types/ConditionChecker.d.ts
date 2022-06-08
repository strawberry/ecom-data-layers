export interface ConditionChecker {
    (event: CustomEvent | Event, data: object): boolean;
}
