const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "qr",
  version: "2.0",
  author: "GoatMart",
  countDown: 5,
  role: 0,
  category: "tools",
  description: "Generate QR code from text and get image + link",
  usages: "[reply text] or [your text directly]",
};

module.exports.onStart = async function ({ api, event, args }) {
  const userText = args.join(" ");
  const repliedText = event.messageReply?.body;
  const finalText = repliedText || userText;

  if (!finalText) {
    return api.sendMessage("❗ Please reply to text or type text to generate QR code.", event.threadID, event.messageID);
  }

  const apiUrl = "https://goatqrapi.onrender.com/api/generate"; 

  try {
    const { data } = await axios.post(apiUrl, { text: finalText });

    if (!data || !data.imageUrl) {
      return api.sendMessage("❌ QR generation failed: No image URL received.", event.threadID, event.messageID);
    }

    const imageUrl = data.imageUrl;

    const qrImage = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const tempPath = path.join(__dirname, `qr_${Date.now()}.png`);
    fs.writeFileSync(tempPath, Buffer.from(qrImage.data, "binary"));

    api.sendMessage(
      {
        body: `✅ QR Code Generated!\n\nImage URL:\n${imageUrl}`,
        attachment: fs.createReadStream(tempPath),
      },
      event.threadID,
      () => fs.unlinkSync(tempPath),
      event.messageID
    );
  } catch (err) {
    return api.sendMessage(`❌ Failed to generate QR code:\n${err.message}`, event.threadID, event.messageID);
  }
};
