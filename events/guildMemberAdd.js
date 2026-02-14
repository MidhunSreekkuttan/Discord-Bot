const { EmbedBuilder } = require("discord.js");

module.exports = async (member) => {
  const welcomeEmbed = new EmbedBuilder()
    .setColor("#00BFFF") // Professional blue
    .setTitle(`Welcome to ${member.guild.name}!`)
    .setDescription(
      `Hello ${member.user}, we're thrilled to have you here! 🎉\n\nPlease check out the rules and introduce yourself.`,
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .addFields({
      name: "Getting Started",
      value: "1️⃣ Read the rules\n2️⃣ Introduce yourself\n3️⃣ Enjoy your stay!",
    })
    .setFooter({ text: `Member #${member.guild.memberCount}` })
    .setTimestamp();

  const channel = member.guild.channels.cache.find(
    (ch) => ch.name === "welcome",
  ); // Replace with your channel name
  if (channel) channel.send({ embeds: [welcomeEmbed] });
};
