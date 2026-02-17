const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the music and clears the queue.'),
    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);
        if (!queue || !queue.isPlaying()) return interaction.reply({ content: 'No music is currently playing!', ephemeral: true });

        queue.delete();

        return interaction.reply('Stopped the music and cleared the queue.');
    },
};
