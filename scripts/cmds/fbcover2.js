const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "fbcover2",
    aliases: ['fbc2'],
    version: "1.0",
    author: "Aryan Chauhan | DEKU API",
    shortDescription: "Create a Facebook Cover (v2) using Zetsu API",
    longDescription: "Generate a Facebook Cover using the Zetsu API v2 with customizable name, subname, color and random ID support.",
    category: "media",
    guide: {
      en: "Create a Facebook Cover V2 by providing details separated by |.\n\nUsage:\n`fbcover2 name | subname | color [| id (optional)]`\n\nExample:\n`fbcover2 Mark Zuckerberg | Sy | Red`\nOR\n`fbcover2 Mark Zuckerberg | Sy | Red | 5`"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    try {
      const input = args.join(" ");
      if (!input) {
        return api.sendMessage("ℹ️ | Please provide: name | subname | color [| id (optional)]", event.threadID);
      }

      const [name = "Unknown", subname = "User", color = "Blue", idInput] = input.split("|").map(i => i.trim());
      const id = idInput ? parseInt(idInput) : Math.floor(Math.random() * 20) + 1;

      const waitMsg = await api.sendMessage("🖼️ | Generating your Facebook Cover V2...", event.threadID);

      const apiUrl = `https://api.zetsu.xyz/canvas/fbcoverv2?name=${encodeURIComponent(name)}&id=${id}&subname=${encodeURIComponent(subname)}&color=${encodeURIComponent(color)}`;

      const response = await axios.get(apiUrl, { responseType: 'stream' });

      const filePath = path.join(__dirname, `fbcover2_${event.senderID}.png`);
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', async () => {
        await api.sendMessage({
          body: `✅ | Here is your Facebook Cover V2 (ID: ${id}):`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID);

        if (waitMsg.messageID) api.unsendMessage(waitMsg.messageID);
        fs.unlinkSync(filePath);
      });

      writer.on('error', err => {
        throw err;
      });

    } catch (err) {
      console.error("❌ Error:", err.message || err);
      await api.sendMessage("❌ | Failed to create cover. Try again later.", event.threadID);
    }
  }
};
