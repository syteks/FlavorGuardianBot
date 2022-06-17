import { injectable } from "inversify";
import { AudioClip } from "../../interfaces/audio-clip";
import { EmbedRichMessage } from "../embeds/embed-rich-message";

@injectable()
export class List {
    /**
     * This is the audio clip list that we can use as a Jukebox.
     *
     * @var {Array<AudioClip>|null}
     */
    private list: Array<AudioClip|string|null>;

    private currentIndex: number;

    constructor() {
        this.list = [];
        this.currentIndex = 0;
    }

    public getList(): Array<AudioClip|string|null> {
        return this.list;
    }

    public next(): AudioClip|string|null {
        return this.getAudioClip();
    }

    public clear(): List {
        this.list = [];

        return this;
    }

    public add(audioClip: AudioClip|string|null, index: number|null = null): List {
        if (audioClip) {
            if (index === null) {
                this.list.push(audioClip);
            } else {
                this.list[index] = audioClip;
            }
        }

        return this;
    }

    public remove(index: number): List {
        this.list.splice(index, 1);

        return this;
    }

    public getNewPlayListAddedEmbed(title: string, playListLength: number): EmbedRichMessage {
        let richEmbedMessage: EmbedRichMessage;
        richEmbedMessage = new EmbedRichMessage();

        richEmbedMessage.addCustomEmbedField([
            {
                "name": `A new playlist was added to the queue. ${playListLength} new audio added !`,
                "value": `Playlist: ${title}`,
                "inline": true
            }
        ], 'BLURPLE');

        return richEmbedMessage;
    }

    public getNewAudioAddedToTheListEmbed(audioClipTitle: string): EmbedRichMessage {
        let richEmbedMessage: EmbedRichMessage;
        richEmbedMessage = new EmbedRichMessage();

        richEmbedMessage.addCustomEmbedField([{
            "name": 'A audio  was successfully added to the list.',
            "value": audioClipTitle,
            "inline": true
        }], 'BLURPLE');

        return richEmbedMessage;
    }

    public clearEmpty(): List {
        this.list = this.list.filter((audioClip: AudioClip|string|null) => audioClip !== null);

        return this;
    }

    public reserveEmpty(amount: number|null): number {
        let lastIndex: number;

        lastIndex = this.list.length > 0
            ? this.list.length - 1
            : 0;

        if (amount) {
            this.list.fill(null, lastIndex, amount);
        } else {
            this.list.fill(null, lastIndex);
        }

        return lastIndex + 1;
    }

    public getLastIndex(): number {
        return this.list.length - 1;
    }

    public isEnd(): boolean {
        return this.list.length === this.currentIndex;
    }

    public isStart(): boolean {
        return this.currentIndex === 0;
    }

    private getAudioClip(): AudioClip|string|null {
        return this.list.shift() ?? null;
    }
}