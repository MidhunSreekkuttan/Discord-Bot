const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Select a member and unban them.')
        .addStringOption(option =>
            option
                .setName('userid')
                .setDescription('The ID of the user to unban')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const userId = interaction.options.getString('userid');

        try {
            await interaction.guild.members.unban(userId);
            await interaction.reply(`Unbanned user with ID ${userId}`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `Please provide a valid User ID that is currently banned. Error: ${error.message}`, ephemeral: true });
        }
    },
};
