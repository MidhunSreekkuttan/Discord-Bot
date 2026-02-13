import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Delete messages")
    .addIntegerOption((option) =>
      option.setName("amount").setDescription("1-100").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: "Choose between 1-100",
        ephemeral: true,
      });
    }

    await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({
      content: `Deleted ${amount} messages`,
      ephemeral: true,
    });
  },
};
