const axios = require("axios");

module.exports = {
 config: {
 name: "lyrics",
 version: "1.0",
 author: "Team Calyx",
 countDown: 5,
 role: 0,
 description: {
 en: "This command allows you to get the lyrics for a song. Usage: !lyrics <song name>",
 ar:"يسمح لك هذا الأمر بالحصول على كلمات أغنية. الاستخدام: !كلمات <اسم الأغنية>",
 },
 category: "𝗠𝗘𝗗𝗜𝗔",
 guide: {
 en: "{prefix}lyrics <song name>",
 ar: "{prefix}كلمات <اسم الاغنية>",
 },
 },

 onStart: async function ({ api, event, args }) {
 const songName = args.join(" ");
 if (!songName) {
 api.sendMessage("Please provide a song name!", event.threadID, event.messageID);
 return;
 }

 try{
 const apiUrl2 = await getApiUrl();
 if(!apiUrl2){
 return api.sendMessage("❌ | Failed to fetch API URL.", event.threadID, event.messageID)
 }
 const apiUrl = `${apiUrl2}/lyrics?name=${encodeURIComponent(songName)}`;

 const response = await axios.get(apiUrl);
 const { lyrics, title, artist } = response.data;

 if (!lyrics) {
 api.sendMessage(`Sorry, lyrics for "${title}" by ${artist} not found!`, event.threadID, event.messageID);
 } else {
 const formattedLyrics = `🎧 | Title: ${title}\n🎤 | Artist: ${artist}\n\n${lyrics}`;
 api.sendMessage(formattedLyrics, event.threadID, event.messageID);
 }
 } catch (error) {
 console.error(error);
 api.sendMessage(`Sorry, there was an error getting the lyrics for "${songName}"!`, event.threadID, event.messageID);
 }
 },
};

async function getApiUrl() {
 try {
 const response = await axios.get("https://raw.githubusercontent.com/Savage-Army/extras/refs/heads/main/api.json");
 return response.data.api;
 } catch (error) {
 console.error("Error fetching API URL:", error);
 return null;
 }
}