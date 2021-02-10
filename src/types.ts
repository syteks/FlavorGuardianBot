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
    MessageResponder: Symbol("MessageResponder"),
    PingFinder: Symbol("PingFinder"),
    Memes: Symbol("Memes"),
    MemeService: Symbol("MemeService"),
    MongoDBClient: Symbol('MongoDBClient'),
};