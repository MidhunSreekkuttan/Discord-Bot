require("dotenv").config(); // Load .env at the very top

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { Player } = require("discord-player");
const { DefaultExtractors } = require("@discord-player/extractor");
const fs = require("fs");
const path = require("path");

// Create client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

// Collection for commands
client.commands = new Collection();

// Recursive command loader
function loadCommands(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadCommands(fullPath); // recursive for subfolders
    } else if (file.endsWith(".js")) {
      const command = require(fullPath);
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
      } else {
        console.warn(`⚠️ Skipped invalid command file: ${fullPath}`);
      }
    }
  }
}

// Load all commands from "commands" folder
const commandsPath = path.join(__dirname, "commands");
loadCommands(commandsPath);

// Initialize Discord Player
client.player = new Player(client);

// Load default extractors once
(async () => {
  await client.player.extractors.loadMulti(DefaultExtractors);
  console.log("🎵 Default extractors loaded!");
})();

// Bot ready event
client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
});

// Slash command handler
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(`Error executing ${interaction.commandName}:`, err);

    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Error executing command.",
        ephemeral: true,
      });
    } else {
      await interaction.editReply({ content: "❌ Error executing command." });
    }
  }
});

// Login using token from .env
client.login(process.env.TOKEN);
