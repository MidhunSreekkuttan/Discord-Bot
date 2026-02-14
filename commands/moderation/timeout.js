const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a user for a specific duration (minutes)")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("User to timeout")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("minutes")
        .setDescription("Duration in minutes")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const minutes = interaction.options.getInteger("minutes");
    const member = interaction.guild.members.cache.get(user.id);

    if (!member)
      return interaction.reply({ content: "User not found!", ephemeral: true });

    try {
      await member.timeout(minutes * 60 * 1000);
      interaction.reply({
        content: `${user.tag} has been timed out for ${minutes} minute(s).`,
      });
    } catch {
      interaction.reply({
        content: "Cannot timeout this user.",
        ephemeral: true,
      });
    }
  },
};
