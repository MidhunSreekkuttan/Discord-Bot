const play = require('play-dl');

(async () => {
    try {
        const query = 'Vellarathaaram (From "Sarvam Maya")';
        console.log(`Searching for: ${query}`);
        const searched = await play.search(query, { limit: 1, source: { youtube: 'video' } });

        if (searched && searched.length > 0) {
            console.log('Result found:');
            console.log(searched[0]);
            console.log('URL property:', searched[0].url);
        } else {
            console.log('No results found.');
        }
    } catch (e) {
        console.error('Error:', e);
    }
})();
