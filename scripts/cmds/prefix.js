module.exports = {
  config: {
    name: "prefix",
    version: "1.3",
    author: "Orochi AI",
    countDown: 5,
    role: 0,
    shortDescription: "Show current command prefix",
    longDescription: "Displays the current command prefix for this chat.",
    category: "system",
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    try {
      if (!event.body) return;
      const text = event.body.trim();
      if (text.toLowerCase() === "prefix") {

        const prefix = ".";

        return message.reply({
          body: `
👋 𝗛𝗲𝗹𝗹𝗼 𝗘𝘃𝗲𝗿𝘆𝗼𝗻𝗲!

Some of you might still be having trouble using the bot.

If the bot is already connected or accepted your message request, please use commands with the prefix.

⚙️ 𝗖𝘂𝗿𝗿𝗲𝗻𝘁 𝗣𝗿𝗲𝗳𝗶𝘅: ${prefix}
Examples:
${prefix}chi hello how are you?
`.trim(),
          attachment: await global.utils.getStreamFromURL(
            "https://i.ibb.co/QvgLhbZt/75f2be32d85e.jpg"
          ),
        });
      }
    } catch (error) {
      console.error("Error in prefix command:", error);
      return message.reply("⚠️ An error occurred while fetching the prefix.");
    }
  },
};
