const { SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the currently playing song"),

  async execute(interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying())
      return interaction.reply("Nothing is playing.");
    queue.node.skip();
    interaction.reply("⏭ Skipped the song!");
  },
};
