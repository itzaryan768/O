module.exports = {
  config: {
    name: "coinflip",
    version: "1.0",
    author: "Aryan Chauhan",
    countDown: 2,
    shortDescription: { en: "Flip a coin and test your luck!" },
    longDescription: {
      en: "Pay to flip a coin, choose heads or tails, win if correct!",
    },
    category: "economy"
  },

  langs: {
    en: {
      choose: "🪙 Type `heads` or `tails` after the command to play.",
      not_enough: "%1, you need at least $%2 to play!",
      invalid: "Invalid choice! Use `heads` or `tails`.",
      start: "🪙 Flipping the coin...",
      win: "🎉 It's %1! You guessed right and won $%2 and +%3 XP!",
      lose: "😢 It's %1! You lost your $%2.",
    }
  },

  onStart: async function ({ message, args, event, usersData, getLang }) {
    const uid = event.senderID;
    const userData = await usersData.get(uid);
    const userName = userData.name || "Player";

    const entryFee = 50, reward = 100, xp = 20;
    const choice = args[0]?.toLowerCase();

    if (!["heads", "tails"].includes(choice)) return message.reply(getLang("choose"));
    if (userData.money < entryFee) return message.reply(getLang("not_enough", userName, entryFee));

    userData.money -= entryFee;
    const flip = Math.random() < 0.5 ? "heads" : "tails";

    let resultMsg = "";
    if (choice === flip) {
      userData.money += reward;
      userData.exp = (userData.exp || 0) + xp;
      resultMsg = getLang("win", flip, reward, xp);
    } else {
      resultMsg = getLang("lose", flip, entryFee);
    }

    await usersData.set(uid, {
      money: userData.money,
      exp: userData.exp,
      data: userData.data,
    });

    return message.reply(getLang("start") + "\n\n" + resultMsg);
  }
};
