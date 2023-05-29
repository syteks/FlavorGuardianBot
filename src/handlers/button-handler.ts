import { inject, injectable } from "inversify";
import { MessageButtonHandler } from "../interfaces/message-button-handler";
import { TYPES } from "../types";
import { MoreGetMemes } from "../classes/buttons/more-get-memes";
import { LessGetMemes } from "../classes/buttons/less-get-memes";
import { MessageComponent } from "discord-buttons";

@injectable()
export class ButtonHandler {
    /**
     * A list of available handlers in the system.
     *
     * @var {MessageButtonHandler[]}
     */
    private availableButtonHandlers: Array<MessageButtonHandler>

    /**
     * Build our button handler, which will handle the different kinds of button click.
     *
     * @param moreGetMemes - Get more memes.
     * @param lessGetMemes - Get less memes.
     */
    constructor(
        @inject(TYPES.MoreGetMemes) moreGetMemes: MoreGetMemes,
        @inject(TYPES.LessGetMemes) lessGetMemes: LessGetMemes
    ) {
        // Insert all the available handler for buttons.
        this.availableButtonHandlers = [
            moreGetMemes,
            lessGetMemes
        ];
    }

    /**
     * Retrieve the handler for a unique button.
     *
     * @param hookButtonLabel - This is the hook button received by the api.
     * @param buttonLabel - This is the string regex that we are looking for.
     *
     * @return {boolean}
     */
    private static getButtonHandler(hookButtonLabel: string, buttonLabel: string): boolean {
        return hookButtonLabel.search(buttonLabel) >= 0;
    }

    /**
     * This will handle the incoming hook trigger.
     *
     * @param button - The Message component sent by the hook.
     */
    public handle(button: MessageComponent): boolean {
        let buttonHandler: MessageButtonHandler | null;

        buttonHandler = this.availableButtonHandlers.find(availableButtonHandler => ButtonHandler.getButtonHandler(button.id, availableButtonHandler.buttonLabel)) || null;

        // This basically says stfu to the button reply.
        button.defer(true);

        // If we found a handler, we handle the action.
        if (buttonHandler) {
            return buttonHandler.handle(button);
        }

        return false;
    }
}