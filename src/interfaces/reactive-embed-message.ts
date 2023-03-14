import { ReactiveEmbedOptions } from "./reactive-embed-options";

export interface ReactiveEmbedMessage {
    /**
     * This will contain the title of the embed message that is supposed to be reactive.
     * This should always be unique, it will help distinguish the embed messages for a given server.
     * @var {string}
     */
    reactiveEmbedMessageTitle: string

    /**
     * Contains the server ID, that has the message.
     * @var {string}
     */
    serverID: string;

    /**
     * Contains the id of the message that is reactive.
     * @var {string}
     */
    embedMessageID: string;

    /**
     * Contains the extra options we want to save with the message.
     * @var {array}
     */
    options: ReactiveEmbedOptions;
}