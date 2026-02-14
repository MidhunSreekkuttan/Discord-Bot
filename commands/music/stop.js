const { SlashCommandBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop the music and clear the queue"),

  async execute(interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue) return interaction.reply("Nothing is playing.");
    queue.stop();
    interaction.reply("🛑 Music stopped and queue cleared!");
  },
};
