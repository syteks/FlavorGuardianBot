const youtubePlayer = require('ytdl-core');
const memesClip = require('../Json/audio_storage.json').memes[0];

/**
 * This function will return the clip associated with the given meme name.
 * If the clip is not found in the list, returns empty string.
 * @param clip
 * @returns string If the string is empty it means that the clip was not found in the lsit
 */
const findClip = clip => {
    // If we do not find the given clip in the clip .json than we return an empty string
    if (!(clip in memesClip)) {
        return '';
    }

    return memesClip[clip].clip || '';
}

/**
 * This function should never return empty, unless somebody played with the randomizer and outputs numbers that are outside the list range.
 * @returns string Returns a random clip found in the list
 */
const randomClip = () => {
    // Get all the keys in the meme clips list
    let memesClipKeys = Object.keys(memesClip);

    // Get a random number between 0 and the amount of clip found in the .json file
    let randomClipNumber = Math.floor(Math.random() * memesClipKeys.length);

    // Output the random clip
    return memesClip[memesClipKeys[randomClipNumber]].clip;
}

module.exports = {
    /**
     * Take as second parameter a clip if it empty it will random and chose a audio from existing clips
     * @param originalMessage This is needed in order to interact and order the bot around
     * @param memeClip
     */
    'memes' : (originalMessage, memeClip) => {
        if (!originalMessage.member.voiceChannel) {
            originalMessage.channel.send("You must be in a channel.");
            return;
        }

        // If the passed memeClip (parameters) is empty we randomize a clip from the list and play it else we find the given clip in the parameters
        let clipUrl = memeClip.length === 0 ? randomClip() : findClip(memeClip);

        if (!clipUrl) {
            originalMessage.channel.send("The given clip was not found.");
            return;
        }

        // This is where the clip will be played
        if (!originalMessage.guild.voiceConnection) {
            originalMessage.member.voiceChannel.join().then(connection => {
                // Keep the connection in a dispatcher to know when the bot is done outputting stream
                let dispatcher = connection.playStream(youtubePlayer(clipUrl, {filter: "audioonly", quality: "highestaudio"}), {volume: 0.25});

                // When the audio is done playing we want to disconnect the bot
                dispatcher.on("end", function () {
                    connection.disconnect();
                });
            }).catch(err => {
                console.log(err);
            });
        }
    },

}
