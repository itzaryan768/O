const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "welcome",
  author: "Aryan Chauhan",
  version: "1.0.0",
  description: "Simple welcome event for GoatBot v2."
};

module.exports.onEvent = async function ({ event, api, global }) {
  if (event.logMessageType !== "log:subscribe") return;
  const added = event.logMessageData?.addedParticipants;
  if (!added || added.length === 0) return;

  const threadInfo = await api.getThreadInfo(event.threadID);
  const groupName = threadInfo.threadName || "this group";

  const gifs = [
    "https://i.imgur.com/TFsYjAj.gif",
    "https://i.imgur.com/dNgMXpW.gif",
    "https://i.imgur.com/40X3Vyo.gif"
  ];
  const gifUrl = gifs[Math.floor(Math.random() * gifs.length)];
  const cacheDir = path.join(__dirname, "..", "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  const gifPath = path.join(cacheDir, `welcome_${Date.now()}.gif`);
  const res = await axios.get(gifUrl, { responseType: "arraybuffer" });
  fs.writeFileSync(gifPath, res.data);

  for (const p of added) {
    const userName = p.fullName || "Friend";
    const message = `🎉 Welcome @${userName} to ${groupName}! 🎊\nIntroduce yourself and enjoy the group!`;
    await api.sendMessage(
      {
        body: message,
        mentions: [{ tag: userName, id: p.userFbId }],
        attachment: fs.createReadStream(gifPath)
      },
      event.threadID
    );
  }

  fs.unlinkSync(gifPath);
};
