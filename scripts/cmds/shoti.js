const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "shoti",
    version: "1.1",
    author: "GoatMart",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Fetch Shoti video",
    },
    longDescription: {
      en: "Fetches a Shoti video and sends it to the chat.",
    },
    category: "media",
    guide: {
      en: "Use this command to fetch and share a Shoti video.",
    },
  },

  onStart: async function ({ api, event }) {
    const videoPath = path.join(__dirname, "cache", "shoti.mp4");
    const apiUrl = "https://shotiiapi.vercel.app/v1/shoti";

    try {
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data || !data.shotiurl) {
        return api.sendMessage("❌ Failed to fetch Shoti video.", event.threadID, event.messageID);
      }

      const { title, shotiurl, username, nickname, duration, region } = data;

      const response = await axios({
        method: "GET",
        url: shotiurl,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(videoPath);

      response.data.pipe(writer);

      writer.on("finish", () => {
        const caption = `🎀 𝗦𝗵𝗼𝘁𝗶\n━━━━━━━━━━\n📝 Title: ${title || "No title"}\n👤 Username: ${username}\n💬 Nickname: ${nickname}\n⏳ Duration: ${duration}s\n🌍 Region: ${region}`;
        api.sendMessage({ body: caption, attachment: fs.createReadStream(videoPath) }, event.threadID, () => {
          fs.unlink(videoPath, () => {});
        });
      });

      writer.on("error", (err) => {
        console.error("Error writing video file:", err);
        api.sendMessage("❌ Error saving the video file.", event.threadID, event.messageID);
      });

    } catch (err) {
      console.error("Error:", err.message || err);
      api.sendMessage("❌ Error fetching Shoti video.", event.threadID, event.messageID);
    }
  },
};
