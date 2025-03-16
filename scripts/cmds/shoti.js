const axios = require("axios");
const request = require("request");
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

  onStart: async function ({ api, args, message, event }) {
    const videoPath = path.join(__dirname, "/cache/shoti.mp4");
    const apiUrl = "https://shotiiapi.vercel.app/v1/shoti";

    try {
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data || !data.shotiurl) {
        return api.sendMessage("❌ Failed to fetch Shoti video.", event.threadID, event.messageID);
      }

      const { title, shotiurl, username, nickname, duration, region } = data;

      const file = fs.createWriteStream(videoPath);
      request(encodeURI(shotiurl))
        .pipe(file)
        .on("finish", () => {
          const caption = `🎀 𝗦𝗵𝗼𝘁𝗶\n━━━━━━━━━━\n📝 Title: ${title || "No title"}\n👤 Username: ${username}\n💬 Nickname: ${nickname}\n⏳ Duration: ${duration}s\n🌍 Region: ${region}`;
          api.sendMessage({ body: caption, attachment: fs.createReadStream(videoPath) }, event.threadID, () => {
            fs.unlink(videoPath, () => {});
          });
        })
        .on("error", (err) => {
          console.error("Error downloading video:", err);
          api.sendMessage("❌ Error occurred while downloading the video.", event.threadID, event.messageID);
        });

    } catch (err) {
      console.error("API Error:", err);
      api.sendMessage("❌ Error fetching data from API.", event.threadID, event.messageID);
    }
  },
};
