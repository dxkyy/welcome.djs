const { MessageAttachment } = require("discord.js");
const { getChannelId } = require("../commands/welcome/setwelcome.js");
const { welcomeImage } = require("discord-welcome-card");

module.exports = async (client) => {
  client.on("guildMemberAdd", async (member) => {
    const { guild } = member;

    const channelId = getChannelId(guild.id);

    if (!channelId) {
      return;
    }

    const channel = guild.channels.cache.get(channelId);
    if (!channel) {
      return;
    }
    const image = await welcomeImage(member, {
      theme: "dark",
    });
    const attachment = new MessageAttachment(image, "welcome.png");
    channel.send({ files: [attachment] });
  });
};

module.exports.config = {
  displayName: "Welcome Message",

  dbName: "WELCOME MESSAGE",
};
