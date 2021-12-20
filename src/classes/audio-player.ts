import { inject, injectable } from "inversify";
import { Message } from "discord.js";
import { Player } from "./audio-player/player";
import { TYPES } from "../types";

@injectable()
export class AudioPlayer {

    /**
     * The player of the bot that can play any given url.
     * @type {Player}
     */
    private player: Player;

    /**
     *
     *
     * @param {Player} player
     */
    constructor(@inject(TYPES.Player) player: Player) {
        this.player = player;
    }

    /**
     * This will make the bot join the user channel
     *
     * @param {Message|null} message - The message sent by the user, that we will use to redirect our bot to the user channel.
     * @param {string} clipUrl - The clip that we want to play.
     */
    public handle(message: Message|null, clipUrl: string): void {
        this.player.play(clipUrl, message);
    }

    public clearList(): void {
        this.player.clear();
    }

    public disconnect(): void {
        this.player.disconnect();
    }

    public nextAudio(): void {
        this.player.nextAudio();
    }

    public pauseAudio(): void {
        this.player.pauseAudio();
    }

    public resumeAudio(): void {
        this.player.resumeAudio();
    }
}