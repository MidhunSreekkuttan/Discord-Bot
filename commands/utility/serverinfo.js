const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { botColor } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display info about this server.'),
    async execute(interaction) {
        const { guild } = interaction;

        const embed = new EmbedBuilder()
            .setColor(botColor)
            .setTitle(`${guild.name} Information`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: 'Server Name', value: guild.name, inline: true },
                { name: 'Server ID', value: guild.id, inline: true },
                { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Member Count', value: `${guild.memberCount}`, inline: true },
                { name: 'Created At', value: guild.createdAt.toLocaleDateString(), inline: true },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
