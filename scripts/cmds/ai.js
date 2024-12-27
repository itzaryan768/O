const axios = require('axios');

module.exports = {
  config: {
    name: 'ai',
    version: '1.0.5',
    author: '©Custom AI', // Don't change credits please 🙏🙂
    role: 0,
    category: 'ai',
    longDescription: {
      en: 'AI is designed to answer user queries and engage in conversations based on user input. It provides responses and insights on a wide range of topics.'
    },
    guide: {
      en: `
      Command: @botname [question]
      - Use this command to ask a question to the AI chatbot.
      - Example: @botname What is the weather like today?

      Reply with "reset" to clear the conversation history.
      `
    }
  },
  onStart: async () => {},
  onChat: async ({ api, event, args, message, usersData }) => {
    // Retrieve bot's name dynamically
    const botName = (await api.getCurrentUser()).name;  // Fetch bot's name dynamically from the API
    
    // Check if the message mentions the bot (case insensitive and with or without '@')
    if (!event.body.toLowerCase().includes(botName.toLowerCase()) && !event.body.includes(botName)) return;

    const question = event.body.replace(new RegExp(`@?${botName}`, 'i'), '').trim();
    if (!question) {
      return message.reply("Hi! How can I assist you today? Please ask a question.");
    }

    const uid = event.senderID;
    const userData = await usersData.get(uid);
    const userName = userData.name || "user";

    // Acknowledge receipt of the question
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get('https://aiiii.vercel.app/ai', {
        params: {
          prompt: question,
          userId: uid,
          name: userName
        }
      });

      if (response.status !== 200 || !response.data) {
        throw new Error('Invalid or missing response from AI API');
      }

      const answer = response.data.response;
      const replyMessage = await message.reply(answer);

      global.GoatBot.onReply.set(replyMessage.messageID, {
        commandName: module.exports.config.name,
        messageID: replyMessage.messageID,
        author: event.senderID
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch (error) {
      console.error(`Error fetching response: ${error.message}`);
      message.reply(`⚠️ Oops! Something went wrong: ${error.message}. Please try again later.`);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  },

  onReply: async ({ api, event, Reply, message, usersData }) => {
    const { author } = Reply;
    const userReply = event.body.trim();
    const userId = event.senderID;
    const userData = await usersData.get(userId);
    const userName = userData.name || "user";

    if (userReply.toLowerCase() === 'reset') {
      try {
        const response = await axios.get('https://aiiii.vercel.app/reset', {
          params: { userId }
        });

        if (response.status !== 200 || !response.data.message) {
          throw new Error('Failed to reset conversation');
        }

        message.reply("✅ The conversation history has been successfully cleared.");
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      } catch (error) {
        console.error(`Error resetting conversation: ${error.message}`);
        message.reply(`⚠️ An error occurred while clearing the conversation history. Error: ${error.message}`);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
      return;
    }

    try {
      const response = await axios.get('https://aiiii.vercel.app/ai', {
        params: {
          prompt: userReply,
          userId: userId,
          name: userName
        }
      });

      if (response.status !== 200 || !response.data) {
        throw new Error('Invalid or missing response from AI API');
      }

      const followUpResponse = response.data.response;
      const followUpMessage = await message.reply(followUpResponse);

      global.GoatBot.onReply.set(followUpMessage.messageID, {
        commandName: module.exports.config.name,
        messageID: followUpMessage.messageID,
        author: event.senderID
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch (error) {
      console.error(`Error fetching follow-up response: ${error.message}`);
      message.reply(`⚠️ Oops! Something went wrong: ${error.message}. Please try again later.`);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
