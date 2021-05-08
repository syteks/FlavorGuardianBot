import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "../types";
import { Bot } from "../class/bot";
import { Client } from "discord.js";
import { MessageResponder } from "../services/message-responder";
import { PingFinder } from "../services/commands/ping-finder";
import { Memes } from "../services/commands/memes/memes";
import { MemeService } from "../services/meme-service";
import { MongoDBClient } from "../utils/mongodb/client";
import { AudioPlayer } from "../class/audio-player";
import { AddMeme } from "../services/commands/memes/add-meme";
import { UpdateMeme } from "../services/commands/memes/update-meme";
import { DeleteMeme } from "../services/commands/memes/delete-meme";

let container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(process.env.BOT_TOKEN || '');
container.bind<MessageResponder>(TYPES.MessageResponder).to(MessageResponder).inSingletonScope();
container.bind<PingFinder>(TYPES.PingFinder).to(PingFinder).inSingletonScope();
container.bind<Memes>(TYPES.Memes).to(Memes).inSingletonScope();
container.bind<AddMeme>(TYPES.AddMeme).to(AddMeme).inSingletonScope();
container.bind<UpdateMeme>(TYPES.UpdateMeme).to(UpdateMeme).inSingletonScope();
container.bind<DeleteMeme>(TYPES.DeleteMeme).to(DeleteMeme).inSingletonScope();
container.bind<MemeService>(TYPES.MemeService).to(MemeService);
container.bind<MongoDBClient>(TYPES.MongoDBClient).to(MongoDBClient);
container.bind<AudioPlayer>(TYPES.AudioPlayer).to(AudioPlayer).inSingletonScope();

export default container;