const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "mirror",
    version: "1.0",
    author: "GoatMart",
    role: 1,
    category: "tools",
    guide: { en: "{p}mirror [threadID]" },
    longDescription: { en: "Copy name and group picture from another group" }
  },
  onStart: async function ({ api, event, args }) {
    const { threadID } = event;
    const targetID = args[0];
    if (!targetID) return api.sendMessage("❌ Provide thread ID.\nUsage: mirror [threadID]", threadID);

    try {
      const info = await api.getThreadInfo(targetID);
      await api.setTitle(info.threadName, threadID);

      if (info.imageSrc) {
        const img = (await axios.get(info.imageSrc, { responseType: 'stream' })).data;
        const path = __dirname + "/mirror.jpg";
        img.pipe(fs.createWriteStream(path)).on("finish", () => {
          api.changeGroupImage(fs.createReadStream(path), threadID, () => fs.unlinkSync(path));
        });
      }

      api.sendMessage("✅ Group name & image copied successfully!", threadID);
    } catch {
      api.sendMessage("❌ Failed to mirror group details.", threadID);
    }
  }
};
