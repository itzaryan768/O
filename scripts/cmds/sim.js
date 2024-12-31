const axios = require("axios");

module.exports = {
 config: {
   name: 'sim',
   version: '1.5',
   author: 'NIB | JARiF',
   countDown: 5,
   role: 0,
   shortDescription: 'Sakura Ai',
   longDescription: {
     vi: 'Chat với Sakura ♡',
     en: 'Chat with Sakura ♡'
   },
   category: 'ai',
   guide: {
     vi: ' {pn} [on | off]: bật/tắt Sakura ♡\n'
       + '{pn} <word>: chat nhanh với Sakura ♡\n'
       + 'Ví dụ:\n{pn} hi',
     en: ' {pn} [on | off]: turn on/off Sakura ♡\n'
       + '{pn} <word>: chat quickly with Sakura ♡\n'
       + 'Example:\n{pn} hi'
   }
 },
 langs: {
   vi: {
     turnedOn: 'Bật Sakura thành công!',
     turnedOff: 'Tắt Sakura thành công!',
     chatting: 'Đang chat với Sakura...',
     error: 'Sakura đang bận, bạn hãy thử lại sau.'
   },
   en: {
     turnedOn: 'Turned on Sakura ♡ successfully!',
     turnedOff: 'Turned off Sakura ♡ successfully!',
     chatting: 'Already chatting with Sakura ♡...',
     error: 'Sakura is busy, please try again later.'
   }
 },
 onStart: async function ({ args, threadsData, message, event, getLang }) {
   if (args[0] === 'on' || args[0] === 'off') {
     await threadsData.set(event.threadID, args[0] === 'on', "settings.simsimi");
     return message.reply(args[0] === 'on' ? getLang("turnedOn") : getLang("turnedOff"));
   } else {
     const userMessage = args.join(" ") || "hi"; 
     try {
       const responseMessage = await getMessage(userMessage, 'en');
       return message.reply(responseMessage);
     } catch (err) {
       console.error(err);
       return message.reply(getLang("error"));
     }
   }
 },
 onChat: async function ({ args, message, threadsData, event, isUserCallCommand, getLang }) {
   if (args.length > 1 && !isUserCallCommand && await threadsData.get(event.threadID, "settings.simsimi")) {
     try {
       const langCode = await threadsData.get(event.threadID, "settings.lang") || 'en';
       const responseMessage = await getMessage(args.join(" "), langCode);
       return message.reply(responseMessage);
     } catch (err) {
       console.error(err);
       return message.reply(getLang("error"));
     }
   }
 }
};

async function getMessage(prompt = "hi", lang = "en") { 
 try {
   const res = await axios.get('https://aryanchauhanapi2.onrender.com/sim', {
     params: {
       prompt,
       lang
     }
   });

   if (res.status !== 200 || !res.data.answer) {
     throw new Error('Invalid response from API');
   }

   return res.data.answer;
 } catch (err) {
   console.error(`API Error: ${err.message}`);
   throw new Error('Failed to fetch response from Sakura AI.');
 }
}
