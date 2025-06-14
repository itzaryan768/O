const axios = require('axios');

module.exports = {
  config: {
    name: 'orochi',
    aliases: ['chi'],
    version: '2.0.0',
    author: 'Aryan Chauhan',
    role: 0,
    category: 'ai',
    longDescription: {
      en: 'Orochi AI: Smart chatbot with conversation memory, powered by your Llama 3 API.'
    },
    guide: {
      en: `
      Command: .orochi [your question]
      Example: .orochi What is the capital of India?
      Orochi AI will remember the full conversation context and reply intelligently.
      `
    }
  },

  onStart: async ({ api, event, args, message }) => {
    const query = args.join(' ').trim();
    const uid = event.senderID;

    api.setMessageReaction("⏰", event.messageID, () => {}, true);

    if (!query) {
      message.reply("🤖 𝗢𝗿𝗼𝗰𝗵𝗶\n\nHello! How can I assist you today?");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return;
    }

    try {
      const response = await axios.post('https://orochiai.vercel.app/api/chat', {
        uid,
        message: query
      }, {
        timeout: 30000
      });

      if (response.status !== 200 || !response.data) {
        throw new Error('Invalid response from AI server');
      }

      const answer = response.data.answer;
      const replyMessage = await message.reply(`🤖 𝗢𝗿𝗼𝗰𝗵𝗶\n\n${answer}`);

      global.GoatBot.onReply.set(replyMessage.messageID, {
        commandName: module.exports.config.name,
        messageID: replyMessage.messageID,
        author: event.senderID
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      console.error('Error:', error.message);
      message.reply("⚠ Orochi AI server is currently unavailable. Please try again later.\n\nVisit: https://orochiai.vercel.app");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  },

  onReply: async ({ api, event, Reply, message }) => {
    const { author } = Reply;
    const userReply = event.body.trim();
    const uid = event.senderID;

    api.setMessageReaction("⏰", event.messageID, () => {}, true);

    if (!userReply) {
      message.reply("🤖 𝗢𝗿𝗼𝗰𝗵𝗶\n\nPlease provide a message for me to continue.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return;
    }

    try {
      const response = await axios.post('https://orochiai.vercel.app/api/chat', {
        uid,
        message: userReply
      }, {
        timeout: 30000
      });

      if (response.status !== 200 || !response.data) {
        throw new Error('Invalid response from AI server');
      }

      const followUp = response.data.answer;
      const followUpMessage = await message.reply(`🤖 𝗢𝗿𝗼𝗰𝗵𝗶\n\n${followUp}`);

      global.GoatBot.onReply.set(followUpMessage.messageID, {
        commandName: module.exports.config.name,
        messageID: followUpMessage.messageID,
        author: event.senderID
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      console.error('Error:', error.message);
      message.reply("⚠ Error processing your reply. Please try again later.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
