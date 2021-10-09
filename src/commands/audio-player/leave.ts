import { Message } from "discord.js";
import { inject, injectable } from "inversify";
import { CommandHandler } from "../../interfaces/command-handler";
import { TYPES } from "../../types";
import { AudioPlayer } from "../../classes/audio-player";
import { EmbedRichMessage } from "../../classes/embeds/embed-rich-message";

@injectable()
export class Leave implements CommandHandler {
    /**
     * Regex for the command label.
     *
     * @var string
     */
    public readonly regexp = 'l|leave';

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

    /**
     * This will define the action of the command.
     * This function will process the input of the user.
     *
     * @param message
     * @param _commandParameters
     * @return {Promise<Message|Message[]>}
     */
    action(message: Message, _commandParameters: string[]): Promise<Message | Message[]> {
        this.audioPlayer.disconnect();

        // Initiate a new embed rich message.
        let richEmbedMessage: EmbedRichMessage;
        richEmbedMessage = new EmbedRichMessage();

        // Set a troll color.
        richEmbedMessage.setColor("NOT_QUITE_BLACK");

        // Add a field asking who the fuck had the balls to disconnect the bot.
        richEmbedMessage.addFields([
            {
                "name": 'Thank you for using me like that and throw me in the trash :(',
                "value": 'I like to be used and thrown around like a shared ***light.',
                "inline": true
            }
        ]);

        message.channel.send(richEmbedMessage);

        return Promise.resolve(message);
    }
}