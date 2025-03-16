const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "fbcover",
    aliases: ['fbc'],
    version: "1.0",
    author: "Aryan Chauhan | DEKU API",
    shortDescription: "Create a Facebook Cover using Zetsu API (v1)",
    longDescription: "Generate a Facebook Cover using the Zetsu API v1 with name, subname, email, color, UID, etc.",
    category: "cover",
    guide: {
      en: "Create a Facebook Cover by providing required details separated by (|).\n\nUsage:\n`fbcover name | subname | birthday | address | email | color`\n\nExample:\n`fbcover Mark | Zuckerberg | n/a | USA | zuck@gmail.com | Cyan`"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    try {
      const input = args.join(" ");
      if (!input) {
        return api.sendMessage("ℹ️ | Please provide all required fields: name | subname | birthday | address | email | color", event.threadID);
      }

      let uid = event.senderID;
      if (event.type === 'message_reply') {
        uid = event.messageReply.senderID;
      } else if (Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
      }

      const [name = "Unknown", subname = "User", birthday = "n/a", address = "Unknown", email = "unknown@example.com", color = "Blue"] = input.split("|").map(i => i.trim());

      const waitMsg = await api.sendMessage("🖼️ | Creating your Facebook cover (v1)...", event.threadID);

      const apiUrl = `https://api.zetsu.xyz/canvas/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&sdt=${encodeURIComponent(birthday)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&uid=${uid}&color=${encodeURIComponent(color)}`;

      const response = await axios.get(apiUrl, { responseType: 'stream' });

      const imgPath = path.join(__dirname, `fbcover1_${event.senderID}.png`);
      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on('finish', async () => {
        await api.sendMessage({
          body: "✅ | Here is your Facebook Cover (v1):",
          attachment: fs.createReadStream(imgPath)
        }, event.threadID);

        if (waitMsg.messageID) api.unsendMessage(waitMsg.messageID);
        fs.unlinkSync(imgPath);
      });

      writer.on('error', err => {
        throw err;
      });

    } catch (err) {
      console.error("❌ Error:", err.message || err);
      await api.sendMessage("❌ | Something went wrong while creating your cover. Please try again later.", event.threadID);
    }
  }
};
