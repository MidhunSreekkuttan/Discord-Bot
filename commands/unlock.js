import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock this channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      { SendMessages: true },
    );

    await interaction.reply("🔓 Channel unlocked.");
  },
};
