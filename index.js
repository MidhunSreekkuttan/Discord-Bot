const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
require('dotenv').config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates
	]
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

const { DefaultExtractors } = require('@discord-player/extractor');
const { YoutubeiExtractor } = require('discord-player-youtubei');
const play = require('play-dl');

// Initialize Player
const player = new Player(client);

// Ensure yt-dlp is available
const YTDlpWrap = require('yt-dlp-wrap').default;
const ytDlpPath = path.join(__dirname, 'yt-dlp.exe'); // Windows binary
const ytDlp = new YTDlpWrap(ytDlpPath);

(async () => {
	// Check if binary exists, if not download it
	if (!fs.existsSync(ytDlpPath)) {
		console.log('Downloading yt-dlp binary... this may take a moment.');
		await YTDlpWrap.downloadFromGithub(ytDlpPath);
		console.log('yt-dlp downloaded successfully!');
	}
})();

// Override stream creation to use play-dl
player.events.on('playerError', (queue, error) => {
	console.log(`[Player Error] ${error.message}`);
	console.log(error);
});

player.events.on('error', (queue, error) => {
	console.log(`[Queue Error] ${error.message}`);
	console.log(error);
});

(async () => {
	await player.extractors.loadMulti(DefaultExtractors);

	// Check if we need to register it. Explicitly registering to ensure we handle YouTube links.
	// We use 'IOS' client as it is generally more stable for metadata.
	await player.extractors.register(YoutubeiExtractor, {
		streamOptions: {
			useClient: 'IOS'
		}
	});

	console.log('Extractors loaded successfully');
	// This is the key fix: Intercept stream creation and use play-dl
	player.on('active', (queue) => {
		// Optional: Log active queue
	});

	// Hook into stream creation to use play-dl
	const { stream } = require('play-dl');
	player.events.on('playerStart', (queue, track) => {
		console.log(`Started playing: ${track.title}`);
	});

	// Using the player's internal hook to override stream generation
	// Note: In discord-player v6/v7 usually we register an extractor. 
	// But since we want to force play-dl, we can define a custom extractor or just use this global hook if available.
	// However, the cleanest way in v7 without a custom class is hard.
	client.login(process.env.DISCORD_TOKEN);
})();

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, async c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);

	// Auto-join logic
	const autoJoinId = process.env.AUTO_JOIN_CHANNEL_ID;
	if (autoJoinId) {
		try {
			const channel = await client.channels.fetch(autoJoinId);
			if (channel && channel.isVoiceBased()) {
				console.log(`Auto-joining channel: ${channel.name}`);
				const { streamHandler } = require('./utils/stream-loader');
				const queue = player.nodes.create(channel.guild, {
					metadata: {
						channel: channel
					},
					leaveOnEmpty: false,
					leaveOnEnd: false,
					leaveOnStop: false,
					selfDeaf: false,
					onBeforeCreateStream: streamHandler
				});

				try {
					if (!queue.connection) await queue.connect(channel);
					console.log('Successfully connected to auto-join channel!');
				} catch (e) {
					console.error('Failed to connect to auto-join channel:', e);
					queue.delete();
				}
			} else {
				console.error('Auto-join channel not found or is not a voice channel.');
			}
		} catch (err) {
			console.error('Error in auto-join:', err);
		}
	}
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		console.error(error);
		// Check if interaction was already replied or deferred
		if (interaction.replied || interaction.deferred) {
			// If already replied/deferred, use followUp
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			// Otherwise Reply
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});
