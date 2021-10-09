import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "../types";
import { Bot } from "../classes/bot";
import { Client } from "discord.js";
import { CommandHandler } from "../handlers/command-handler";
import { GetMeme } from "../commands/memes/get-meme";
import { MemeService } from "../services/memes/meme-service";
import { MongoDBClient } from "../utils/mongodb/client";
import { AudioPlayer } from "../classes/audio-player";
import { AddMeme } from "../commands/memes/add-meme";
import { UpdateMeme } from "../commands/memes/update-meme";
import { DeleteMeme } from "../commands/memes/delete-meme";
import { Memes } from "../commands/memes/memes";
import { Meme } from "../models/meme";
import { EmbedMessage } from "../classes/embeds/embed-message";
import { Commands } from "../commands/commands";
import { MoreGetMemes } from "../classes/buttons/more-get-memes";
import { LessGetMemes } from "../classes/buttons/less-get-memes";
import { ButtonHandler } from "../handlers/button-handler";
import { Play } from "../commands/audio-player/play";
import { Pause } from "../commands/audio-player/pause";
import { Leave } from "../commands/audio-player/leave";
import { Clear } from "../commands/audio-player/clear";
import { Resume } from "../commands/audio-player/resume";

let container = new Container();
let client = new Client();

require("discord-buttons")(client);

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(client);
container.bind<string>(TYPES.Token).toConstantValue(process.env.BOT_TOKEN || '');
container.bind<Commands>(TYPES.Commands).to(Commands).inSingletonScope();
container.bind<CommandHandler>(TYPES.CommandHandler).to(CommandHandler).inSingletonScope();
container.bind<ButtonHandler>(TYPES.ButtonHandler).to(ButtonHandler).inSingletonScope();
container.bind<EmbedMessage>(TYPES.EmbedMessage).to(EmbedMessage).inSingletonScope();

// Meme related binding
container.bind<GetMeme>(TYPES.Memes).to(GetMeme).inSingletonScope();
container.bind<AddMeme>(TYPES.AddMeme).to(AddMeme).inSingletonScope();
container.bind<UpdateMeme>(TYPES.UpdateMeme).to(UpdateMeme).inSingletonScope();
container.bind<DeleteMeme>(TYPES.DeleteMeme).to(DeleteMeme).inSingletonScope();
container.bind<Memes>(TYPES.GetMeme).to(Memes).inSingletonScope();

// Audio player related binding
container.bind<Play>(TYPES.Play).to(Play).inSingletonScope();
container.bind<Pause>(TYPES.Pause).to(Pause).inSingletonScope();
container.bind<Resume>(TYPES.Resume).to(Resume).inSingletonScope();
container.bind<Leave>(TYPES.Leave).to(Leave).inSingletonScope();
container.bind<Clear>(TYPES.Clear).to(Clear).inSingletonScope();


// Service related binding
container.bind<MemeService>(TYPES.MemeService).to(MemeService);
container.bind<MongoDBClient>(TYPES.MongoDBClient).to(MongoDBClient).inSingletonScope();
container.bind<AudioPlayer>(TYPES.AudioPlayer).to(AudioPlayer).inSingletonScope();

// Button related handlers
container.bind<MoreGetMemes>(TYPES.MoreGetMemes).to(MoreGetMemes).inSingletonScope();
container.bind<LessGetMemes>(TYPES.LessGetMemes).to(LessGetMemes).inSingletonScope();

// Models binding
container.bind<Meme>(TYPES.Meme).to(Meme).inSingletonScope();

export default container;