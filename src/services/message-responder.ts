import { Message } from "discord.js";
import { PingFinder } from "./commands/ping-finder";
import { Memes } from "./commands/memes";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";

@injectable()
export class MessageResponder {
    /**
     * Ping finder action
     */
    private pingFinder: PingFinder;

    /**
     * Memes action
     */
    private memes: Memes;

    /**
     * Instantiate the message responder
     * 
     * @param pingFinder 
     */
    constructor(
        @inject(TYPES.PingFinder) pingFinder: PingFinder,
        @inject(TYPES.Memes) memes: Memes
    ) {
        this.pingFinder = pingFinder;
        this.memes = memes;
    }

    /**
     * Try to execute the command
     * 
     * @param message 
     * @return Promise<Message | Message[]>
     */
    handle(message: Message): Promise<Message | Message[]> {
        // Make sure this is the ping action before doing it
        if (this.pingFinder.isPing(message.content)) {
            return this.pingFinder.action(message);

        // Maybe its the meme command
        } else if (this.memes.isMeme(message.content)) {
            return this.memes.action(message);
        }

        return Promise.reject();
    }
}