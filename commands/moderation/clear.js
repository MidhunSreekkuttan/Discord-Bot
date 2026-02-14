const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear a number of messages from this channel")
    .addIntegerOption((opt) =>
      opt
        .setName("amount")
        .setDescription("Number of messages to delete (max 100)")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: "You can only delete between 1 and 100 messages.",
        ephemeral: true,
      });
    }

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      interaction.reply({
        content: `🧹 Cleared ${deleted.size} messages!`,
        ephemeral: true,
      });
    } catch (err) {
      console.error(err);
      interaction.reply({
        content: "I could not delete messages.",
        ephemeral: true,
      });
    }
  },
};
