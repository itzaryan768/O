const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin"],
    version: "1.0",
    author: "ArYAN",
    role: 0,
    countDown: 20,
    longDescription: {
      en: "This command allows you to search for images on Pinterest based on a given query and fetch a specified number of images."
    },
    category: "media",
    guide: {
      en: "{p}pinterest < search query > < number of images >"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const keySearch = args.join(" ");
      
      if (!keySearch.includes("-")) {
        return api.sendMessage(
          "⛔ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗨𝘀𝗲\n━━━━━━━━━━━━━━━\n\nPlease enter the search query and number of images (1-50). Example: {p}pin nezuko -5",
          event.threadID,
          event.messageID
        );
      }

      const keySearchs = keySearch.substr(0, keySearch.indexOf('-')).trim();
      let numberSearch = parseInt(keySearch.split("-").pop().trim()) || 99;

      if (isNaN(numberSearch) || numberSearch < 1 || numberSearch > 99) {
        return api.sendMessage(
          "⛔ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗡𝘂𝗺𝗯𝗲𝗿\n━━━━━━━━━━━━━━━\n\nPlease enter a valid number of images (1-99). Example: {p}pin nezuko -5",
          event.threadID,
          event.messageID
        );
      }

      const apiUrl = `https://aryanchauhanapi2.onrender.com/api/pint?search=${encodeURIComponent(keySearchs)}&count=${numberSearch}`;
      console.log(`Fetching data from API: ${apiUrl}`);
      
      const res = await axios.get(apiUrl);
      const data = res.data.data;

      if (!data || data.length === 0) {
        return api.sendMessage(
          `No results found for your query "${keySearchs}". Please try with a different query.`,
          event.threadID,
          event.messageID
        );
      }

      const imgData = [];
      
      for (let i = 0; i < Math.min(numberSearch, data.length); i++) {
        console.log(`Fetching image ${i + 1} from URL: ${data[i]}`);
        const imgResponse = await axios.get(data[i], { responseType: "arraybuffer" });
        const imgPath = path.join(__dirname, "cache", `${i + 1}.jpg`);
        await fs.outputFile(imgPath, imgResponse.data);
        imgData.push(fs.createReadStream(imgPath));
      }

      await api.sendMessage({
        body: `📸 𝗣𝗶𝗻𝘁𝗲𝗿𝗲𝘀𝘁\n━━━━━━━━━━━━━━━\n\nHere are the top ${numberSearch} results for your query "${keySearchs}"`,
        attachment: imgData,
      }, event.threadID, event.messageID);

      console.log(`Images successfully sent to thread ${event.threadID}`);
      
      await fs.remove(path.join(__dirname, "cache"));
      console.log("Cache directory cleaned up.");
      
    } catch (error) {
      console.error("Error fetching images from Pinterest:", error);
      return api.sendMessage(
        "An error occurred while fetching images. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
