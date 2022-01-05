module.exports = {
  name: "simjoin",
  category: "welcome",
  description: "Simulate a Join",
  slash: false,
  ownerOnly: true,
  callback: async ({ message, args, client }) => {
    client.emit("guildMemberAdd", message.member);
    message.reply("Simulated a guild join.");
  },
};
