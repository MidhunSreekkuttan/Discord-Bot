import { EmbedBuilder } from "discord.js";

export default {
  name: "guildMemberAdd",
  async execute(member) {
    const channel = member.guild.channels.cache.find(
      (ch) => ch.name === "welcome",
    );

    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("🎉 Welcome to the Server!")
      .setDescription(
        `Hey ${member}, welcome to **${member.guild.name}**!\n\n` +
          `Please read the rules and enjoy your stay 🚀`,
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Member #${member.guild.memberCount}` })
      .setTimestamp();

    channel.send({ embeds: [embed] });
  },
};
