module.exports = {
  config: {
    name: "supportgc",
    aliases: ["support", "gc"],
    version: "2.0",
    author: "Aryan Chauhan ",
    shortDescription: "Add user(s) to Support Group Chat",
    longDescription: "Add user(s) to the support group chat via tag, reply, or self.",
    category: "admin",
    guide: {
      en: "Usage:\n- `supportgc` → Add yourself to Support GC\n- `supportgc @user1 @user2` → Add tagged users\n- Reply to user and type `supportgc` to add that user."
    }
  },

  onStart: async function ({ api, event, args }) {
    const SUPPORT_GC_THREAD_ID = "9383209238461422"; 

    try {
      let userIDs = [];

      if (event.type === "message_reply") {
        userIDs.push(event.messageReply.senderID);
      } else if (Object.keys(event.mentions).length > 0) {
        userIDs = Object.keys(event.mentions);
      } else {
        userIDs.push(event.senderID); 
      }

      let success = [], failed = [];

      for (let uid of userIDs) {
        try {
          await api.addUserToGroup(uid, SUPPORT_GC_THREAD_ID);
          const name = (await api.getUserInfo(uid))[uid]?.name || "User";
          success.push(name);

          await api.sendMessage(`👋 Welcome ${name} to the Support Group!`, SUPPORT_GC_THREAD_ID);

        } catch (err) {
          const name = (await api.getUserInfo(uid))[uid]?.name || "User";
          failed.push(`${name} (${err.message.includes("already in") ? "already in group" : "error"})`);
        }
      }

      let msg = "";
      if (success.length > 0) msg += `✅ Added to Support Group: ${success.join(", ")}`;
      if (failed.length > 0) msg += `\n⚠️ Failed to add: ${failed.join(", ")}`;

      return api.sendMessage(msg.trim(), event.threadID);

    } catch (err) {
      console.error("❌ Error in supportgc:", err);
      return api.sendMessage("❌ | Something went wrong while adding to Support GC.", event.threadID);
    }
  }
};
