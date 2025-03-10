const fs = require('fs');

module.exports = {
 config: {
 name: "spam",
 version: "3.0",
 author: "ArYAN",
 countDown: 0,
 role: 2,
 category: "utility",
 guide: {
 en: "{p}spam <uid|tid|me> <count> <msg|msg1|msg2|...|file> [delay (ms)]"
 }
 },

 onStart: async function ({ api, args, event }) {
 const senderID = event.senderID;

 const targetID = args[0] === "me" ? senderID : args[0];
 const count = parseInt(args[1]);
 const delay = parseInt(args[args.length - 1]) || 1000;
 const msgArg = args.slice(2, args.length - (isNaN(args[args.length - 1]) ? 0 : 1)).join(" ");

 if (!targetID || isNaN(count)) {
 return api.sendMessage("⚠ Usage:\nspam <uid|tid|me> <count> <message or msg1|msg2|...|file> [delay(ms)]", event.threadID);
 }

 let messages = [];

 if (msgArg.toLowerCase() === "file") {
 try {
 messages = JSON.parse(fs.readFileSync(__dirname + '/spam.json', 'utf-8'));
 } catch (e) {
 return api.sendMessage("❌ Failed to load spam.json file.", event.threadID);
 }
 } else {
 messages = msgArg.split("|").map(m => m.trim());
 }

 api.sendMessage(
 `✅ Spam starting to ${targetID}\nCount: ${count}\nDelay: ${delay}ms\nMessage source: ${msgArg.toLowerCase() === "file" ? "spam.json" : "inline"}`,
 event.threadID
 );

 for (let i = 0; i < count; i++) {
 setTimeout(() => {
 const msg = messages[Math.floor(Math.random() * messages.length)];
 const taggedMsg = {
 body: `${msg} [${i + 1}/${count}]`,
 mentions: [{ tag: "User", id: targetID }]
 };
 api.sendMessage(taggedMsg, targetID);
 }, i * delay);
 }
 }
};