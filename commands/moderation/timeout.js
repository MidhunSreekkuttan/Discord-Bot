const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a member.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The member to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for timeout'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';
        const member = await interaction.guild.members.fetch(target.id);

        if (!member.moderatable) {
            return interaction.reply({ content: 'I cannot timeout this user!', ephemeral: true });
        }

        await member.timeout(duration * 60 * 1000, reason);
        await interaction.reply(`Timed out ${target.username} for ${duration} minutes. Reason: ${reason}`);
    },
};
