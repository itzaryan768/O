const fs = require("fs");
const path = require("path");
const axios = require("axios");

const styleMap = {
  "1": "masterpiece, best quality, very aesthetic, absurdres, cinematic still, emotional, harmonious, vignette, highly detailed, high budget, bokeh, cinemascope, moody, epic, gorgeous, film grain, grainy",
  "2": "masterpiece, best quality, very aesthetic, absurdres, cinematic photo, 35mm photograph, film, bokeh, professional, 4k, highly detailed",
  "3": "masterpiece, best quality, very aesthetic, absurdres, anime artwork, anime style, key visual, vibrant, studio anime, highly detailed",
  "4": "masterpiece, best quality, very aesthetic, absurdres, manga style, vibrant, high-energy, detailed, iconic, Japanese comic style",
  "5": "masterpiece, best quality, very aesthetic, absurdres, concept art, digital artwork, illustrative, painterly, matte painting, highly detailed",
  "6": "masterpiece, best quality, very aesthetic, absurdres, pixel-art, low-res, blocky, pixel art style, 8-bit graphics",
  "7": "masterpiece, best quality, very aesthetic, absurdres, ethereal fantasy concept art, magnificent, celestial, ethereal, painterly, epic, majestic, magical, fantasy art, cover art, dreamy",
  "8": "masterpiece, best quality, very aesthetic, absurdres, neonpunk style, cyberpunk, vaporwave, neon, vibes, vibrant, stunningly beautiful, crisp, detailed, sleek, ultramodern, magenta highlights, dark purple shadows, high contrast, cinematic, ultra detailed, intricate, professional",
  "9": "masterpiece, best quality, very aesthetic, absurdres, professional 3d model, octane render, highly detailed, volumetric, dramatic lighting"
};

module.exports = {
  config: {
    name: "xl",
    aliases: [],
    author: "Team calyx",
    version: "1.2",
    cooldowns: 5,
    role: 0,
    shortDescription: "Generate and select images using styles.",
    longDescription: "Generates images based on a prompt and style, then allows selection.",
    category: "AI",
    guide: "{pn} <prompt> [--ar <ratio>] [--s <style>]"
  },
  onStart: async function ({ message, args, api, event }) {
    try {
      let prompt = "";
      let ratio = "1:1";
      let style = "";

      for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith("--ar=") || args[i].startsWith("--ratio=")) {
          ratio = args[i].split("=")[1];
        } else if ((args[i] === "--ar" || args[i] === "--ratio") && args[i + 1]) {
          ratio = args[i + 1];
          i++;
        } else if (args[i].startsWith("--s=") || args[i].startsWith("--style=")) {
          style = args[i].split("=")[1];
        } else if ((args[i] === "--s" || args[i] === "--style") && args[i + 1]) {
          style = args[i + 1];
          i++;
        } else {
          prompt += args[i] + " ";
        }
      }

      prompt = prompt.trim();
      if (!prompt) return message.reply("❌ | Please provide a prompt.");
      if (style && !styleMap[style]) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(`❌ | Invalid style: ${style}. Please provide a valid style number (1-9).`);
      }

      const startTime = Date.now();
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const styledPrompt = `${prompt}, ${styleMap[style] || ""}`.trim();
      const apiUrl = `http://167.235.13.16:21040/gen?prompt=${encodeURIComponent(styledPrompt)}&ratio=${ratio}`;

      const imageResponses = await axios.get(apiUrl);
      const combinedData = imageResponses.data;

      if (!combinedData.combinedImage || !combinedData.imageUrls) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply("❌ | No images were generated. Please try again.");
      }

      const cacheFolderPath = path.join(__dirname, "/tmp");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const combinedImagePath = path.join(cacheFolderPath, `combined_${Date.now()}.jpg`);
      const combinedImage = await axios({
        url: combinedData.combinedImage,
        method: "GET",
        responseType: "stream"
      });
      const writer = fs.createWriteStream(combinedImagePath);
      combinedImage.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      const imageUrls = Object.values(combinedData.imageUrls);
      const images = await Promise.all(
        imageUrls.map(async (url, index) => {
          const imagePath = path.join(cacheFolderPath, `image_${index + 1}_${Date.now()}.jpg`);
          const response = await axios({
            url,
            method: "GET",
            responseType: "stream"
          });
          const writer = fs.createWriteStream(imagePath);
          response.data.pipe(writer);
          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });
          return imagePath;
        })
      );

      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
      api.setMessageReaction("✅", event.messageID, () => {}, true);

      const reply = await message.reply({
        body: `Select an image by responding with 1 or 2.\n\nTime taken: ${timeTaken} seconds`,
        attachment: fs.createReadStream(combinedImagePath)
      });

      const data = {
        commandName: this.config.name,
        messageID: reply.messageID,
        images,
        combinedImage: combinedImagePath,
        author: event.senderID
      };
      global.GoatBot.onReply.set(reply.messageID, data);

      setTimeout(() => {
        global.GoatBot.onReply.delete(reply.messageID);
        images.forEach((image) => fs.unlinkSync(image));
        fs.unlinkSync(combinedImagePath);
      }, 300000);

    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      console.error("Error:", error.response ? error.response.data : error.message);
    }
  },

  onReply: async function ({ api, event, Reply, message }) {
    try {
      const index = parseInt(event.body.trim());
      if (isNaN(index) || index < 1 || index > 4) {
        return message.reply("❌ | Invalid selection. Please reply with a number between 1 and 2.");
      }

      const selectedImagePath = Reply.images[index - 1];
      await message.reply({
        attachment: fs.createReadStream(selectedImagePath)
      });

    } catch (error) {
      console.error("Error:", error.message);
      message.reply("❌ | Failed to send selected image.");
    }
  }
};
