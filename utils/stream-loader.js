const { PassThrough } = require('node:stream');
const path = require('node:path');

async function streamHandler(track, source, _queue) {
    console.log(`[DEBUG] streamHandler called for: ${track.title} [${source}]`);

    try {
        const YTDlpWrapModule = require('yt-dlp-wrap');
        const YTDlpWrap = YTDlpWrapModule.default || YTDlpWrapModule;

        const ytDlpPath = path.join(process.cwd(), 'yt-dlp.exe');
        const ytDlpHelper = new YTDlpWrap(ytDlpPath);

        let videoUrl = track.url;

        if (!videoUrl || (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be'))) {
            const query = `${track.title} ${track.author || ''} audio`;
            console.log(`[DEBUG] Searching yt-dlp for: ${query}`);
            videoUrl = `ytsearch1:${query}`;
        }

        console.log('[DEBUG] Spawning yt-dlp stream for:', videoUrl);

        const stream = ytDlpHelper.execStream([
            videoUrl,
            '-f', 'bestaudio/best',
            '-o', '-',
            '--no-playlist',
            '--default-search', 'ytsearch',
            '--no-warnings',
            '--no-check-certificate',
            '--force-ipv4'
        ]);

        const passThrough = new PassThrough({
            highWaterMark: 1 << 20
        });

        let gotData = false;

        stream.once('data', () => {
            gotData = true;
            console.log('[DEBUG] yt-dlp stream started receiving data');
        });

        stream.on('error', (err) => {
            console.log('[DEBUG] yt-dlp stream error:', err);
            if (!passThrough.destroyed) {
                passThrough.destroy(err);
            }
        });

        stream.on('end', () => {
            console.log('[DEBUG] yt-dlp stream ended');

            if (!gotData) {
                if (!passThrough.destroyed) {
                    passThrough.destroy(new Error('yt-dlp ended before producing audio data'));
                }
                return;
            }

            passThrough.end();
        });

        if (stream.process && stream.process.stderr) {
            stream.process.stderr.on('data', (data) => {
                console.log(`[DEBUG] yt-dlp stderr: ${data.toString()}`);
            });
        }

        stream.pipe(passThrough);
        return passThrough;
    } catch (err) {
        console.log('streamHandler error:', err);
        return null;
    }
}

module.exports = { streamHandler };