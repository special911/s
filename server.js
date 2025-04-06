const express = require('express');
const app = express();
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

app.get("/", (req, res) => {
  res.send("Bot is alive!");
});

app.listen(3000, () => {
  console.log("Web server is running...");
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", message => {
  if (message.content === "!ping") {
    message.reply("Pong!");
  }
});

client.login(process.env.TOKEN);
