import { inject, injectable } from "inversify";
import { Message } from "discord.js";
import { CommandHandler as CommandHandlerInterface } from "../interfaces/command-handler";
import { TYPES } from "../types";
import { AddMeme } from "../commands/memes/add-meme";
import { GetMeme } from "../commands/memes/get-meme";
import { UpdateMeme } from "../commands/memes/update-meme";
import { DeleteMeme } from "../commands/memes/delete-meme";
import { Memes } from "../commands/memes/memes";
import { Commands } from "../commands/commands";
import { Play } from "../commands/audio-player/play";
import { Pause } from "../commands/audio-player/pause";
import { Resume } from "../commands/audio-player/resume";
import { Leave } from "../commands/audio-player/leave";
import { Clear } from "../commands/audio-player/clear";
import { Next } from "../commands/audio-player/next";

@injectable()
export class CommandHandler {
    /**
     * We will use this array to go and dynamically fetch our commands.
     * We need an object that has a regexp variable and a action function.
     * A command is defined with a regexp attribute and a action function.
     *
     * @var {Array<Commands>}
     */
    private availableCommands!: Array<CommandHandlerInterface>;

    /**
     * This variable will be used to check if the command given is a valid clip found in the storage.
     *
     * @var {Memes}
     */
    @inject(TYPES.Memes)
    private memes!: Memes;

    /**
     * This variable will be used to check if the command given is a valid clip found in the storage.
     *
     * @var {AddMeme}
     */
    @inject(TYPES.AddMeme)
    private  addMeme!: AddMeme;

    /**
     * This variable will be used to check if the command given is a valid clip found in the storage.
     *
     * @var {UpdateMeme}
     */
    @inject(TYPES.UpdateMeme)
    private updateMeme!: UpdateMeme;

    /**
     * This variable will be used to check if the command given is a valid clip found in the storage.
     *
     * @var {DeleteMeme}
     */
    @inject(TYPES.DeleteMeme)
    private deleteMeme!: DeleteMeme;

    /**
     * This variable will be used to check if the command given is a valid clip found in the storage.
     *
     * @var {GetMeme}
     */
    @inject(TYPES.GetMeme)
    private getMeme!: GetMeme;

    /**
     * This variable will be used to check if the command given is a valid clip found in the storage.
     *
     * @var {Play}
     */
    @inject(TYPES.Play)
    private play!: Play;

    /**
     * This variable will be used to check if the command given is a valid clip found in the storage.
     *
     * @var {Pause}
     */
    @inject(TYPES.Pause)
    private pause!: Pause;

    /**
     * This variable will be used to check if the command given is a valid clip found in the storage.
     *
     * @var {Resume}
     */
    @inject(TYPES.Resume)
    private resume!: Resume;

    /**
     * This variable will be used to skip a audio from the list.
     *
     * @var {Next}
     */
    @inject(TYPES.Next)
    private next!: Next;

    /**
     * This variable will be used to check if the command given is a valid clip found in the storage.
     *
     * @var {Leave}
     */
    @inject(TYPES.Leave)
    private leave!: Leave;

    /**
     * This variable will be used to check if the command given is a valid clip found in the storage.
     *
     * @var {Clear}
     */
    @inject(TYPES.Clear)
    private clear!: Clear;

    /**
     * This variable will be used to check if the command given is a valid clip found in the storage.
     *
     * @var {Commands}
     */
    @inject(TYPES.Commands)
    private commands!: Commands;

    /**
     * Is this the intended command.
     *
     * @param stringToSearch - We check if it was the intended command given by the user.
     * @param regexp - The command regex that identifies the commands and a way to check for the intended command.
     * @return {boolean}
     */
    private static isIntendedCommand(stringToSearch: string, regexp: string): boolean {
        return new RegExp(`\\b(${regexp})\\b`, 'g').test(stringToSearch);
    }

    /**
     * Try to execute the command.
     * 
     * @param message - The users message, that we will check if it was a intended bot command.
     * @return {Promise<Message | Message[]>}
     */
    public handle(message: Message): Promise<Message | Message[]> {
        this.handleAvailableCommands();

        // Separate the command from the parameters
        let userInput: string[],
            originalCommand: string,
            commandParameters: string[],
            command: CommandHandlerInterface|null;

        // User input, it contains the command and the associated parameters.
        userInput = message.content.substr(1).split(" ");

        // Get the command prefix
        originalCommand = userInput[0] || '';
        commandParameters = userInput.splice(1);

        // If the original command is empty, it not an intended command
        if (!originalCommand) {
            return Promise.resolve(message);
        }

        command = this.availableCommands.find(availableCommand => CommandHandler.isIntendedCommand(originalCommand, availableCommand.regexp)) || null;

        // If the originalCommand is not found, try to check that the command is maybe a clip key
        if (command) {
            return command.action(message, commandParameters);
        }

        return this.getMeme.findClip(originalCommand).then((commandClip: string | null) => {
            return commandClip ? this.getMeme.action(message, commandClip) : message.channel.send('Command has not been found.');
        });
    }

    /**
     * Handles the available commands, basically sets the variable that has the available commands classes.
     *
     * @return {void}
     */
    private handleAvailableCommands(): void {
        this.availableCommands = [
            this.memes,
            this.addMeme,
            this.updateMeme,
            this.deleteMeme,
            this.getMeme,
            this.play,
            this.pause,
            this.resume,
            this.next,
            this.leave,
            this.clear,
            this.commands
        ];
    }
}