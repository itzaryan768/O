module.exports = {
  config: {
    name: "ping",
    version: "1.0",
    author: "GoatMart",
    countDown: 2,
    role: 0,
    shortDescription: "Check bot's response time",
    longDescription: {
      en: "Displays the bot's current response time (ping) in milliseconds."
    },
    category: "system",
    guide: {
      en: "{p}ping"
    }
  },

  onStart: async function ({ api, event }) {
    const start = Date.now();
    const message = await api.sendMessage("🔄 Pinging...", event.threadID);
    const ping = Date.now() - start;

    api.sendMessage(`✅ Pong! Bot is active.\n📶 Ping: ${ping}ms`, event.threadID, message.messageID);
  }
};
