const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "beta",
    aliases: [],
    version: "1.0",
    author: "Team Calyx",
    countDown: 30,
    role: 2,
    shortDescription: "Generate image",
    category: "ai",
    guide: {
      en: "{pn} <prompt> [--ar <ratio>]",
      ar: "{pn} <المطالبة> [--ar <النسبة>]"
    },
  },
  onStart: async function ({ message, event, args, api }) {


    const prompt = args.slice(0, args.indexOf("--ar") > -1 ? args.indexOf("--ar") : args.length).join(" ");
    const ratio = args.includes("--ar") ? args.slice(args.indexOf("--ar") + 1).join("").trim() : "2:3";  
    const url = `http://194.164.125.5:6165/beta?prompt=${encodeURIComponent(prompt)}&ratio=${ratio}`;
    api.setMessageReaction("⏳", event.messageID, () => {}, true);
    try {
      

      const imagePath = path.join(__dirname, "cache", `${Date.now()}.png`);
      const writer = fs.createWriteStream(imagePath);
      const imageResponse = await axios({
        url: url,
        method: 'GET',
        responseType: 'stream'
      });
      imageResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });


const stream = fs.createReadStream(imagePath);      
     message.reply({ attachment: stream }, event.threadID, () => { 
        fs.unlinkSync(imagePath);
        message.unsend(message.messageID);
      }, event.messageID);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
