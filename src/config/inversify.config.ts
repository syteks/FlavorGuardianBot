import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "../types";
import { Bot } from "../classes/bot";
import { Client } from "discord.js";
import { CommandHandler } from "../services/commands/command-handler";
import { Memes } from "../commands/memes/memes";
import { MemeService } from "../services/memes/meme-service";
import { MongoDBClient } from "../utils/mongodb/client";
import { AudioPlayer } from "../classes/audio-player";
import { AddMeme } from "../commands/memes/add-meme";
import { UpdateMeme } from "../commands/memes/update-meme";
import { DeleteMeme } from "../commands/memes/delete-meme";
import { GetMeme } from "../commands/memes/get-meme";
import { Meme } from "../models/meme";

let container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(process.env.BOT_TOKEN || '');
container.bind<CommandHandler>(TYPES.CommandHandler).to(CommandHandler).inSingletonScope();

// Meme related binding
container.bind<Memes>(TYPES.Memes).to(Memes).inSingletonScope();
container.bind<AddMeme>(TYPES.AddMeme).to(AddMeme).inSingletonScope();
container.bind<UpdateMeme>(TYPES.UpdateMeme).to(UpdateMeme).inSingletonScope();
container.bind<DeleteMeme>(TYPES.DeleteMeme).to(DeleteMeme).inSingletonScope();
container.bind<GetMeme>(TYPES.GetMeme).to(GetMeme).inSingletonScope();

// Service related binding
container.bind<MemeService>(TYPES.MemeService).to(MemeService);
container.bind<MongoDBClient>(TYPES.MongoDBClient).to(MongoDBClient).inSingletonScope();
container.bind<AudioPlayer>(TYPES.AudioPlayer).to(AudioPlayer).inSingletonScope();

// Models binding
container.bind<Meme>(TYPES.Meme).to(Meme).inSingletonScope();

export default container;