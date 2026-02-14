const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a user by adding the Muted role")
    .addUserOption((option) =>
      option.setName("target").setDescription("User to mute").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const member = interaction.guild.members.cache.get(user.id);
    const mutedRole = interaction.guild.roles.cache.find(
      (r) => r.name === "Muted",
    );

    if (!member)
      return interaction.reply({ content: "User not found!", ephemeral: true });
    if (!mutedRole)
      return interaction.reply({
        content: "Muted role does not exist!",
        ephemeral: true,
      });

    await member.roles.add(mutedRole);
    interaction.reply({ content: `${user.tag} has been muted.` });
  },
};
