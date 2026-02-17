const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Displays information about the currently playing song.'),
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);
        if (!queue || !queue.isPlaying()) return interaction.reply({ content: 'No music is currently playing!', ephemeral: true });

        const track = queue.currentTrack;
        const ts = queue.node.getTimestamp();

        const embed = new EmbedBuilder()
            .setTitle('Now Playing')
            .setDescription(`[${track.title}](${track.url})`)
            .setThumbnail(track.thumbnail)
            .addFields(
                { name: 'Duration', value: `${ts.current.label} / ${ts.total.label}`, inline: true },
                { name: 'Requested By', value: `${track.requestedBy}`, inline: true }
            )
            .setFooter({ text: `Progress: ${queue.node.createProgressBar()}` });

        return interaction.reply({ embeds: [embed] });
    },
};
