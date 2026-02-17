const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Select a member and ban them.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The member to ban')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for banning'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';
        const member = await interaction.guild.members.fetch(target.id);

        if (!member.bannable) {
            return interaction.reply({ content: 'I cannot ban this user!', ephemeral: true });
        }

        await member.ban({ reason });
        await interaction.reply(`Banned ${target.username} for reason: ${reason}`);
    },
};
