const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song or playlist.')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription(' The song or playlist to play')
                .setRequired(true))
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The voice channel to join (optional)')
                .addChannelTypes(2)), // 2 is GuildVoice
    async execute(interaction) {
        const player = useMainPlayer();
        const query = interaction.options.getString('query', true);
        let channel = interaction.options.getChannel('channel');

        if (!channel) {
            channel = interaction.member.voice.channel;
        }

        // If still no channel, check if the bot is already connected to one in this guild
        if (!channel) {
            const queue = player.nodes.get(interaction.guildId);
            if (queue && queue.connection) {
                channel = queue.channel;
            }
        }

        if (!channel) return interaction.reply({ content: 'I need to know which voice channel to join! Please join one or specify it in the command.', ephemeral: true });

        await interaction.deferReply();

        try {
            const { streamHandler } = require('../../utils/stream-loader');

            // Explicitly ensure the queue has our hook if it already exists
            const existingQueue = player.nodes.get(interaction.guildId);
            if (existingQueue) {
                existingQueue.onBeforeCreateStream = streamHandler;
            }

            const { track } = await player.play(channel, query, {
                nodeOptions: {
                    metadata: interaction,
                    onBeforeCreateStream: streamHandler
                }
            });

            return interaction.followUp(`**${track.title}** enqueued!`);
        } catch (e) {
            // let's return error if something failed
            return interaction.followUp(`Something went wrong: ${e}`);
        }
    },
};
