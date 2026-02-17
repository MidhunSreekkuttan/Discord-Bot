const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Select a member and kick them.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The member to kick')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for kicking'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';
        const member = await interaction.guild.members.fetch(target.id);

        if (!member.kickable) {
            return interaction.reply({ content: 'I cannot kick this user!', ephemeral: true });
        }

        await member.kick(reason);
        await interaction.reply(`Kicked ${target.username} for reason: ${reason}`);
    },
};
