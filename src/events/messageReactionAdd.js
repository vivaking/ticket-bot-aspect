const createTicket = require("../util/ticket");
const { panelModel, guildModel, ticketModel } = require("../data/export");
const { MessageEmbed, MessageAttachment } = require("discord.js");
const fetchAll = require("discord-fetch-all");
const fs = require("fs");
const { reactions } = require("discord-fetch-all");
module.exports = async (client, reaction, user) => {
  const { message } = reaction;
  if (user.bot) return;
  if (user.partial) await user.fetch();
  if (reaction.partial) await reaction.fetch();
  if (reaction.message.partial) await reaction.message.fetch();
  const panelDoc = await panelModel.findOne({
    guild: reaction.message.guild.id,
  });
  const guildDoc = await guildModel.findOne({
    Guild: reaction.message.guild.id,
  });
  const ticketDoc = await ticketModel.findOne({
    guild: reaction.message.guild.id,
  });

  if (reaction.message.id === panelDoc.msg) {
    reaction.users.remove(user);
    createTicket(message, user, guildDoc);
  }

  if (reaction.message.id === ticketDoc.msg && reaction.emoji.name === "🔒") {
    reaction.users.remove(user);
    message.channel.updateOverwrite(client.users.cache.get(ticketDoc.owner), {
      SEND_MESSAGES: false,
      VIEW_CHANNEL: false,
    });
    const owner = await message.guild.members.cache.get(ticketDoc.owner);
    owner.send("Your ticket has been closed!");
    const msg = await message.channel.send({
      embed: {
        color: "RED",
        description: "🔓 Reopen Ticket \n⛔ Close Ticket \n📰 Transcript!",
      },
    });
    await msg.react("🔓");
    await msg.react("⛔");
    await msg.react("📰");
    ticketDoc.msg = msg.id;
    ticketDoc.status = false;

    await ticketDoc.save();
  } else if (
    reaction.message.id === ticketDoc.msg &&
    reaction.emoji.name === "🔓"
  ) {
    message.channel.updateOverwrite(client.users.cache.get(ticketDoc.userID), {
      SEND_MESSAGES: true,
      VIEW_CHANNEL: true,
    });

    const msg = await message.channel.messages.fetch(ticketDoc.msg);

    msg.delete();
    const e = new MessageEmbed().setDescription(
      "Staff re-opened this ticket. You can react with 🔒 to close this ticket again!"
    );
    const owner = await message.guild.members.cache.get(ticketDoc.owner);
    const msg3 = await message.channel.send(e);
    owner.send("Your ticket has been re-opened!");
    ticketDoc.msg = msg3.id;
    ticketDoc.ticketStatus = true;

    await ticketDoc.save();
    await msg3.react("🔒");

    message.channel.send({
      embed: {
        color: "GREEN",
        description: `Ticket opened by ${user}`,
      },
    });
  } else if (
    reaction.message.id === ticketDoc.msg &&
    reaction.emoji.name == "⛔"
  ) {
    const owner = await message.guild.members.cache.get(ticketDoc.owner);
    message.channel.delete();
    owner.send("Your ticket has been deleted!");
    await ticketDoc.deleteOne();
  } else if (
    reaction.message.id === ticketDoc.msg &&
    reaction.emoji.name == "📰"
  ) {
    const msgsArray = await fetchAll.messages(message.channel, {
      reverseArray: true,
    });
    const content = msgsArray.map(
      (m) =>
        `${m.author.tag} - ${
          m.embeds.length ? m.embeds[0].description : m.content
        }`
    );

    fs.writeFileSync("transcript.txt", content.join("\n"));

    message.channel
      .send(new MessageAttachment("transcript.txt", "transcript.txt"))
      .then(async () => {
        await fs.unlinkSync("transcript.txt");
      });
  }
};
