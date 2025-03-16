const { exec } = require("child_process");

module.exports = {
  config: {
    name: "shell",
    version: "1.0",
    author: "GoatMart",
    role: 2,
    shortDescription: "Run shell commands",
    longDescription: {
      en: "Execute terminal shell commands directly."
    },
    category: "owner",
    guide: {
      en: "{pn} <command>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const cmd = args.join(" ");
    if (!cmd) return api.sendMessage("⚠️ | Please enter a command.", event.threadID, event.messageID);

    exec(cmd, (err, stdout, stderr) => {
      if (err || stderr) return api.sendMessage(`❌ Error:\n${err?.message || stderr}`, event.threadID, event.messageID);
      api.sendMessage(stdout || "✅ Done.", event.threadID, event.messageID);
    });
  }
};
