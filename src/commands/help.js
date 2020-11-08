const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "help",
  description: "Just a simple help command",
  cooldown: 10,
  async execute(message) {
    const embed = new MessageEmbed().setColor("BLUE");

    message.client.commands.forEach(async (command) => {
      embed.addField(command.name, command.description, true);
    });
    return message.channel.send(embed);
  },
};
