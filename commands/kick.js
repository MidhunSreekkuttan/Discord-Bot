import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to kick").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: "User not found.", ephemeral: true });
    }

    await member.kick();
    await interaction.reply(`${user.tag} has been kicked.`);
  },
};
