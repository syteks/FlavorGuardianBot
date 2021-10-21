import { injectable } from "inversify";
import { Readable } from "stream";
import youtubePlayer, { videoInfo } from "ytdl-core";
import youtubePlaylist, { Result } from "ytpl";
import { Message, StreamDispatcher, VoiceConnection } from "discord.js";
import { AudioClip } from "../interfaces/audio-clip";
import { EmbedRichMessage } from "./embeds/embed-rich-message";
import Timeout = NodeJS.Timeout;

@injectable()
export class AudioPlayer {
    /**
     * Defines if the jukebox is currently playing a song
     *
     * @var {boolean}
     */
    public isPlaying: boolean;

    /**
     * The audio clip that will be returned, to play.
     *
     * @var {AudioClip|null}
     */
    private currentAudioClip: AudioClip|null;

    /**
     * This is the audio clip list that we can use as a Jukebox.
     *
     * @var {Array<AudioClip>|null}
     */
    private listAudioClip: Array<string>;

    /**
     * Keeps the inactivity timer.
     *
     * @var {Timeout|number|null}
     */
    private inactivityTimeoutId: Timeout|number|null;

    /**
     * The current StreamDispatcher, or aka bot's voice.
     *
     * @var {Connection|null}
     */
    private currentDispatcher: StreamDispatcher|null;

    /**
     * The current connection.
     *
     * @var {VoiceConnection|null}
     */
    private currentConnection: VoiceConnection|null;

    /**
     * Tells us if the bot was forcefully disconnected.
     *
     * @var {boolean}
     */
    private forcedDisconnection: boolean;

    /**
     * The received user message, that we will use to communicate with the user.
     *
     * @var {Message|null}
     */
    private receivedMessage: Message|null;

    /**
     * Setup the audio clip
     */
    constructor() {
        this.isPlaying = false;

        this.currentAudioClip = null;
        this.inactivityTimeoutId = null;
        this.forcedDisconnection = true;
        this.listAudioClip = [];

        // Manipulate the bot connection and voice.
        this.currentDispatcher = null;
        this.currentConnection = null;

        this.receivedMessage = null;
    }

    /**
     * We get the audioTitle from the audioClip.
     *
     * @return {string|null}
     */
    public getAudioTitle(): string|null {
        return this.currentAudioClip?.audioTitle || null;
    }

    /**
     * Get the audioClip
     *
     * @return {Readable | null}
     */
    public getAudioClip(): Readable|null {
        return this.currentAudioClip?.audio || null;
    }

    /**
     * Get the AudioClips in the list
     *
     * @return {Array<AudioClip> | null}
     */
    public getAudioClipList(): Array<string>|null {
        return this.listAudioClip;
    }

    /**
     * Pauses the current played audio.
     *
     * @return {void}
     */
    public pauseAudio(): void {
        this.currentDispatcher?.pause(true);
    }

    /**
     * Resumes the current played audio.
     *
     * @return {void}
     */
    public resumeAudio(): void {
        this.currentDispatcher?.resume();
    }

    /**
     * Plays the next audio by destroying the previous audio.
     *
     * @return {void}
     */
    public nextAudio(): void {
        let richEmbedMessage: EmbedRichMessage;
        richEmbedMessage = new EmbedRichMessage();

        richEmbedMessage.addCustomEmbedField([
            {
                "name": 'Audio was skipped successfully !',
                "value": `Skipped: ${this.currentAudioClip?.audioTitle}`,
                "inline": true
            }
        ], 'BLURPLE');

        // Send the embed meme message to the channel where the command was invoked.
        this.receivedMessage?.channel.send(richEmbedMessage);

        this.currentDispatcher?.end();
    }

    /**
     * This will make the bot join the user channel
     *
     * @param {Message|null} message - The message sent by the user, that we will use to redirect our bot to the user channel.
     * @param {string} clipUrl - The clip that we want to play.
     */
    public handle(message: Message|null, clipUrl: string): void {
        this.receivedMessage = message;

        this.handleAudioPlay(clipUrl);
    }

    /**
     * We process the given url and transform it into a AudioClip that we can check if the audio is valid before making the bot join.
     *
     * @param {string} audioUrl - The audio url that we want to process
     * @return {Promise<AudioClip>}
     */
    public async processAudioUrl(audioUrl: string): Promise<AudioClip> {
        try {
            // The audio information
            let audioBasicInfo: videoInfo,
                audioClip: AudioClip;

            audioBasicInfo = await youtubePlayer.getInfo(audioUrl);

            if (audioBasicInfo && audioBasicInfo.player_response.playabilityStatus.status) {
                audioClip = {
                    audioTitle: audioBasicInfo.player_response.videoDetails.title,
                    audioUrl: audioUrl,
                    audio: youtubePlayer.downloadFromInfo(audioBasicInfo, {filter: "audioonly", quality: "highestaudio"})
                };

                audioClip.audio.on('error', function (_err: any) {
                    return Promise.reject('The audio URL is not valid or doesn\'t exists.');
                });

                return Promise.resolve(audioClip);
            }

            return Promise.reject('The audio URL is not valid or doesn\'t exists.')
        } catch (err) {
            console.log(err);
            return Promise.reject('The audio URL is not valid or doesn\'t exists.')
        }
    }

    /**
     * When the bot is done singing a video it sets the status to currently playing at false and will play the next url in the list.
     *
     * @return {void}
     */
    private dispatchNextAudio(): void {
        this.currentDispatcher?.on('finish', () => {
            // Destroy the stream/dispatcher, so we do not use resource for nothing and it doesn't interrupt the audio of currently playing audio.
            this.currentDispatcher?.destroy();

            // Set the jukebox is currently playing to false
            this.isPlaying = false;

            // Get the next video to play from the list
            let nextAudio = this.listAudioClip.shift();

            // If the nextAudio is not undefined or empty play it
            if (nextAudio) {
                // Play the next audio.
                this.handleProcessAudioUrl(nextAudio);
            } else {
                this.inactivityTimeoutId = setTimeout(() => {
                    this.currentConnection?.disconnect();
                }, 15 * 60 * 60);
            }
        });
    }

    /**
     * Adds a url or a youtube clip to the list and will try to play it, it is the jukebox q:list
     *
     * @param {AudioClip} audioClip
     * @param {boolean} showAddedAudioMessage
     * @return {void}
     */
    public addAudioToList(audioClip: AudioClip, showAddedAudioMessage: boolean): void {
        this.clearTimeout();

        if (audioClip.audioUrl) {
            this.listAudioClip.push(audioClip.audioUrl);

            if (showAddedAudioMessage) {
                let richEmbedMessage: EmbedRichMessage;
                richEmbedMessage = new EmbedRichMessage();

                richEmbedMessage.addCustomEmbedField([{
                    "name": 'A audio  was successfully added to the list.',
                    "value": audioClip.audioTitle,
                    "inline": true
                }], 'BLURPLE');

                // Send the embed meme message to the channel where the command was invoked.
                this.receivedMessage?.channel.send(richEmbedMessage);
            }
        }
    }

    /**
     * Disconnect the bot from the channel.
     *
     * @return {void}
     */
    public disconnect(): void {
        // Set the force disconnection to false, so it doesn't come back and play the easter egg.
        this.forcedDisconnection = false;

        this.isPlaying = false;

        this.clearList();

        // Disconnect the voice connection of the bot.
        this.currentConnection?.disconnect();
    }

    /**
     * Clear the playlist.
     *
     * @return {void}
     */
    public clearList(): void {
        this.listAudioClip = [];
    }

    /**
     * Clear the inactivity timeout if it has a set value.
     *
     * @return {void}
     */
    private clearTimeout(): void {
        // Clear out the inactivity timer if there is a audio in the list.
        clearTimeout(<Timeout> this.inactivityTimeoutId);

        this.inactivityTimeoutId = null;
    }

    /**
     * Handles the force disconnection, when the put is disconnected while he is playing an audio.
     *
     * @return {void}
     */
    private handleForceDisconnection(): void {
        this.currentConnection?.on('disconnect', () => {
            // If the attribute is playing of the audio player is to true, it means there was a clip playing when it was
            // ABRUPTLY interrupted, the person who disconnected the bot has no respect what so ever.
            if (this.isPlaying && this.forcedDisconnection) {
                // Initiate a new embed rich message.
                let richEmbedMessage: EmbedRichMessage;
                richEmbedMessage = new EmbedRichMessage();

                richEmbedMessage.addCustomEmbedField([
                    {
                        "name": 'WHO THE FUCK DARED TO DISCONNECT ME!!!',
                        "value": 'There will be consequences to your action boy.',
                        "inline": true
                    }
                ], 'DARK_VIVID_PINK');

                // Send the embed meme message to the channel where the command was invoked.
                this.receivedMessage?.channel.send(richEmbedMessage);

                // Clear the audio clip list.
                this.listAudioClip = [];

                // If this is not set to false, we can not recall the bot, because it will always think the bot
                // is currently playing, because it never had the chance to end the song and properly disconnect.
                this.isPlaying = false;

                // Play a great 3 second audio in order to calm the situation.
                this.handle(this.receivedMessage, "https://youtu.be/bFc2EDsGf1w");
            }

            // Reset the forced disconnection to true.
            this.forcedDisconnection = true;
        });
    }

    /**
     * Handle the audio play, were we process the clip url and play the audio.
     * It also handle another bunch of shit but I am not paid to tell you what so figure it out.
     *
     * @param {string} clipUrl - The clip url to play.
     * @return {void}
     */
    private handleAudioPlay(clipUrl: string): void {
        youtubePlaylist(clipUrl).then(async (result: Result) => {
            let richEmbedMessage: EmbedRichMessage;
            richEmbedMessage = new EmbedRichMessage();

            richEmbedMessage.addCustomEmbedField([
                {
                    "name": `A new playlist was added to the queue. ${result.estimatedItemCount} new audio added !`,
                    "value": `Playlist: ${result.title}`,
                    "inline": true
                }
            ], 'BLURPLE');

            this.receivedMessage?.channel.send(richEmbedMessage);

            for (const item of result.items) {
                await this.handleProcessAudioUrl(item.shortUrl, false);
            }
        })
            .catch(async (_err: string) => {
                await this.handleProcessAudioUrl(clipUrl);
            })
    }

    /**
     * We receive a url that we want to process, meaning should we add it to the list or play it.
     *
     * @param {string} url
     * @param {boolean} showAddedAudioMessage
     * @return {Promise<void>}
     */
    private async handleProcessAudioUrl(url: string, showAddedAudioMessage: boolean = true): Promise<void> {
        let audioClip: AudioClip;

        audioClip = await this.processAudioUrl(url);

        if (audioClip.audioTitle) {
            if (this.isPlaying) {
                this.addAudioToList(audioClip, showAddedAudioMessage);
            } else {
                this.playAudio(audioClip);
            }
        }
    }

    /**
     * Makes the bot play an audio in the user's channel.
     *
     * @param {AudioClip} audioClip
     * @return {void}
     */
    private playAudio(audioClip: AudioClip): void {
        this.receivedMessage?.member?.voice.channel?.join().then((connection: VoiceConnection) => {
            this.currentConnection = connection;

            this.currentAudioClip = audioClip;

            this.isPlaying = true;

            this.clearTimeout();

            // The dispatcher that will play the audio and close the connection when it done
            let richEmbedMessage: EmbedRichMessage;

            // Rich embed message that we will send, to indicate what is currently playing.
            richEmbedMessage = new EmbedRichMessage();

            richEmbedMessage.addCustomEmbedField([
                {
                    "name": "Now playing",
                    "value": audioClip.audioTitle,
                    "inline": true
                }
            ], 'ORANGE');

            // Do nothing with the .then, it only useful to suppress the ts lint. Displays the current audio title.
            this.receivedMessage?.channel.send(richEmbedMessage);

            // Keep the connection in a dispatcher to know when the bot is done outputting stream.
            this.currentDispatcher = this.currentConnection?.play(audioClip.audio, {volume: 0.25});

            // This will handle the forcefully closed connection, so it doesn't bug the system.
            this.handleForceDisconnection();

            // Look into the list for the next audio to play.
            return this.dispatchNextAudio();
        })
            .catch((_error: string) => {
                // @todo: catch errors and do something about it!
                console.log(_error);
            });
    }
}