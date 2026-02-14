const { SlashCommandBuilder } = require("discord.js");
const { QueryType } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song from YouTube or search query")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Song name, YouTube link, or playlist")
        .setRequired(true),
    ),

  async execute(interaction, client) {
    await interaction.deferReply(); // defer reply so Discord doesn’t timeout

    try {
      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel)
        return interaction.editReply("❌ You must be in a voice channel!");

      const permissions = voiceChannel.permissionsFor(
        interaction.guild.members.me,
      );
      if (!permissions.has("Connect") || !permissions.has("Speak"))
        return interaction.editReply(
          "❌ I need permissions to join & speak in your voice channel!",
        );

      const query = interaction.options.getString("query");

      // Create or get queue
      const queue = client.player.nodes.create(interaction.guild, {
        metadata: {
          channel: interaction.channel,
          requestedBy: interaction.user,
        },
        selfDeaf: true,
      });

      // Connect to VC safely
      try {
        if (!queue.node.connection) await queue.node.connect(voiceChannel);
      } catch {
        return interaction.editReply("❌ I cannot join your voice channel!");
      }

      // Search tracks
      const searchResult = await client.player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });

      if (!searchResult || !searchResult.tracks.length)
        return interaction.editReply("❌ No results found.");

      // Add tracks
      if (searchResult.playlist) {
        await queue.addTracks(searchResult.tracks);
      } else {
        await queue.addTrack(searchResult.tracks[0]);
      }

      // Play if not already playing
      if (!queue.node.isPlaying()) await queue.node.play();

      // Reply with confirmation
      return interaction.editReply(
        searchResult.playlist
          ? `🎵 Added playlist: **${searchResult.playlist.title}** (${searchResult.tracks.length} tracks)`
          : `🎵 Added: **${searchResult.tracks[0].title}**`,
      );
    } catch (err) {
      console.error("Error in /play:", err);
      return interaction.editReply(
        "❌ Something went wrong while trying to play the track.",
      );
    }
  },
};
