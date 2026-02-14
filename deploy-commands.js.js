const fs = require("fs");
const { REST, Routes } = require("discord.js");
require("dotenv").config();

const commands = [];

const folders = fs.readdirSync("./commands");
for (const folder of folders) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((f) => f.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Refreshing slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID,
      ),
      { body: commands },
    );
    console.log("Commands refreshed successfully!");
  } catch (err) {
    console.error(err);
  }
})();
