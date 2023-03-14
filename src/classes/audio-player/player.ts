import { inject, injectable } from "inversify";
import { Message, StreamDispatcher, VoiceChannel, VoiceConnection } from "discord.js";
import youtubePlaylist, { Result } from "ytpl";
import youtubePlayer, { videoInfo } from "ytdl-core";
import { List } from "./list";
import { TYPES } from "../../types";
import { AudioClip } from "../../interfaces/audio-clip";
import { EmbedRichMessage } from "../embeds/embed-rich-message";
import Timeout = NodeJS.Timeout;

@injectable()
export class Player {
    /**
     * The message associated with the user who triggered the associated command.
     * @type {Message | null}
     */
    private message: Message|null;

    /**
     * The audio list for the jukebox basically our Q.
     * @type {List}
     */
    @inject(TYPES.List)
    private audioList!: List;

    /**
     * The voice connection of the bot.
     * @type {VoiceConnection | null}
     */
    private currentConnection: VoiceConnection|null;

    /**
     * The current audio clip that is playing.
     * @type {AudioClip | null}
     */
    private currentAudioClip: AudioClip|null;

    /**
     * Boolean to indicate if the bot is playing.
     * @type {boolean}
     */
    private isPlaying: boolean;

    /**
     * The current streaming dispatcher, the dispatcher playing the audio.
     * @type {StreamDispatcher | null}
     */
    private currentDispatcher: StreamDispatcher|null;

    /**
     * The first voice channel that the bot joined, this helps us keep the bot in one place after the end of each song.
     * @type {VoiceChannel | null}
     */
    private voiceChannel: VoiceChannel|null;

    /**
     * The cookies for the YouTube calls.
     * @type {Object}
     */
    private cookiesObject: Object = {
        requestOptions: {
            headers: {
                Cookie: '__Secure-3PSIDCC=AFvIBn9HGjm_9h9IUWVVqjtN8oGZ1egL6wR-6kxl1F4nPz8NvQUGiQNLFGaymvHuLn-T9xX7DvU;__Secure-1PSIDCC=AFvIBn9pEntviqxQYuNP_s0KFfZAKYreYk_aonMpXrNoK9Ju6hzMQLc4Fe511bf01L32nzV3;__Secure-3PAPISID=bOJKZZbt1OC-HMf5/A22Lfuiv2pE7arBoz;__Secure-1PAPISID=bOJKZZbt1OC-HMf5/A22Lfuiv2pE7arBoz;__Secure-1PSID=UQjRut_Djskt3UVCyo_ocL7xnnwfy_QXNnnIdS_68X-z7syFXtx31_7nmsyj43gGf_QTLw.;SAPISID=bOJKZZbt1OC-HMf5/A22Lfuiv2pE7arBoz;__Secure-3PSID=UQjRut_Djskt3UVCyo_ocL7xnnwfy_QXNnnIdS_68X-z7syF2PGDX_jekHiPBTvLf__8KA.;APISID=MTU0IvRuj7RvpULV/A8sPxEYKJcTas_yzH;SSID=AkwRfMER2obwCY7hD;SID=UQjRut_Djskt3UVCyo_ocL7xnnwfy_QXNnnIdS_68X-z7syFL7YcZrV9L1V3h2LoSpODoQ.;SIDCC=AFvIBn-kN1iTdB9R5UKo3EZe-h8DwhUa-w-iUlwzeySRNbzMrTfO9gk8UA-vdQQigUfAdb60RA;HSID=Ar--mRMC2KmY7y597;LOGIN_INFO=AFmmF2swRQIhAOvkhWh44Lb2aKdbXZop7_Hav3c6l-49bnWX7bbVirtCAiBnNBqtC94LjCvX5a3Mh72nokJHtkjGNdpwRPc3MlQTlg:QUQ3MjNmeVhOT1NGRnRmOFNfQWZCR3ZMNGVGUzUyamx1OE85elhSZ2V6VkhBbVAxS3NrQ0cxd2hhZjhkNW1TU201dWNRUHhsYmVpeC1tdFNVNEppb0ZJVDI3OGZBTjdQckUyZzYzMTdqTHlBN0RfcE1BRlA3VmUtMV9lLWpkaEQwdjh1OHR0d2FiNlIycHk3U1hRVmVtOFhpUTM3UDc4Wkdn;PREF=tz=America.Toronto&f6=40000000&f7=100;VISITOR_INFO1_LIVE=EAWTiAEo4Cs;YSC=PHwHQ7Y7d8c;',
                'x-youtube-identity-token': "QUFFLUhqazFCWDBKdGpVMTRKX1Roc0Z6YzNKdlJ0ZW90UXw\u003d"
            }
        }
    };

    /**
     * Keeps the inactivity timer.
     * @var {Timeout|number|null}
     */
    private inactivityTimeoutId: Timeout|number|null;

    /**
     * Class constructor
     * @returns void
     */
    constructor() {
        this.message = null;
        this.voiceChannel = null;
        this.currentAudioClip = null;
        this.currentConnection = null;
        this.currentDispatcher = null;
        this.inactivityTimeoutId = null;
        this.isPlaying = false;
    }

    /**
     * This function will be used to initiate the jukebox.
     * @param {string} url
     * @param {Message | null} message
     * @return {Promise<void>}
     */
    public async play(url: string, message: Message|null): Promise<void> {
        this.message = message;

        if (this.voiceChannel === null) {
            this.voiceChannel = this.message?.member?.voice.channel ?? null;
        }

        try {
            await this.processUrl(url);
        } catch (exception) {
            console.log(exception);
        }
    }

    /**
     * Clear the list Q.
     * @returns void
     */
    public clear(): void {
        this.audioList.clear();
    }

    /**
     * Disconnect the bot from the channel and clear the List Q.
     * @returns void
     */
    public disconnect(): void {
        this.isPlaying = false;
        this.voiceChannel = null;

        this.clear();

        // Disconnect the voice connection of the bot.
        this.currentConnection?.disconnect();
    }

    /**
     * Plays the next audio.
     * @return {void}
     */
    public nextAudio(): void {
        let richEmbedMessage: EmbedRichMessage;
        richEmbedMessage = new EmbedRichMessage();

        if (this.audioList.isEnd()) {
            richEmbedMessage.addCustomEmbedField([
                {
                    "name": "You are at the end of the list, spamming next won't help you",
                    'value': "It's time to STOP.",
                    'inline': true,
                }
            ], 'RED');
        } else {
            richEmbedMessage.addCustomEmbedField([
                {
                    "name": 'Audio was skipped successfully !',
                    "value": `Skipped: ${this.currentAudioClip?.audioTitle}`,
                    "inline": true
                }
            ], 'BLURPLE');
        }


        // Send the embed meme message to the channel where the command was invoked.
        this.message?.channel.send(richEmbedMessage);

        this.currentDispatcher?.end();
    }

    /**
     * Pauses the current played audio.
     * @return {void}
     */
    public pauseAudio(): void {
        this.currentDispatcher?.pause(true);
    }

    /**
     * Resumes the current played audio.
     * @return {void}
     */
    public resumeAudio(): void {
        this.currentDispatcher?.resume();
    }

    /**
     * Process the given url, we check if it is a single Audio url or a Playlist url.
     * @param {string} url
     * @return {Promise<void>}
     * @returns void
     */
    private async processUrl(url: string): Promise<void> {
        youtubePlaylist(url)
            .then(async (result: Result) => {
                await this.processPlayListResult(result).catch(() => console.log('Failed processing url.'));
            })
            .catch(async (_err: string) => {
                if (url) {
                    this.audioList.add(url);
                }

                if (!this.isPlaying) {
                    await this.startPlayer(this.audioList.next());
                } else {
                    await youtubePlayer.getInfo(url + '&bpctr=9999999999', this.cookiesObject)
                        .then((result: videoInfo) => {
                            this.message?.channel.send(this.audioList.getNewAudioAddedToTheListEmbed(result.videoDetails.title));
                        })
                        .catch(err => console.log(err))
                }
            });
    }

    /**
     * This will fetch all of the songs found in a playlist and process them by adding them to the Q.
     * @param {Result} result
     * @return {Promise<void>}
     * @returns void
     */
    private async processPlayListResult(result: Result): Promise<void> {
        let insertToIndex: number;

        insertToIndex = this.audioList.reserveEmpty(result.items.length);

        this.message?.channel.send(this.audioList.getNewPlayListAddedEmbed(result.title, result.items.length));

        for (const item of result.items) {
            this.audioList.add(item.shortUrl, insertToIndex);

            insertToIndex++;

            if (!this.isPlaying) {
                await this.startPlayer(this.audioList.next())
                    .then(() => this.isPlaying = true)
                    .catch(() => this.isPlaying = false)
            }
        }

        this.audioList.clearEmpty();
    }

    /**
     * This function will process the given message URL, meaning we will go and fetch the right bitrate player for each given url.
     * @param {string} url
     * @return {Promise<AudioClip>}
     * @returns void
     */
    private async processAudioUrl(url: string): Promise<AudioClip> {
        let audioBasicInfo: videoInfo|void;
        let audioClip: AudioClip;

        audioBasicInfo = await youtubePlayer.getInfo(url + '&bpctr=9999999999', this.cookiesObject).catch(err => console.log(err));

        if (audioBasicInfo) {
            audioClip = {
                audioTitle: audioBasicInfo.player_response.videoDetails.title,
                audioUrl: url,
                audio: youtubePlayer.downloadFromInfo(audioBasicInfo, {filter: "audioonly", quality: "highestaudio"}),
                duration: audioBasicInfo.timestamp,
            };

            audioClip.audio.on('error', function (_err: any) {
                return Promise.reject('The audio URL is not valid or doesn\'t exists.');
            });

            return Promise.resolve(audioClip);
        }

        return Promise.reject('The audio URL is not valid or doesn\'t exists.')
    }

    /**
     * Start the player, means that we initiate a bot joining the channel and play a given audio clip.
     * @param {AudioClip | null} audioClip
     * @return {Promise<void>}
     * @returns void
     */
    private async startPlayer(audioClip: AudioClip|string|null): Promise<void> {
        if (typeof audioClip === "string") {
            try {
                audioClip = await this.processAudioUrl(audioClip);
            } catch (exception) {
                audioClip = null;
                if (! this.audioList.isEnd()) {
                    this.startPlayer(this.audioList.next());
                }
                console.log(exception);
            }
        }

        if (!audioClip) {
            return Promise.reject("The given clip was empty.");
        }

        let foundAudioClip: AudioClip;
        foundAudioClip = audioClip;

        this.voiceChannel?.join().then((connection: VoiceConnection) => {
            this.isPlaying = true;

            this.currentConnection = connection;

            this.currentAudioClip = foundAudioClip;

            this.clearTimeout();

            this.sendCurrentPlayingAudio();

            // Keep the connection in a dispatcher to know when the bot is done outputting stream.
            this.currentDispatcher = this.currentConnection?.play(this.currentAudioClip.audio, {volume: 0.25});

            return this.startAudioDispatcher();
        });
    }

    /**
     * Clear the inactivity timeout if it has a set value.
     * @return {void}
     */
    private clearTimeout(): void {
        // Clear out the inactivity timer if there is a audio in the list.
        clearTimeout(<Timeout> this.inactivityTimeoutId);

        this.inactivityTimeoutId = null;
    }

    /**
     * Start the audio dispatcher, which will get triggered everytime a song is finished.
     * Triggers to play the next audio in the playlist if possible.
     * @returns void
     */
    private startAudioDispatcher(): void {
        this.currentDispatcher?.on('finish', () => {
            // Destroy the stream/dispatcher, so we do not use resource for nothing and it doesn't interrupt the audio of currently playing audio.
            this.currentDispatcher?.destroy();

            // Set the jukebox is currently playing to false
            this.isPlaying = false;

            // Get the next video to play from the list
            const nextAudio = this.audioList.next();

            // If the nextAudio is not undefined or empty play it
            if (nextAudio) {
                // Play the next audio.
                this.startPlayer(nextAudio);
            } else {
                this.inactivityTimeoutId = setTimeout(() => {
                    this.voiceChannel = null;
                    this.currentConnection?.disconnect();
                }, 15 * 60 * 60);
            }
        });
    }

    /**
     * Send a message saying which song title is currently Playing.
     * @returns void
     */
    private sendCurrentPlayingAudio(): void {
        if (this.currentAudioClip) {
            // The dispatcher that will play the audio and close the connection when it done
            let richEmbedMessage: EmbedRichMessage;

            // Rich embed message that we will send, to indicate what is currently playing.
            richEmbedMessage = new EmbedRichMessage();

            richEmbedMessage.addCustomEmbedField([
                {
                    "name": "Now playing",
                    "value": this.currentAudioClip.audioTitle,
                    "inline": true
                }
            ], 'ORANGE');

            // Do nothing with the .then, it only useful to suppress the ts lint. Displays the current audio title.
            this.message?.channel.send(richEmbedMessage);
        }
    }
}
