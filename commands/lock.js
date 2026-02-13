import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock this channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      { SendMessages: false },
    );

    await interaction.reply("🔒 Channel locked.");
  },
};
