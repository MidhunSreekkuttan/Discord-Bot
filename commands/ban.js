import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to ban").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: "User not found.", ephemeral: true });
    }

    await member.ban();
    await interaction.reply(`${user.tag} has been banned.`);
  },
};
