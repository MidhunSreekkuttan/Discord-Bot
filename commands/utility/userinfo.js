const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { botColor } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display info about a user.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The user to get info about')),
    async execute(interaction) {
        const target = interaction.options.getUser('target') ?? interaction.user;
        const member = await interaction.guild.members.fetch(target.id);

        const embed = new EmbedBuilder()
            .setColor(botColor)
            .setTitle(`${target.username}'s Information`)
            .setThumbnail(target.displayAvatarURL())
            .addFields(
                { name: 'Username', value: target.tag, inline: true },
                { name: 'ID', value: target.id, inline: true },
                { name: 'Joined Server', value: member.joinedAt.toLocaleDateString(), inline: true },
                { name: 'Created Account', value: target.createdAt.toLocaleDateString(), inline: true },
                { name: 'Roles', value: member.roles.cache.map(r => r.name).join(', ') }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
