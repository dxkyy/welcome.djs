const DiscordJS = require("discord.js");
const WOKCommands = require("wokcommands");
const config = require("../wokgen.json");

const client = new DiscordJS.Client({
  intents: 32767,
});

client.on("ready", () => {
  new WOKCommands(client, {
    commandsDir: path.join(__dirname, "commands"),
    featuresDir: path.join(__dirname, "features"),
    disabledDefaultCommands: ["language", "requiredrole", "channelonly"],
    testServers: ["913055030519672832", "927179265567502357"],
    botOwners: ["580836081163829251"],
    mongoUri: config.mongoURI,
  }).setDefaultPrefix(config.prefix);
});

client.login(config.token);
