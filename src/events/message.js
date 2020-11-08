const Discord = require("discord.js");
const panel = require("../commands/panel");
const { guildModel, ticketModel, panelModel } = require("../data/export");
module.exports = async (client, message) => {
  const GEa = await guildModel.findOne({ Guild: message.guild.id });
  if (!GEa) {
    const a = new guildModel({
      Guild: message.guild.id,
    });
    a.save();
  }
  if (!message.content.startsWith(client.prefix) || message.author.bot) return;

  const args = message.content.slice(client.prefix.length).trim().split(/ +/);
  const command = args.shift();

  const cmd = client.commands.get(command);

  if (!cmd) return;
  /**-----------------------[PERMISSIONS]--------------------- */
  if (cmd.botPermission) {
    let neededPerms = [];

    cmd.botPermission.forEach((p) => {
      if (!message.guild.me.hasPermission(p)) neededPerms.push("`" + p + "`");
    });

    if (neededPerms.length)
      return message.channel.send(
        `I need ${neededPerms.join(", ")} permission(s) to execute the command!`
      );
  } else if (cmd.authorPermission) {
    let neededPerms = [];

    cmd.authorPermission.forEach((p) => {
      if (!message.member.hasPermission(p)) neededPerms.push("`" + p + "`");
    });

    if (neededPerms.length)
      return message.channel.send(
        `You need ${neededPerms.join(
          ", "
        )} permission(s) to execute the command!`
      );
  }
  /**------------------[COOLDOWN]-------------------------- */
  if (!client.cooldowns.has(cmd.name)) {
    client.cooldowns.set(cmd.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = client.cooldowns.get(cmd.name);
  const cooldownAmount = (cmd.cooldown || 0) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${cmd.name}\` command.`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  /**---------------------[COMMAND EXECUTING]---------------- */
  try {
    cmd.execute(message, args);
  } catch (error) {
    console.error(error);
    message.channel.send("There was an error trying to execute that command!");
  }
};
