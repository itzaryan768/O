const fs = require("fs");
const axios = require("axios");

module.exports = {
  config: {
    name: "groupinfo",
    version: "4.0",
    author: "GoatMart",
    role: 0,
    shortDescription: "Detailed group information",
    longDescription: {
      en: "Show complete information about the group including group image, gender stats, admins, etc."
    },
    category: "media",
    guide: {
      en: "Use: groupinfo"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const userInfo = await api.getUserInfo(threadInfo.participantIDs);

      let male = 0, female = 0, unknown = 0;

      for (let uid in userInfo) {
        const gender = userInfo[uid].gender;
        if (gender === 2) male++;
        else if (gender === 1) female++;
        else unknown++;
      }

      const groupName = threadInfo.threadName || "N/A";
      const emoji = threadInfo.emoji || "❌ None";
      const memberCount = threadInfo.participantIDs.length;
      const adminCount = threadInfo.adminIDs.length;
      const approvalMode = threadInfo.approvalMode ? "✅ Enabled" : "❌ Disabled";
      const nicknamesCount = Object.keys(threadInfo.nicknames || {}).length;
      const messageCount = threadInfo.messageCount || "Unknown";
      const threadID = event.threadID;

      const adminList = threadInfo.adminIDs.map(a => `• ${a.id} (fb.com/${a.id})`).join("\n");

      const message = `
📢 𝗚𝗿𝗼𝘂𝗽 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻

🔸 Group Name       : ${groupName}
🔸 Thread ID        : ${threadID}
🔸 Total Members    : ${memberCount}
🔸 Admins           : ${adminCount}
🔸Male       : ${male}
🔸 Female      : ${female}
🔸Unknown     : ${unknown}🔸 Approval Mode    : ${approvalMode}
🔸 Emoji            : ${emoji}
🔸 Nicknames Set    : ${nicknamesCount}
🔸 Total Messages   : ${messageCount}

👑 Addmissior List:
${adminList}`;

      if (threadInfo.imageSrc) {
        const imgPath = __dirname + "/groupimg.jpg";
        const response = await axios.get(threadInfo.imageSrc, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

        return api.sendMessage({
          body: message,
          attachment: fs.createReadStream(imgPath)
        }, event.threadID, () => fs.unlinkSync(imgPath), event.messageID);
      } else {
        return api.sendMessage(message, event.threadID, event.messageID);
      }

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Failed to fetch group info.", event.threadID, event.messageID);
    }
  }
};
