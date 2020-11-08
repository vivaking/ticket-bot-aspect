const { MessageEmbed } = require("discord.js");
const { panelModel, ticketModel } = require("../data/export");

module.exports = async (message, user, guildDoc) => {
  guildDoc.tickets += 1;
  await guildDoc.save();
  const ticketChannel = await message.guild.channels.create(
    `ticket-${guildDoc.tickets}`,
    {
      permissionOverwrites: [
        {
          allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
          id: user.id,
        },
        {
          deny: ["VIEW_CHANNEL", "SEND_MESSAGES"],
          id: message.guild.id,
        },
      ],
    }
  );
  const em = new MessageEmbed()
    .setTitle("Welcome to your ticket!")
    .setDescription(
      "Staff will assist you shortly. You can react with 🔒 to close this ticket!"
    );

  const msg = await ticketChannel.send(user.toString(), em);
  msg.react("🔒");
  const ticketDoc = new ticketModel({
    guild: message.guild.id,
    owner: user.id,
    channelID: ticketChannel.id,
    msg: msg.id,
  });
  ticketDoc.save();
  user.send(`Ticket created check ${ticketChannel}!`);
};
