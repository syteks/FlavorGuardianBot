export interface MessageButtonHandler {
    buttonLabel: string;

    handle(button: Object): boolean;
}