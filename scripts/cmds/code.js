const axios = require("axios");

module.exports = {
  config: {
    name: "code",
    version: "6.0",
    author: "GoatMart",
    role: 0,
    countDown: 5,
    shortDescription: "Get JS code from URL",
    longDescription: {
      en: "Fetch JavaScript code from a URL (from args, reply, or auto-detect in message text) and show it."
    },
    category: "tools",
    guide: {
      en: "{p}code <url>\nOr reply to a message with a link\nOr type a message with a URL inside it (even mixed)."
    }
  },

  onStart: async function ({ api, event, args }) {
    let url;

    if (args[0]) url = args[0];

    if (!url && event.messageReply?.body) {
      const match = event.messageReply.body.match(/https?:\/\/[^\s]+|www\.[^\s]+/i);
      if (match) url = match[0];
    }

    if (!url && event.body) {
      const match = event.body.match(/https?:\/\/[^\s]+|www\.[^\s]+/i);
      if (match) url = match[0];
    }

    if (!url) return api.sendMessage("❌ No valid URL found in arguments, reply, or message text.", event.threadID, event.messageID);

    if (!/^https?:\/\//i.test(url)) url = "https://" + url;

    try {
      const res = await axios.get(url);
      let code = res.data;

      if (typeof code !== "string") code = JSON.stringify(code, null, 2);
      if (!code.trim()) return api.sendMessage("⚠️ The fetched code is empty.", event.threadID, event.messageID);

      if (code.length > 20000) {
        return api.sendMessage("⚠️ The code is too large to send in one message. Please use a link sharing service (e.g., Pastebin, GitHub).", event.threadID, event.messageID);
      }

      api.sendMessage(`${code}`, event.threadID, event.messageID);
    } catch (e) {
      api.sendMessage(`❌ Failed to fetch code:\n${e.message}`, event.threadID, event.messageID);
    }
  }
};
