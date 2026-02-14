const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user from the server")
    .addUserOption((option) =>
      option.setName("target").setDescription("User to ban").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for the ban"),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const member = interaction.guild.members.cache.get(user.id);

    if (!member)
      return interaction.reply({ content: "User not found!", ephemeral: true });
    if (!member.bannable)
      return interaction.reply({
        content: "I cannot ban this user.",
        ephemeral: true,
      });

    await member.ban({ reason });
    interaction.reply({
      content: `${user.tag} has been banned. Reason: ${reason}`,
    });
  },
};
