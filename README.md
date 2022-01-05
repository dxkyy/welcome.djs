# Welcome.djs

---

This guide will teach you how to create a Welcome Message system for your discord bot using WOKCommands.

## Requirements

---

- Basic Knowledge of JavaScript/NodeJS

- Basic Knowledge of MongoDB/Mongoose

- Good experience with Discord.js

- A working connection to MongoDB with Schemas

Discord.js v12 or higher. Nodejs v14 or higher.

Understanding Pathing

```
/ = Root directory.
. = This location.
.. = Up one directory.
./ = Current directory.
../ = Parent of current directory.
../../ = Two directories backwards.
```

## Getting Started

---

Lets get started by setting up our project using [wokgen](https://npmjs.com/package/wokgen). You can install wokgen using 

```
npm install -g wokgen
```

Now type `wokgen` into your command line and follow the prompts(Make sure to put in ALL the information, including your mongoURI).

After that we just need to install a few dependencies, so just go ahead and cd into your project and type

```
npm install mongoose
npm install discord-welcome-card
```

## The Schema

---

In the `src` folder, create a new folder called `schemas` and create a file called `welcome-schema.js` in that folder. Open up that file and require mongoose.

Just for making the file short, we are going to create a "reqString" like this:

```js
const reqString = {
  type: String,
  required: true,
};
```

Below that we are going to create our new schema with `new mongoose.Schema()`, which will contain an `_id` and a `channelId` wich are both of the `reqString` type we just created. The schema should look something like this:

```js
const welcomeSchema = new mongoose.Schema({
  _id: reqString,
  channelId: reqString,
});
```

Now we just need to export it using `module.exports`. Our whole file looks like this now: 

```js
const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const welcomeSchema = new mongoose.Schema({
  _id: reqString,
  channelId: reqString,
});

module.exports = mongoose.model("welcome-message-tutorial", welcomeSchema);


```

## Setting the Welcome channel

---

In your project directory, open up a new command line and type in `wokgen`.
Select the Generate option and generate a new command by the name of `setwelcome`(make sure the category is set to "welcome"), which we will use to set our welcome channel in each server.

After generating the command, open up its file and import our schema at the top of our file with 

```js
const welcomeSchema = require("../../schemas/welcome-schema.js");
```

To cache and load our data which is more efficient and faster, we are going to create a new Map called `cache` and a `loadData` function below the welcomeSchema import.

Now the top of our file should look like this: 

```js
const welcomeSchema = require("../../models/welcome-schema.js");
const cache = new Map();

const loadData = async () => {
  const results = await welcomeSchema.find();
  for (const result of results) {
    cache.set(result._id, result.channelId);
  }
};
loadData();
```

In our callback we are going to get the `guild` and the `channel` of our message with

```js
const { guild, channel } = message;
```

Below that, the real action begins.
Now we are going to `findOneAndUpdate` in our welcomeSchema like this:

```js
await welcomeSchema.findOneAndUpdate(
      {
        _id: guild.id,
      },
      {
        _id: guild.id,
        channelId: channel.id,
      },
      {
        upsert: true,
      }
    );
```

Make sure to add 

```js
cache.set(guild.id, channel.id);
```

below that so we can load the data later. 
If you want, you can reply to the command to ensure the user that the welcome channel has been set after that.

At the end of our file, make sure to export the cached `channelId` with 

```js
module.exports.getChannelId = (guildId) => {
  return cache.get(guildId);
};
```

Our whole file should look like this now:

```js
const welcomeSchema = require("../../schemas/welcome-schema.js");
const cache = new Map();

const loadData = async () => {
  const results = await welcomeSchema.find();
  for (const result of results) {
    cache.set(result._id, result.channelId);
  }
};
loadData();

module.exports = {
  name: "setwelcome",
  category: "welcome",
  description: "Set the Welcome channel.",
  ownerOnly: true,
  slash: false,

  callback: async ({ message, args, client }) => {
    const { guild, channel } = message;
    await welcomeSchema.findOneAndUpdate(
      {
        _id: guild.id,
      },
      {
        _id: guild.id,
        channelId: channel.id,
      },
      {
        upsert: true,
      }
    );
    cache.set(guild.id, channel.id);

    message.reply("Welcome channel set!");
  },
};

module.exports.getChannelId = (guildId) => {
  return cache.get(guildId);
};

```

## Sending the welcome message

---

Generate a feature called "Welcome" using `wokgen` and import the needed dependencies like this:

```js
const { MessageAttachment } = require("discord.js");
const { getChannelId } = require("../commands/welcome/setwelcome.js");
const { welcomeImage } = require("discord-welcome-card");
```

Now in our `module.exports`, we are going to add a `guildMemberAdd`event like this:

```js
client.on("guildMemberAdd", async (member) => {
    
});
```

Inside that, we are first going to get the guild of the newly added member with
`const { guild } = member;` and the welcome channel id of the guild like this:
`const channelId = getChannelId(guild.id);`.

To make sure we are only going to send our welcome message if there is a channel set up, we are going to add the following below that:

```js
if (!channelId) {
      return;
}
```

Now we're going to get the channel by the channelId using `guild.channels.cache`:

```js
const channel = guild.channels.cache.get(channelId);
    if (!channel) {
      return;
}
```

To generate the welcome image we are using [discord-welcome-card](https://npmjs.com/package/discord-welcome-card)(You can use any package you want, our you could send an embed), which has three themes, `dark`, `code` and `circuit`. For the sake of this tutorial, I am going to use the dark theme.
We create the image like this: 

```js
const image = await welcomeImage(member, {
      theme: "dark",
});
```

We still need to convert our image to an attachment so that discord can process it, we do that by creating a new `MessageAttachment`:

```js
const attachment = new MessageAttachment(image, "welcome.png");
```

Now we just need to send the image with

```js
channel.send({ files: [attachment] });
```

Our image should look something like this:

![](https://dxkyy.kill-all.men/5kisXWOu4.png)



### Simulating a join event (OPTIONAL)

---

Generate a new command called `simjoin` using wokgen.

We just need to emit a `guildMemberAdd` event and we're done, our file looks like this:

```js
module.exports = {
  name: "simjoin",
  category: "welcome",
  description: "Simulate a guildMemberAdd event.",
  slash: false,
  ownerOnly: true,
  callback: async ({ message, args, client }) => {
    client.emit("guildMemberAdd", message.member);
    message.reply("Simulated a guild join.");
  },
};

```

Congrats. You now have a fully working welcome message system set up. Hopefully this helped you to make your bot a little bit better :)


