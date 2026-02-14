require("dotenv").config(); // Load .env first

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");

// Create client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers, // Needed for welcome messages
  ],
});

// Event: welcome message
const guildMemberAddEvent = require("./events/guildMemberAdd");
client.on("guildMemberAdd", guildMemberAddEvent);

// Collection for commands
client.commands = new Collection();

// Recursive command loader
function loadCommands(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadCommands(fullPath);
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

// Load all commands
const commandsPath = path.join(__dirname, "commands");
loadCommands(commandsPath);

// Ready event
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

// Login
client.login(process.env.TOKEN);
