import { Message } from "discord.js";
import { inject, injectable } from "inversify";
import { CommandHandler } from "../../interfaces/command-handler";
import { EmbedRichMessage } from "../../classes/embeds/embed-rich-message";
import { AudioPlayer } from "../../classes/audio-player";
import { TYPES } from "../../types";

@injectable()
export class Clear implements CommandHandler {
    /**
     * Regex for the command label.
     *
     * @var string
     */
    public readonly regexp = 'clear|wipe';

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
        this.audioPlayer.clearList();

        // Initiate a new embed rich message.
        let richEmbedMessage: EmbedRichMessage;
        richEmbedMessage = new EmbedRichMessage();

        // Set a troll color.
        richEmbedMessage.setColor("AQUA");

        // Add a field asking who the fuck had the balls to disconnect the bot.
        richEmbedMessage.addFields([
            {
                "name": 'List has been clear.',
                "value": 'The playlist has been cleared !',
                "inline": true
            }
        ]);

        message.channel.send(richEmbedMessage);

        return Promise.resolve(message);
    }
}