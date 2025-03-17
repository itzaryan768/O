const axios = require('axios');

const personalities = [
  'lover',
  'helpful', 
  'friendly',
  'toxic',
  'bisaya',
  'horny',
  'tagalog',
  'makima',
  'godmode',
  'default'
];

const Prefixes = [
  'ai'
];

module.exports = {
  config: {
    name: 'ai',
    version: '2.0.0',
    author: 'GoatMart',
    role: 0,
    category: 'ai',
    longDescription: {
      en: 'Advanced AI assistant with multiple personalities and conversation memory'
    },
    guide: {
      en: `
      Commands:
      - ai [question] : Ask the AI a question
      - ai name [your_name] : Set your name
      - ai model [1-10] : Change AI personality
      - ai set [personality] : Set specific personality
      - ai clear : Reset conversation memory
      `
    }
  },

  onStart: async () => {},

  onChat: async ({ api, event, args, message, usersData }) => {
    const prefix = Prefixes.find(p => event.body.toLowerCase().startsWith(p));
    if (!prefix) return;

    const input = event.body.slice(prefix.length).trim();
    const uid = event.senderID;
    const userData = await usersData.get(uid);
    const userName = userData.name || "friend";

    api.setMessageReaction("⏰", event.messageID, () => {}, true);

    try {
      const response = await axios.get(`https://70c691dd-7002-4170-aad7-7c9ec3c16e2d-00-2anehaix2izb5.pike.repl.co/g`, {
        params: {
          prompt: input || 'ai_response',
          conversation_id: uid,
          username: userName
        }
      });

      if (!response.data || !response.data.ai_response) {
        throw new Error('Invalid API response');
      }

      if (!input || input.toLowerCase() === 'help') {
        const helpMessage = `Hello ${userName}! 👋

Choose your assistant:
1. lover 
2. helpful 
3. friendly 
4. toxic 
5. bisaya 
6. horny 
7. tagalog 
8. makima 
9. godmode 
10. default 

• ai set [personality] : Change personality directly
• ai nsfw [on/off] : Toggle NSFW mode
• ai clear : Reset conversation

Example: "ai set lover" `;

        const replyMessage = await message.reply(helpMessage);
        global.GoatBot.onReply.set(replyMessage.messageID, {
          commandName: 'ai',
          messageID: replyMessage.messageID,
          author: event.senderID
        });
        return;
      }

      if (input.toLowerCase().startsWith('set ')) {
        const personality = input.toLowerCase().split(' ')[1];
        if (personalities.includes(personality)) {
          await axios.get(`https://aiiii-topaz.vercel.app/g`, {
            params: { 
              prompt: `ai set ${personality}`,
              conversation_id: uid,
              username: userName
            }
          });
          message.reply(`✨ Personality changed to: ${personality}`);
          return;
        }
      }

      const replyMessage = await message.reply(response.data.ai_response);
      global.GoatBot.onReply.set(replyMessage.messageID, {
        commandName: 'ai',
        messageID: replyMessage.messageID,
        author: event.senderID
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      console.error(`AI Error: ${error.message}`);
      message.reply("⚠ An error occurred. Please try again later.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  },

  onReply: async ({ api, event, Reply, message, usersData }) => {
    const { author } = Reply;
    const uid = event.senderID;
    const userData = await usersData.get(uid);
    const userName = userData.name || "friend";

    if (event.body.toLowerCase() === 'clear') {
      try {
        await axios.get(`https://aiiii-topaz.vercel.app/clear`, {
          params: { conversation_id: uid }
        });
        message.reply("✅ Conversation memory cleared!");
        api.setMessageReaction("✅", event.messageID, () => {}, true);
        return;
      } catch (error) {
        message.reply("⚠ Failed to clear memory. Please try again.");
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return;
      }
    }

    api.setMessageReaction("⏰", event.messageID, () => {}, true);

    try {
      const response = await axios.get(`https://aiiii-topaz.vercel.app/g`, {
        params: {
          prompt: event.body,
          conversation_id: uid,
          username: userName
        }
      });

      if (!response.data || !response.data.ai_response) {
        throw new Error('Invalid API response');
      }

      const replyMessage = await message.reply(response.data.ai_response);
      global.GoatBot.onReply.set(replyMessage.messageID, {
        commandName: 'ai',
        messageID: replyMessage.messageID,
        author: event.senderID
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      console.error(`AI Error: ${error.message}`);
      message.reply("⚠ An error occurred. Please try again later.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
