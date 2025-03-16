const axios = require("axios");

module.exports.config = {
  name: "goaturl",
  aliases: ["shorturl"],
  version: "1.2",
  author: "GoatMart",
  countDown: 5,
  role: 0,
  category: "tools",
  description: "Shorten long website links via API",
  usages: "[url] or reply to a message with a URL (http/https/www)",
};

module.exports.onStart = async function ({ api, event, args }) {
  let directUrl = args[0];
  let replyText = event.messageReply?.body?.trim();
  let inputUrl = replyText || directUrl;

  if (inputUrl?.startsWith("www.")) {
    inputUrl = "https://" + inputUrl;
  }

  if (!inputUrl || (!inputUrl.startsWith("http://") && !inputUrl.startsWith("https://"))) {
    return api.sendMessage(
      "❗ Please provide a valid website URL.\nIt must start with `http://`, `https://`, or `www.`",
      event.threadID,
      event.messageID
    );
  }

  try {
    const response = await axios.post("https://goaturl.vercel.app/v1/shorturl", {
      url: inputUrl,
    });

    if (response.data && response.data.shortUrl) {
      return api.sendMessage(`${response.data.shortUrl}`, event.threadID, event.messageID);
    } else {
      return api.sendMessage("❌ Failed to shorten the URL.", event.threadID, event.messageID);
    }
  } catch (err) {
    return api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
  }
};
