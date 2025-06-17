const axios = require('axios');

const validUrl = require('valid-url');


module.exports = {

  config: {

    name: 'orochi',

    aliases: ['chi'],

    version: '3.3.0',

    author: 'Orochi AI',

    role: 0,

    category: 'ai',

    longDescription: {

      en: 'Orochi AI: Smart chatbot with vision and memory, powered by your Orochi AI API. Supports both text and image replies, and can interpret quoted messages.'

    },

    guide: {

      en: `

Command: .orochi [your message]

- You can also reply to an image or someone's message with your question.

- Supports text and image input.

- Anyone can reply to the bot's messages to continue the chat.


Examples:

.orochi Describe this image

(Reply to an image or message with that)

      `

    }

  },


  onStart: async ({ api, event, args, message }) => {

    const uid = event.senderID;

    let query = args.join(' ').trim();

    let finalMessage = query;

    let image_url = null;


    api.setMessageReaction("⏰", event.messageID, () => {}, true);


    if (event.messageReply) {

      const repliedText = event.messageReply.body || '';

      if (repliedText) {

        finalMessage = `${query}\n\nQuoted message:\n"${repliedText}"`;

      }


      const attachment = event.messageReply.attachments?.[0];

      if (attachment && attachment.type === 'photo') {

        image_url = attachment.url;

      }

    }


    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const urlMatch = query.match(urlRegex);

    if (urlMatch && validUrl.isWebUri(urlMatch[0])) {

      image_url = urlMatch[0];

      finalMessage = finalMessage.replace(image_url, '').trim();

    }


    if (!finalMessage && !image_url) {

      message.reply("🤖 Please provide a message or reply to an image or text.");

      api.setMessageReaction("❌", event.messageID, () => {}, true);

      return;

    }


    try {

      const response = await axios.post('https://orochiai.vercel.app/chat', {

        uid,

        message: finalMessage,

        image_url

      }, { timeout: 30000 });


      const botReply = response.data.reply;

      const imageResponse = response.data.image_url;


      const replyMsg = { body: botReply };

      if (imageResponse) {

        const imageBuffer = (await axios.get(imageResponse, { responseType: 'arraybuffer' })).data;

        replyMsg.attachment = [Buffer.from(imageBuffer)];

      }


      const replyMessage = await message.reply(replyMsg);


      global.GoatBot.onReply.set(replyMessage.messageID, {

        commandName: module.exports.config.name,

        messageID: replyMessage.messageID,

        author: uid

      });


      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {

      console.error('Orochi AI Error:', error?.response?.data || error.message);

      message.reply("⚠ Orochi AI server error. Please try again later.");

      api.setMessageReaction("❌", event.messageID, () => {}, true);

    }

  },


  onReply: async ({ api, event, Reply, message }) => {

    const uid = event.senderID;

    const userMessage = event.body?.trim() || '';

    let finalMessage = userMessage;

    let image_url = null;


    api.setMessageReaction("⏰", event.messageID, () => {}, true);


    if (event.messageReply) {

      const quoted = event.messageReply.body || '';

      if (quoted) {

        finalMessage = `${userMessage}\n\nQuoted message:\n"${quoted}"`;

      }


      const attachment = event.messageReply.attachments?.[0];

      if (attachment && attachment.type === 'photo') {

        image_url = attachment.url;

      }

    }


    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const urlMatch = userMessage.match(urlRegex);

    if (urlMatch && validUrl.isWebUri(urlMatch[0])) {

      image_url = urlMatch[0];

      finalMessage = finalMessage.replace(image_url, '').trim();

    }


    if (!finalMessage && !image_url) {

      message.reply("🤖 Please provide a message or image.");

      api.setMessageReaction("❌", event.messageID, () => {}, true);

      return;

    }


    try {

      const response = await axios.post('https://orochiai.vercel.app/chat', {

        uid,

        message: finalMessage,

        image_url

      }, { timeout: 30000 });


      const botReply = response.data.reply;

      const imageResponse = response.data.image_url;


      const replyMsg = { body: botReply };

      if (imageResponse) {

        const imageBuffer = (await axios.get(imageResponse, { responseType: 'arraybuffer' })).data;

        replyMsg.attachment = [Buffer.from(imageBuffer)];

      }


      const replyMessage = await message.reply(replyMsg);


      global.GoatBot.onReply.set(replyMessage.messageID, {

        commandName: module.exports.config.name,

        messageID: replyMessage.messageID,

        author: uid

      });


      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {

      console.error('Orochi AI Reply Error:', error?.response?.data || error.message);

      message.reply("⚠ Error processing your reply. Please try again later.");

      api.setMessageReaction("❌", event.messageID, () => {}, true);

    }

  }

};