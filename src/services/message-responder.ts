import { Message } from "discord.js";
import { PingFinder } from "./commands/ping-finder";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";

@injectable()
export class MessageResponder {
    /**
     * Ping finder action
     */
    private pingFinder: PingFinder;

    /**
     * Instantiate the message responder
     * 
     * @param pingFinder 
     */
    constructor(
        @inject(TYPES.PingFinder) pingFinder: PingFinder
    ) {
        this.pingFinder = pingFinder;
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
        }

        return Promise.reject();
    }
}