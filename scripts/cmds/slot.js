module.exports = {
  config: {
    name: "slot",
    version: "2.1",
    author: "Aryan Chauhan",
    shortDescription: { en: "Play a slot machine game with bet and 90% win chance" },
    longDescription: { en: "Try your luck in the slot machine and win with 90% probability!" },
    category: "economy",
    guide: { en: ".slot [amount] — Spin the slot with your bet!" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const senderID = event.senderID;
    const user = await usersData.get(senderID);
    const currentMoney = user?.money || 0;

    let bet = parseInt(args[0]);
    if (isNaN(bet) || bet <= 0) {
      return message.reply("⚠ Please enter a valid amount to bet.\nExample: `.slot 100`");
    }

    if (bet > currentMoney) {
      return message.reply(`❌ You don't have enough money to bet that amount!\n💰 Your current balance: ${currentMoney}`);
    }

    const emojis = ["🍒", "🍋", "🍇", "🍉", "⭐", "💎"];
    let spin = [];
    let reward = 0;
    let status = "";
    const luck = Math.random();

    if (luck < 0.9) {
      const matchEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      const second = Math.random() < 0.5 ? matchEmoji : emojis[Math.floor(Math.random() * emojis.length)];
      const third = Math.random() < 0.5 ? matchEmoji : emojis[Math.floor(Math.random() * emojis.length)];

      spin = [matchEmoji, second, third];

      const matchedCount = [matchEmoji, second, third].filter(e => e === matchEmoji).length;
      if (matchedCount === 3) {
        reward = bet * 3;
        status = "🎉 Jackpot! All 3 matched!";
      } else if (matchedCount === 2) {
        reward = bet * 2;
        status = "✨ Nice! 2 emojis matched!";
      }
    } else {
      while (true) {
        const first = emojis[Math.floor(Math.random() * emojis.length)];
        const second = emojis[Math.floor(Math.random() * emojis.length)];
        const third = emojis[Math.floor(Math.random() * emojis.length)];
        if (first !== second && second !== third && first !== third) {
          spin = [first, second, third];
          break;
        }
      }
      reward = -bet;
      status = "😢 You lost this time.";
    }

    const finalBalance = currentMoney + reward;
    await usersData.set(senderID, { money: finalBalance });

    const resultText = 
`🎰 Slot Machine Result:
━━━━━━━━━━━━━━
${spin[0]} | ${spin[1]} | ${spin[2]}
━━━━━━━━━━━━━━
${status}
💸 Bet: ${bet}
${reward >= 0 ? `💰 Won: ${reward}` : `💸 Lost: ${bet}`}
📍 New Balance: ${finalBalance}`;

    return message.reply(resultText);
  }
};
