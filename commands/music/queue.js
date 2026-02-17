const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Displays the current music queue.'),
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);
        if (!queue || !queue.isPlaying()) return interaction.reply({ content: 'No music is currently playing!', ephemeral: true });

        const tracks = queue.tracks.toArray();
        const currentTrack = queue.currentTrack;

        const embed = new EmbedBuilder()
            .setTitle('Server Queue')
            .setDescription(`**Current:** [${currentTrack.title}](${currentTrack.url})\n\n` +
                (tracks.length > 0 ? tracks.slice(0, 10).map((track, i) => `${i + 1}. [${track.title}](${track.url})`).join('\n') : 'No other tracks in queue.'))
            .setFooter({ text: `${tracks.length} songs in queue` });

        return interaction.reply({ embeds: [embed] });
    },
};
