const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "art",
    version: "1.0",
    author: "Aryan Chauhan | DEKU API",
    shortDescription: "Generate AI Art by prompt",
    longDescription: "Use the Zetsu AI Art API to generate images based on your custom text prompt.",
    category: "ai",
    guide: {
      en: "Generate art using an AI prompt.\n\nUsage:\n`art <your prompt>`\n\nExample:\n`art futuristic robot in a city`"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    try {
      const prompt = args.join(" ");
      if (!prompt) {
        return api.sendMessage("ℹ️ | Please provide a prompt. Example:\n`art dog playing guitar in space`", event.threadID);
      }

      const loadingMsg = await api.sendMessage(`🎨 | Generating AI Art for:\n"${prompt}"`, event.threadID);

      // API Request
      const response = await axios.get(`https://api.zetsu.xyz/api/art?prompt=${encodeURIComponent(prompt)}`, {
        responseType: 'stream'
      });

      const filePath = path.join(__dirname, `ai_art_${event.senderID}.png`);
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', async () => {
        await api.sendMessage({
          body: `✅ | Here's your AI-generated art:\nPrompt: "${prompt}"`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID);

        if (loadingMsg.messageID) api.unsendMessage(loadingMsg.messageID);
        fs.unlinkSync(filePath);
      });

      writer.on('error', err => {
        throw err;
      });

    } catch (err) {
      console.error("❌ Error:", err.message || err);
      await api.sendMessage("❌ | Failed to generate art. Please try again later.", event.threadID);
    }
  }
};
