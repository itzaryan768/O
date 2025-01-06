const axios = require('axios');

const Prefixes = [
 'ai',
'.ai',
'orochi',
 '.orochi',
 '.chi',
];

module.exports = {
 config: {
 name: 'orochi',
 aliases: ["chi"],
 version: '1.0.6',
 author: 'Aryan Chauhan', 
 role: 0,
 category: 'ai',
 },
 onStart: async () => {},
 onChat: async ({ api, event, args, message }) => {
 const prefix = Prefixes.find(p => event.body.trim().toLowerCase().startsWith(p.toLowerCase()));
 if (!prefix) return;

 const question = event.body.slice(prefix.length).trim();
 if (!question) {
 return message.reply("Hello! How can I assist you today?");
 }

 api.setMessageReaction("⏰", event.messageID, () => {}, true);

 try {
 const response = await axios.get('https://aryanchauhanapi2.onrender.com/gpt', {
 params: { prompt: question }
 });

 if (response.status !== 200 || !response.data.answer) {
 throw new Error('Invalid or missing response from API');
 }

 const answer = response.data.answer;
 message.reply(`${answer}`);
 api.setMessageReaction("✅", event.messageID, () => {}, true);

 } catch (error) {
 console.error(`Error fetching response: ${error.message}`);
 message.reply(`⚠ An error occurred: ${error.message}. Please try again later.`);
 api.setMessageReaction("❌", event.messageID, () => {}, true);
 }
 }
};
