import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a member (minutes)")
    .addUserOption((option) =>
      option
        .setName("user")
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
    const user = interaction.options.getUser("user");
    const minutes = interaction.options.getInteger("minutes");
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: "User not found.", ephemeral: true });
    }

    await member.timeout(minutes * 60 * 1000);
    await interaction.reply(`${user.tag} timed out for ${minutes} minutes.`);
  },
};
