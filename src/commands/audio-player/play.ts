import { Message } from "discord.js";
import { inject, injectable } from "inversify";
import { CommandHandler } from "../../interfaces/command-handler";
import { TYPES } from "../../types";
import { AudioPlayer } from "../../classes/audio-player";

@injectable()
export class Play implements CommandHandler {
    /**
     * Regex for the command label.
     *
     * @var string
     */
    public readonly regexp = 'p|play';

    /**
     * The server jukebox, this special variable helps us play some shitty music.
     *
     * @var AudioPlayer
     */
    private audioPlayer: AudioPlayer;

    /**
     * Initialize the command classes, that will process your mom before outputing it into a soundtrack, sike she was too fat to process!
     *
     * @param audioPlayer - This is the bot jukebox, used to process the url's and contains an array of our audio playlist.
     * @return {void}
     */
    constructor(
        @inject(TYPES.AudioPlayer) audioPlayer: AudioPlayer
    ) {
        this.audioPlayer = audioPlayer;
    }

    /**
     * This will define the action of the command.
     * This function will process the input of the user.
     *
     * @param message - Message sent by the user in order to manipulate the channel from where it came.
     * @param commandParameters - Contains all the url to add to the jukebox.
     * @return Promise<Message|Message[]>
     */
    action(message: Message, commandParameters: string[]): Promise<Message | Message[]> {
        if (commandParameters.length > 1) {
            message.channel.send('One url at a time por favor ! Or a playlist url :)');

            return Promise.resolve(message);
        }

        this.audioPlayer.handle(message, commandParameters[0]);

        return Promise.resolve(message);
    }
}