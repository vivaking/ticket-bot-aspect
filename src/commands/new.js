const createTicket = require("../util/ticket");
const { guildModel } = require("../data/export");
module.exports = {
  name: "new",
  description: "makes a ticket channel!",
  cooldown: 3,
  async execute(message) {
    const guildDoc = await guildModel.findOne({ Guild: message.guild.id });
    const e = message.member;
    const user = await message.guild.members.cache.get(e.id);
    await createTicket(message, user, guildDoc);
  },
};
