module.exports = {
  config: {
    name: "richest",
    aliases: ["top"],
    version: "1.0",
    author: "Aryan Chauhan",
    countDown: 5,
    shortDescription: { en: "Show top richest users" },
    longDescription: {
      en: "Displays a leaderboard of users with the highest money balance.",
    },
    category: "information",
  },

  langs: {
    en: {
      title: "💸 Top Richest Users 💸",
      no_data: "No users found with money data.",
      list: "%1. %2 - $%3",
    },
  },

  onStart: async function ({ usersData, message, getLang }) {
    const allUsers = await usersData.getAll();

    const usersWithMoney = allUsers
      .filter(user => user.money && user.money > 0)
      .sort((a, b) => b.money - a.money)
      .slice(0, 10);

    if (usersWithMoney.length === 0) {
      return message.reply(getLang("no_data"));
    }

    let msg = `\n${getLang("title")}\n\n`;
    usersWithMoney.forEach((user, index) => {
      const userName = user.name || `User ${index + 1}`;
      msg += getLang("list", index + 1, userName, user.money) + "\n";
    });

    return message.reply(msg.trim());
  },
};
