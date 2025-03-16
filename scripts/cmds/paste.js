const axios = require('axios');

module.exports.config = {
  name: "paste",
  version: "1.2",
  author: "GoatMart",
  countDown: 5,
  role: 0,
  category: "tools",
  description: "Paste text from messages or replies and convert it into a shareable link.",
  usages: "Send text or reply to a message to paste.",
};

module.exports.onStart = async function ({ api, event }) {
  try {
    const GOATMART = "https://gbin.onrender.com/v1";
    const replyMessage = event.messageReply?.body?.trim();
    const userText = event.body.trim();

    if (replyMessage) {
      const { data } = await axios.post(`${GOATMART}/paste`, { code: replyMessage });

      if (data.link) {
        return api.sendMessage(
          `${data.link}`,
          event.threadID,
          event.messageID
        );
      } else {
        throw new Error("Failed to generate link from the reply.");
      }
    } else if (userText) {
      const { data } = await axios.post(`${GOATMART}/paste`, { code: userText });

      if (data.link) {
        return api.sendMessage(
          `${data.link}`,
          event.threadID,
          event.messageID
        );
      } else {
        throw new Error("Failed to generate link from the text.");
      }
    } else {
      return api.sendMessage(
        "Please send text or reply to a message to use this command.",
        event.threadID,
        event.messageID
      );
    }
  } catch (err) {
    return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};
