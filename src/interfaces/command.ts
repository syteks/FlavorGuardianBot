// This is the interface of a command object, meaning all the commands must have a action function and a regexp attribute
import { Message } from "discord.js";

export default interface Command {
    /**
     * Regex for the command
     */
    regexp: string,

    /**
     * This will define the action of the command.
     * This function will process the input of the user.
     *
     * @param message - The Message of the user
     * @param commandParameters - A string that contains the parameters to the command
     * @returns {Promise<Message | Message[]>}
     */
    action(message: Message, commandParameters: string[]): Promise<Message | Message[]>
}