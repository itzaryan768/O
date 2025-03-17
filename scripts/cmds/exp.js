module.exports = {
  config: {
    name: "exp",
    version: "1.0",
    author: "Aryan Chauhan",
    countDown: 3,
    shortDescription: { en: "Check your XP or everyone's XP." },
    longDescription: {
      en: "Check your current XP or leaderboard of all users' XP.",
    },
    category: "information",
  },

  onStart: async function ({ message, event, args, usersData }) {
    const uid = event.senderID;

    if (args[0] === "all") {
      const allUsers = await usersData.getAll();
      const leaderboard = allUsers
        .map((u) => ({
          name: u.name || "Unknown",
          xp: u.exp || 0,
        }))
        .sort((a, b) => b.xp - a.xp)
        .map((u, i) => `${i + 1}. ${u.name} — ${u.xp} XP`)
        .join("\n");

      return message.reply(`🏆 XP Leaderboard:\n\n${leaderboard}`);
    } else {
      const user = await usersData.get(uid);
      const userXP = user.exp || 0;
      const userName = user.name || "You";

      return message.reply(`⭐ ${userName}, your current XP is: ${userXP} XP`);
    }
  },
};
