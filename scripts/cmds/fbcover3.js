const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "fbcover3",
    aliases: ['fbc3'],
    version: "2.2",
    author: "Aryan Chauhan | DEKU API",
    shortDescription: "Create a custom Facebook Cover photo",
    longDescription: "Generate a Facebook Cover photo using the Zetsu API with custom details.",
    category: "media",
    guide: {
      en: "Create a custom Facebook cover photo by providing specific information separated by dashes (|).\n\nUsage:\n`fbcover3 birthday | love | location | hometown | name | followers | gender`\n\nExample:\n`fbcover3 May 14, 1984 | Priscilla Chan | USA | California | Mark Zuckerberg | 119000000 | male`"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    try {
      const info = args.join(" ");
      if (!info) {
        return api.sendMessage("ℹ️ | Please provide all required fields: birthday | love | location | hometown | name | followers | gender.", event.threadID);
      }

      let uid = event.senderID;
      if (event.type === 'message_reply') {
        uid = event.messageReply.senderID;
      } else if (Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
      }

      const [birthday = "N/A", love = "N/A", location = "N/A", hometown = "N/A", name = "N/A", followers = "N/A", gender = "N/A"] = info.split("|").map(item => item.trim());

      const loading = await api.sendMessage("🖼️ | Creating your Facebook cover...", event.threadID);

      const apiUrl = `https://api.zetsu.xyz/canvas/fbcoverv3?uid=${uid}&birthday=${encodeURIComponent(birthday)}&love=${encodeURIComponent(love)}&location=${encodeURIComponent(location)}&hometown=${encodeURIComponent(hometown)}&name=${encodeURIComponent(name)}&follow=${encodeURIComponent(followers)}&gender=${encodeURIComponent(gender)}`;

      const res = await axios.get(apiUrl, { responseType: 'stream' });

      const tempPath = path.join(__dirname, `fbcover_${event.senderID}.png`);
      const writer = fs.createWriteStream(tempPath);
      res.data.pipe(writer);

      writer.on('finish', async () => {
        await api.sendMessage({
          body: "✅ | Here is your customized Facebook Cover:",
          attachment: fs.createReadStream(tempPath)
        }, event.threadID);

        if (loading.messageID) api.unsendMessage(loading.messageID);
        fs.unlinkSync(tempPath);
      });

      writer.on('error', (err) => {
        throw err;
      });

    } catch (err) {
      console.error("❌ Error:", err.message || err);
      await api.sendMessage("❌ | Something went wrong while generating your Facebook cover. Try again later.", event.threadID);
    }
  }
};
