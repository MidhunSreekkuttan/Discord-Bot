const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from the server")
    .addUserOption((option) =>
      option.setName("target").setDescription("User to kick").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for kick"),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const member = interaction.guild.members.cache.get(user.id);

    if (!member)
      return interaction.reply({ content: "User not found!", ephemeral: true });
    if (!member.kickable)
      return interaction.reply({
        content: "I cannot kick this user.",
        ephemeral: true,
      });

    await member.kick(reason);
    interaction.reply({
      content: `${user.tag} has been kicked. Reason: ${reason}`,
    });
  },
};
