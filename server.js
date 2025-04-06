const express = require('express');
const app = express();
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
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
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async message => {
  if (message.author.bot) return;

  if (message.content.startsWith("!طرد")) {
    const member = message.mentions.members.first();
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply("❌ ما عندك صلاحية طرد.");
    if (!member) return message.reply("❌ منو تبيني أطرده؟");
    member.kick().then(() => message.reply("✅ تم طرد العضو."))
      .catch(() => message.reply("❌ ما قدرت أطرده."));
  }

  if (message.content.startsWith("!باند")) {
    const member = message.mentions.members.first();
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("❌ ما عندك صلاحية باند.");
    if (!member) return message.reply("❌ منو تبيني أسوي له باند؟");
    member.ban().then(() => message.reply("✅ تم حظر العضو."))
      .catch(() => message.reply("❌ ما قدرت أسوي له باند."));
  }

  if (message.content.startsWith("!مسح ")) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply("❌ ما عندك صلاحية المسح.");
    const args = message.content.split(" ");
    const count = parseInt(args[1]);
    if (isNaN(count) || count < 1 || count > 100) {
      return message.reply("❌ اكتب رقم بين 1 و 100.");
    }
    message.channel.bulkDelete(count, true)
      .then(() => message.channel.send(`✅ تم مسح ${count} رسالة.`)
        .then(msg => setTimeout(() => msg.delete(), 3000)));
  }

  if (message.content === "!مسح_الكل") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply("❌ ما عندك صلاحية المسح.");
    message.channel.bulkDelete(100, true)
      .then(() => message.channel.send("✅ تم مسح آخر 100 رسالة.")
        .then(msg => setTimeout(() => msg.delete(), 3000)));
  }

  if (message.content.startsWith("!اعطاء")) {
    const args = message.content.split(" ");
    const member = message.mentions.members.first();
    const roleName = args.slice(2).join(" ");
    const role = message.guild.roles.cache.find(r => r.name === roleName);
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles))
      return message.reply("❌ ما عندك صلاحية تعديل الرتب.");
    if (!member || !role) return message.reply("❌ تأكد من كتابة الأمر بشكل صحيح.");
    member.roles.add(role)
      .then(() => message.reply(`✅ تم إعطاء ${role.name} لـ ${member.user.username}`))
      .catch(() => message.reply("❌ ما قدرت أعطي الرتبة."));
  }

  if (message.content === "!معلوماتي") {
    message.reply(`📌 اسمك: ${message.author.username}
🆔 ID: ${message.author.id}`);
  }

  if (message.content === "!معلومات_السيرفر") {
    message.reply(`📁 اسم السيرفر: ${message.guild.name}
👥 عدد الأعضاء: ${message.guild.memberCount}`);
  }

  if (message.content.startsWith("!قول ")) {
    const msg = message.content.slice(5);
    if (msg) message.channel.send(msg);
  }

  if (message.content === "!الاوامر") {
    message.reply("🧾 الأوامر:
!طرد @عضو
!باند @عضو
!مسح [عدد]
!مسح_الكل
!اعطاء @عضو رتبة
!معلوماتي
!معلومات_السيرفر
!قول كلام
!تيكت
!اغلاق");
  }

  if (message.content === "!تيكت") {
    const existing = message.guild.channels.cache.find(c => c.name === `ticket-${message.author.username}`);
    if (existing) return message.reply("❗ عندك تيكت مفتوح بالفعل.");
    message.guild.channels.create({
      name: `ticket-${message.author.username}`,
      type: 0,
      permissionOverwrites: [
        {
          id: message.guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: message.author.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        },
        {
          id: message.guild.ownerId,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        }
      ]
    }).then(channel => {
      channel.send(`مرحباً ${message.author}, تم فتح تيكت لك. اكتب مشكلتك هنا.
اكتب !اغلاق لإغلاق التيكت.`);
      message.reply("✅ تم إنشاء التيكت.");
    });
  }

  if (message.content === "!اغلاق") {
    if (message.channel.name.startsWith("ticket-")) {
      message.channel.send("❌ تم إغلاق التيكت.").then(() => {
        setTimeout(() => {
          message.channel.delete();
        }, 3000);
      });
    }
  }
});

client.login(process.env.TOKEN);
