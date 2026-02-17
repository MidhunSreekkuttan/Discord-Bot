const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const fs = require('fs');
const path = require('path');

const playlistsPath = path.join(__dirname, '../../playlists.json');

// Helper to load playlists
const loadPlaylists = () => {
    if (!fs.existsSync(playlistsPath)) {
        fs.writeFileSync(playlistsPath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(playlistsPath, 'utf8'));
};

const savePlaylists = (data) => {
    fs.writeFileSync(playlistsPath, JSON.stringify(data, null, 4));
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Manage custom playlists')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a playlist from the current queue')
                .addStringOption(option => option.setName('name').setDescription('Name of the playlist').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('load')
                .setDescription('Load a playlist')
                .addStringOption(option => option.setName('name').setDescription('Name of the playlist').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a playlist')
                .addStringOption(option => option.setName('name').setDescription('Name of the playlist').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all your playlists')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const playlists = loadPlaylists();
        const userId = interaction.user.id;
        const userPlaylists = playlists[userId] || {};

        if (subcommand === 'create') {
            const name = interaction.options.getString('name');
            const player = useMainPlayer();
            const queue = player.nodes.get(interaction.guildId);

            if (!queue || queue.isEmpty()) return interaction.reply({ content: 'The queue is empty!', ephemeral: true });

            if (userPlaylists[name]) return interaction.reply({ content: 'A playlist with that name already exists!', ephemeral: true });

            const tracks = queue.tracks.map(t => t.url);
            // Also include current track
            if (queue.currentTrack) tracks.unshift(queue.currentTrack.url);

            userPlaylists[name] = tracks;
            playlists[userId] = userPlaylists;
            savePlaylists(playlists);

            return interaction.reply(`Playlist **${name}** created with ${tracks.length} songs.`);

        } else if (subcommand === 'load') {
            const name = interaction.options.getString('name');
            const tracks = userPlaylists[name];

            if (!tracks) return interaction.reply({ content: 'Playlist not found!', ephemeral: true });

            const player = useMainPlayer();
            const channel = interaction.member.voice.channel;
            if (!channel) return interaction.reply({ content: 'You are not connected to a voice channel!', ephemeral: true });

            await interaction.deferReply();

            try {
                // Add first track to start
                const { track } = await player.play(channel, tracks[0], {
                    nodeOptions: { metadata: interaction }
                });

                // Add rest of tracks
                if (tracks.length > 1) {
                    tracks.slice(1).forEach(url => {
                        player.play(channel, url, { nodeOptions: { metadata: interaction } });
                    });
                }

                return interaction.followUp(`Loaded playlist **${name}** with ${tracks.length} songs.`);
            } catch (e) {
                return interaction.followUp(`Failed to load playlist: ${e}`);
            }

        } else if (subcommand === 'delete') {
            const name = interaction.options.getString('name');
            if (!userPlaylists[name]) return interaction.reply({ content: 'Playlist not found!', ephemeral: true });

            delete userPlaylists[name];
            playlists[userId] = userPlaylists;
            savePlaylists(playlists);

            return interaction.reply(`Playlist **${name}** deleted.`);

        } else if (subcommand === 'list') {
            const names = Object.keys(userPlaylists);
            if (names.length === 0) return interaction.reply('You have no saved playlists.');

            return interaction.reply(`**Your Playlists:**\n${names.map(n => `- ${n} (${userPlaylists[n].length} songs)`).join('\n')}`);
        }
    },
};
