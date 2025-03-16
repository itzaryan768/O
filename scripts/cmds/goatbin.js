const axios = require('axios');

module.exports.config = {
  name: "goatbin",
  aliases: ["imgur", "i"],
  version: "3.0",
  author: "GoatMart",
  countDown: 5,
  role: 0,
  category: "tools",
  description: "Upload text or media to get GoatBin link.",
  usages: "Reply to text or media, or type text directly.",
};

module.exports.onStart = async function ({ api, event, args }) {
  const baseApiUrl = "https://gbin.onrender.com/v1";

  const attachments = event.messageReply?.attachments;
  const repliedText = event.messageReply?.body;
  const userText = args.join(" ");

  if (attachments && attachments.length > 0) {
    try {
      const mediaLinks = [];

      for (const attachment of attachments) {
        if (attachment.url) {
          const { data } = await axios.post(`${baseApiUrl}/upload`, { url: attachment.url });
          if (data.link) mediaLinks.push(data.link);
        }
      }

      if (mediaLinks.length > 0) {
        return api.sendMessage(`${mediaLinks.join("\n")}`, event.threadID, event.messageID);
      } else {
        return api.sendMessage("Failed to upload media.", event.threadID, event.messageID);
      }
    } catch (err) {
      return api.sendMessage(`Media Upload Error: ${err.message}`, event.threadID, event.messageID);
    }
  }

  if (repliedText || userText) {
    const textToPaste = repliedText || userText;

    try {
      const response = await axios.post(`${baseApiUrl}/paste`, { code: textToPaste });

      if (response.data && response.data.link) {
        return api.sendMessage(`${response.data.link}`, event.threadID, event.messageID);
      } else {
        return api.sendMessage("Failed to paste the text.", event.threadID, event.messageID);
      }
    } catch (err) {
      return api.sendMessage(`Paste Error: ${err.message}`, event.threadID, event.messageID);
    }
  }

  return api.sendMessage("Please reply to some text or media, or type text directly to paste it to GoatBin.", event.threadID, event.messageID);
};
