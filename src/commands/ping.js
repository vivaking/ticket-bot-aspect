module.exports = {
  name: "ping",
  description: "Just a simple ping command",
  cooldown: 10,
  execute(message) {
    return message.channel.send("Pong!").catch((err) => console.log(err));
  },
};
