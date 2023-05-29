import { ReactiveEmbedMessage } from "../../interfaces/reactive-embed-message";
import { injectable } from "inversify";
import { ReactiveEmbedOptions } from "../../interfaces/reactive-embed-options";

@injectable()
export class EmbedMessage {
    /**
     * Contains an array of the reactive messages, identified by a title and a server id and the generated embed message id.
     *
     * @var {Array<ReactiveEmbedMessage>}
     */
    private embedServerMessages: Array<ReactiveEmbedMessage> = [];

    /**
     * Get the embed message by the server ID.
     *
     * @param reactiveEmbedMessageTitle - The reactive embed message title that we want to retrieve.
     * @param serverID - The server ID that the reactive embed message is saved to.
     * @return {ReactiveEmbedMessage | null}
     */
    public getEmbedReactiveMessageByServerID(reactiveEmbedMessageTitle: string, serverID: string): ReactiveEmbedMessage | null {
        return this.embedServerMessages.find(embedServerMessage => (embedServerMessage.serverID === serverID && embedServerMessage.reactiveEmbedMessageTitle === reactiveEmbedMessageTitle)) ?? null;
    }

    /**
     * A way to get a specific settings for a reactive embed message.
     *
     * @param reactiveEmbedMessageTitle - The reactive message title, lika a custom id.
     * @param serverID - The server id that holds the power.
     * @param messageID - The embed message id that we want to change.
     * @return {ReactiveEmbedMessage|null}
     */
    public getEmbedReactiveMessage(reactiveEmbedMessageTitle: string, serverID: string, messageID: string): ReactiveEmbedMessage | null {
        return this.embedServerMessages.find(embedServerMessage => (embedServerMessage.reactiveEmbedMessageTitle === reactiveEmbedMessageTitle && embedServerMessage.serverID === serverID && embedServerMessage.embedMessageID === messageID)) ?? null;
    }

    /**
     * We set the embed server message.
     *
     * @param reactiveEmbedMessageTitle - The reactive embed message title that we want to set retrieve.
     * @param serverID - The server ID that we want to associate the embed message.
     * @param embedMessageID - The embedMessage ID that we will use in order to apply condition on reactive hooks.
     * @param options - Options to save with the embed message.
     */
    public setEmbedReactiveMessageByServerID(reactiveEmbedMessageTitle: string, serverID: string, embedMessageID: string, options: ReactiveEmbedOptions) {
        let reactiveEmbedMessageIndex: number;

        // Check if there is already a instance of the reactive embed message set for the given information.
        reactiveEmbedMessageIndex = this.embedServerMessages.findIndex(reactiveEmbedMessage => (reactiveEmbedMessage.reactiveEmbedMessageTitle === reactiveEmbedMessageTitle && reactiveEmbedMessage.serverID === serverID && reactiveEmbedMessage.embedMessageID === embedMessageID));

        // If there is already an instance existing, we update it and if there is none we push it into the array.
        if (~reactiveEmbedMessageIndex) {
            this.embedServerMessages[reactiveEmbedMessageIndex] = {reactiveEmbedMessageTitle, serverID, embedMessageID, options};
        } else {
            this.embedServerMessages.push({reactiveEmbedMessageTitle, serverID, embedMessageID, options});
        }
    }
}