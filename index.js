const fs = require('node:fs');
const path = require('node:path');
const dns = require('node:dns');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
require('dotenv').config();

dns.setServers(['1.1.1.1', '8.8.8.8']);

process.on('unhandledRejection', (err) => {
	console.error('Unhandled promise rejection:', err);
});

process.on('uncaughtException', (err) => {
	console.error('Uncaught exception:', err);
});

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates
	],
	ws: {
		handshakeTimeout: 30000
	}
});

process.on('unhandledRejection', err => {
	console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', err => {
	console.error('Uncaught Exception:', err);
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

const { DefaultExtractors } = require('@discord-player/extractor');
const { YoutubeiExtractor } = require('discord-player-youtubei');

// Initialize Player
const player = new Player(client);

// Ensure yt-dlp is available
const YTDlpWrap = require('yt-dlp-wrap').default;
const ytDlpPath = path.join(__dirname, 'yt-dlp.exe');

async function ensureYtDlp() {
	if (!fs.existsSync(ytDlpPath)) {
		console.log('Downloading yt-dlp binary... this may take a moment.');
		await YTDlpWrap.downloadFromGithub(ytDlpPath);
		console.log('yt-dlp downloaded successfully!');
	}
}

player.events.on('playerError', (queue, error) => {
	console.log(`[Player Error] ${error.message}`);
	console.log(error);
});

player.events.on('error', (queue, error) => {
	console.log(`[Queue Error] ${error.message}`);
	console.log(error);
});

(async () => {
	try {
		await ensureYtDlp();

		dns.lookup('gateway.discord.gg', (err, address, family) => {
			if (err) {
				console.error('DNS lookup failed for gateway.discord.gg:', err);
			} else {
				console.log(`gateway.discord.gg resolved to ${address} (IPv${family})`);
			}
		});

		await player.extractors.loadMulti(DefaultExtractors);

		await player.extractors.register(YoutubeiExtractor, {
			streamOptions: {
				useClient: 'IOS'
			}
		});

		console.log('Extractors loaded successfully');

		player.events.on('playerStart', (queue, track) => {
			console.log(`Started playing: ${track.title}`);
		});

		await loginWithRetry();
	} catch (err) {
		console.error('Startup/login failed:', err);
	}
})();

async function loginWithRetry(retries = 5) {
	for (let i = 1; i <= retries; i++) {
		try {
			console.log(`Login attempt ${i}/${retries}...`);
			await client.login(process.env.DISCORD_TOKEN);
			console.log('Discord login successful');
			return;
		} catch (err) {
			console.error(`Login attempt ${i} failed:`, err.message);

			if (i === retries) {
				throw err;
			}

			await new Promise(resolve => setTimeout(resolve, 5000));
		}
	}
}

console.log('Token exists:', !!process.env.DISCORD_TOKEN);

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
		console.error(`Command error in /${interaction.commandName}:`, error);

		const errorMessage = `Command failed: ${error.message || 'Unknown error'}`;

		try {
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: errorMessage,
					ephemeral: true
				});
			} else {
				await interaction.reply({
					content: errorMessage,
					ephemeral: true
				});
			}
		} catch (replyError) {
			console.error('Failed to send error response:', replyError);
		}
	}
});