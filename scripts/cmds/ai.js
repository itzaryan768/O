const axios = require('axios');

module.exports = {
  config: {
    name: 'ai',
    version: '1.0.1',
    author: 'GoatMart',
    role: 0,
    category: 'ai',
    shortDescription: {
      en: 'Simple AI chat using llama3-8b'
    },
    guide: {
      en: 'Type "ai [your message]" to chat with AI.'
    }
  },

  onStart: async () => {},

  onChat: async ({ api, event, args, message }) => {
    const input = args.join(" ").trim();

    if (!event.body.toLowerCase().startsWith("ai")) return;

    if (!input || input.toLowerCase() === "ai") {
      return message.reply("Please ask something. Example: ai what is the capital of India?");
    }

    const prompt = input.replace(/^ai\s*/i, "");

    api.setMessageReaction("⏰", event.messageID, () => {}, true);

    try {
      const res = await axios.get(`https://aryanchauhanapi2.onrender.com/api/llama3-8b`, {
        params: { prompt }
      });

      if (!res.data || !res.data.answer) {
        throw new Error("Invalid response from API.");
      }

      message.reply(res.data.answer);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch (err) {
      console.error("AI Error:", err.message);
      message.reply("⚠ An error occurred while processing your request.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
