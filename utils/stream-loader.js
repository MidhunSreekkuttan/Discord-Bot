const { PassThrough } = require('node:stream');
const path = require('node:path');

/**
 * Common hook for onBeforeCreateStream to use yt-dlp
 * @param {object} track - The track object
 * @param {string} source - The source string
 * @param {object} _queue - The queue object
 * @returns {Promise<ReadableStream|null>}
 */
async function streamHandler(track, source, _queue) {
    console.log(`[DEBUG] streamHandler called for: ${track.title} [${source}]`);
    try {
        const YTDlpWrapModule = require('yt-dlp-wrap');
        const YTDlpWrap = YTDlpWrapModule.default || YTDlpWrapModule;

        // Adjust path based on where this is called from. 
        // We assume yt-dlp.exe is in the project root.
        // process.cwd() is safer than __dirname when moving files around.
        const ytDlpPath = path.join(process.cwd(), 'yt-dlp.exe');
        const ytDlpHelper = new YTDlpWrap(ytDlpPath);

        let videoUrl = track.url;

        // 1. Resolve URL if not direct YouTube
        if (!videoUrl || (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be'))) {
            console.log(`[DEBUG] Handling non-YouTube track: ${track.title} by ${track.author}`);
            const query = `${track.title} ${track.author} audio`;
            console.log(`[DEBUG] Searching yt-dlp via ytsearch1: for: ${query}`);
            videoUrl = `ytsearch1:${query}`;
        }

        if (videoUrl) {
            console.log('[DEBUG] Spawning yt-dlp stream for:', videoUrl);
            const stream = ytDlpHelper.execStream([
                videoUrl,
                '-o', '-',
                '-f', 'bestaudio',
                '--no-playlist',
                '--no-check-certificate',
                '--force-ipv4',
                '--no-warnings',
                '--default-search', 'ytsearch'
            ]);

            // Increase buffer to 100MB
            const passThrough = new PassThrough({ highWaterMark: 1 << 27 });
            stream.pipe(passThrough);

            stream.on('error', (err) => console.log('[DEBUG] yt-dlp stream error:', err));
            stream.once('data', () => console.log('[DEBUG] yt-dlp stream started receiving data'));
            stream.on('end', () => console.log('[DEBUG] yt-dlp stream ended'));

            if (stream.process && stream.process.stderr) {
                stream.process.stderr.on('data', (data) => {
                    console.log(`[DEBUG] yt-dlp stderr: ${data.toString()}`);
                });
            }

            return passThrough;
        }
    } catch (err) {
        console.log('streamHandler error:', err);
        return null;
    }
    return null;
}

module.exports = { streamHandler };
