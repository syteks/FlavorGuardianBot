import { Message } from "discord.js";
import { inject, injectable } from "inversify";
import { CommandHandler } from "../../interfaces/command-handler";
import { AudioPlayer } from "../../classes/audio-player";
import { TYPES } from "../../types";
import { EmbedRichMessage } from "../../classes/embeds/embed-rich-message";

@injectable()
export class Resume implements CommandHandler {
    /**
     * Regex for the command label.
     *
     * @var string
     */
    public readonly regexp = 'r|resume';

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
     * @param _commandParameters - Ignore since we are just resuming the audio player.
     * @return Promise<Message|Message[]>
     */
    action(message: Message, _commandParameters: string[]): Promise<Message | Message[]> {
        this.audioPlayer.resumeAudio();

        let richEmbedMessage: EmbedRichMessage;
        richEmbedMessage = new EmbedRichMessage();

        // Set a troll color.
        richEmbedMessage.setColor("DARK_GREEN");

        // Add a field asking who the fuck had the balls to disconnect the bot.
        richEmbedMessage.addFields([
            {
                "name": 'The audio was resumed',
                "value": 'The audio was resumed successfully',
                "inline": true
            }
        ]);

        message.channel.send(richEmbedMessage);

        return Promise.resolve(message);
    }
}