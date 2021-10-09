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
    public readonly regexp = 'play|p|shit-in-my-ear';

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
     * @return void
     */
    constructor(
        @inject(TYPES.AudioPlayer) audioPlayer: AudioPlayer
    ) {
        this.audioPlayer = audioPlayer;
    }

    action(message: Message, commandParameters: string[]): Promise<Message | Message[]> {
        commandParameters.forEach((clip) => {
            this.audioPlayer.playAudio(message, clip)
        })

        return Promise.resolve(message);
    }
}