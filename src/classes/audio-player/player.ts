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

    @inject(TYPES.List)
    private audioList!: List;

    private currentConnection: VoiceConnection|null;
    private currentAudioClip: AudioClip|null;
    private isPlaying: boolean;
    private currentDispatcher: StreamDispatcher|null;
    private voiceChannel: VoiceChannel|null;

    private cookiesObject: Object = {
        requestOptions: {
            headers: {
                Cookie: 'VISITOR_INFO1_LIVE=umVXV2-me7s;__Secure-3PSID=EwjRullhSJJnsccAhSZ3PZeOYcoZ08e9hZM65bM322DsmeLi6AW5Rjfof2m_c3yzdDjMXQ.;__Secure-3PAPISID=HefM9btYKIEYVXzr/AHUVv4PhPXCygaqoQ;LOGIN_INFO=AFmmF2swRQIhANSeQ9uDyGaEfq_eZRMtq5Zv30ZqyqEloH7Zn8GvN9tQAiBlvgcrstXx02HEyXQFB-anauemYoBCGfIyy38gJunALg:QUQ3MjNmd2d1aF9iSWV5QUJPTndCaXBOWGZYNU5vOXFhbENyZFpzVzV3QTI0S3JDQ0tzNVhGenMyY0tSa2dlWlgyc0tTcDNITGFjRUtlSFZrTTRVYld6ODgyZDdGQzhkeW9Ybk9LYXJSenEtSG5mQU92OUpnNnRwRXp4OVk3d3lKZ2FublVuUkR3LVFMaDJ0SXUtRHBaQVU1cUZ0VTdaRk1n; PREF=tz=America.Toronto&f6=400;__Secure-3PSIDCC=AJi4QfEfkJrwYU9W7_8rQf5TwUqt7D95ffZZFXi1jytiLdg_4JdpqgzsMui5CeCNxPibU9aR;',
                'x-youtube-identity-token': "QUFFLUhqazFCWDBKdGpVMTRKX1Roc0Z6YzNKdlJ0ZW90UXw\u003d"
            }
        }
    };

    /**
     * Keeps the inactivity timer.
     *
     * @var {Timeout|number|null}
     */
    private inactivityTimeoutId: Timeout|number|null;

    constructor() {
        this.message = null;
        this.voiceChannel = null;
        this.currentAudioClip = null;
        this.currentConnection = null;
        this.currentDispatcher = null;
        this.inactivityTimeoutId = null;
        this.isPlaying = false;
    }

    public async play(url: string, message: Message|null): Promise<void> {
        this.message = message;

        if (this.voiceChannel === null) {
            this.voiceChannel = this.message?.member?.voice.channel ?? null;
        }

        await this.processUrl(url);
    }

    public clear(): void {
        this.audioList.clear();
    }

    public disconnect(): void {
        this.isPlaying = false;
        this.voiceChannel = null;

        this.clear();

        // Disconnect the voice connection of the bot.
        this.currentConnection?.disconnect();
    }

    /**
     * Plays the next audio.
     *
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

    private async processUrl(url: string): Promise<void> {
        youtubePlaylist(url)
            .then(async (result: Result) => {
                await this.processPlayListResult(result);
            })
            .catch(async (_err: string) => {
                let audioClip: AudioClip;
                audioClip = await this.processAudioUrl(url);

                if (audioClip) {
                    this.audioList.add(audioClip);
                }

                if (this.isPlaying) {
                    this.message?.channel.send(this.audioList.getNewAudioAddedToTheListEmbed(audioClip));
                }

                if (!this.isPlaying) {
                    this.startPlayer(this.audioList.next());
                }
            });
    }

    private async processPlayListResult(result: Result): Promise<void> {
        let insertToIndex: number;

        insertToIndex = this.audioList.reserveEmpty(result.items.length);

        this.message?.channel.send(this.audioList.getNewPlayListAddedEmbed(result.title, result.items.length));

        for (const item of result.items) {
            let audioClip = await this.processAudioUrl(item.shortUrl);

            this.audioList.add(audioClip, insertToIndex);

            insertToIndex++;

            if (!this.isPlaying && audioClip) {
                this.startPlayer(this.audioList.next()).then(() => this.isPlaying = true);
            }
        }

        this.audioList.clearEmpty();
    }

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

    private async startPlayer(audioClip: AudioClip|null): Promise<void> {
        if (!audioClip) {
            return Promise.reject("The given clip was empty.");
        }

        this.voiceChannel?.join().then((connection: VoiceConnection) => {
            this.currentConnection = connection;

            this.currentAudioClip = audioClip;

            this.isPlaying = true;

            this.clearTimeout();

            this.sendCurrentPlayingAudio();

            // Keep the connection in a dispatcher to know when the bot is done outputting stream.
            this.currentDispatcher = this.currentConnection?.play(audioClip.audio, {volume: 0.25});

            return this.startAudioDispatcher();
        });
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