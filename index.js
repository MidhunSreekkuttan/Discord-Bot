import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client, Collection, GatewayIntentBits } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

client.commands = new Collection();

// Load Commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  const cmd = command.default ?? command;

  if (!cmd.data) {
    console.error(`❌ ${file} is missing data export`);
    continue;
  }

  client.commands.set(cmd.data.name, cmd);
}

// Load Events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = await import(`./events/${file}`);
  if (event.default.once) {
    client.once(event.default.name, (...args) =>
      event.default.execute(...args),
    );
  } else {
    client.on(event.default.name, (...args) => event.default.execute(...args));
  }
}

client.login(process.env.TOKEN);
