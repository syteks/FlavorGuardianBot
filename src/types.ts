/**
 * In very large applications using strings as the identifiers of the types to be injected by the InversifyJS can 
 * lead to naming collisions. InversifyJS supports and recommends the usage of Symbols instead of string literals.
 * 
 * @source : https://github.com/inversify/InversifyJS/blob/master/wiki/symbols_as_id.md
 */
export const TYPES = {
    Bot: Symbol("Bot"),
    Client: Symbol("Client"),
    Token: Symbol("Token"),
    Commands: Symbol("Commands"),
    CommandHandler: Symbol("CommandHandler"),
    ButtonHandler: Symbol("ButtonHandler"),
    EmbedMessage: Symbol("EmbedMessage"),

    // Memes related symbols
    Memes: Symbol("Memes"),
    AddMeme: Symbol("AddMeme"),
    UpdateMeme: Symbol("UpdateMeme"),
    DeleteMeme: Symbol("DeleteMeme"),
    GetMeme: Symbol("GetMeme"),

    // Audio player related symbols
    Play: Symbol("Play"),
    Pause: Symbol("Pause"),
    Resume: Symbol("Resume"),
    Next: Symbol("Next"),
    Leave: Symbol("Leave"),
    Clear: Symbol("Clear"),

    // Services
    MemeService: Symbol("MemeService"),
    MongoDBClient: Symbol('MongoDBClient'),
    AudioPlayer: Symbol("AudioPlayer"),

    // ButtonsHandler
    MoreGetMemes: Symbol("MoreGetMemes"),
    LessGetMemes: Symbol("LessGetMemes"),

    // Models
    Meme: Symbol("Meme"),
};