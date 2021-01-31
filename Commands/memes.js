const youtubePlayer = require('ytdl-core');
const memesClip = require('../Json/audio_storage.json').memes[0];

/**
 * This function will return the clip associated with the given meme name.
 * If the clip is not found in the list, returns empty string.
 * @param clip
 * @returns string If the string is empty it means
 */
const findClip = clip => {
    // If we do not find the given clip in the clip .json than we return an empty string
    if (!(clip in memesClip)) {
        return '';
    }

    return memesClip[clip].clip || '';
}

module.exports = {
    /**
     * Take as second parameter a clip if it empty it will random and chose a audio from existing clips
     * @param originalMessage This is needed in order to interact and order the bot around
     * @param memeClip
     */
    'memes' : (originalMessage, memeClip) => {
        // If the member is not in a channel, we can't play the clip/meme
        if (!originalMessage.member.voiceChannel) {
            originalMessage.channel.send("You must be in a channel.");
            return;
        }

        // Try to find the clip in the storage, if nothing is found we simply stop the command process
        let clipUrl = findClip(memeClip);

        if (!clipUrl) {
            originalMessage.channel.send("The given clip was not found.");
            return;
        }

        // Play the clip url
        if (!originalMessage.guild.voiceConnection) {
            originalMessage.member.voiceChannel.join().then(connection => {
                // Keep the connection in a dispatcher to know when the bot is done outputing stream
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
