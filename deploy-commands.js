import "dotenv/config";
import { REST, Routes } from "discord.js";
import fs from "fs";

const commands = [];
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  commands.push(command.default.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

try {
  console.log("Registering commands...");

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID,
    ),
    { body: commands },
  );

  console.log("Commands registered!");
} catch (error) {
  console.error(error);
}
