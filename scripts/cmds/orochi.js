const a = require('axios');
const b = require('valid-url');
const c = require('fs');
const d = require('path');
const e = require('uuid').v4;

const f = "https://orochiai.vercel.app/chat";
const g = "https://orochiai.vercel.app/chat/clear";
const h = d.join(__dirname, 'tmp');
if (!c.existsSync(h)) c.mkdirSync(h);

const i = async (j, k) => {
 const l = d.join(h, `${e()}.${k}`);
 const m = await a.get(j, { responseType: 'arraybuffer' });
 c.writeFileSync(l, Buffer.from(m.data));
 return l;
};

const n = async (o, p, q) => {
 o.setMessageReaction("♻️", p.messageID, () => {}, true);
 try {
 await a.delete(`${g}/${p.senderID}`);
 return q.reply(`✅ Conversation reset for UID: ${p.senderID}`);
 } catch (r) {
 console.error('❌ Reset Error:', r.message);
 return q.reply("❌ Reset failed. Try again.");
 }
};

const s = async (t, u, v, w, x = false) => {
 const y = u.senderID;
 let z = v, A = null;
 t.setMessageReaction("⏳", u.messageID, () => {}, true);

 if (u.messageReply) {
 const B = u.messageReply;
 if (B.senderID !== global.GoatBot?.botID && B.body) {
 const C = B.body.length > 300 ? B.body.slice(0, 300) + "..." : B.body;
 z += `\n\n📌 Reply:\n"${C}"`;
 }
 const D = B.attachments?.[0];
 if (D?.type === 'photo') A = D.url;
 }

 const E = z.match(/(https?:\/\/[^\s]+)/)?.[0];
 if (E && b.isWebUri(E)) {
 A = E;
 z = z.replace(E, '').trim();
 }

 if (!z && !A) {
 t.setMessageReaction("❌", u.messageID, () => {}, true);
 return w.reply("💬 Provide a message or image.");
 }

 try {
 const F = await a.post(f, { uid: y, message: z, image_url: A }, { timeout: 45000 });
 const { reply: G, image_url: H, music_data: I, shotti_data: J } = F.data;
 let K = G || '✅ Reply from Orochi AI.', L = [];

 if (H) try { L.push(c.createReadStream(await i(H, 'jpg'))); } catch { K += '\n🖼️ Image failed.'; }
 if (I?.downloadUrl) try { L.push(c.createReadStream(await i(I.downloadUrl, 'mp3'))); } catch { K += '\n🎵 Music failed.'; }
 if (J?.videoUrl) try { L.push(c.createReadStream(await i(J.videoUrl, 'mp4'))); } catch { K += '\n🎬 Video failed.'; }

 const M = await w.reply({ body: K, attachment: L.length > 0 ? L : undefined });
 global.GoatBot.onReply.set(M.messageID, { commandName: 'orochi', messageID: M.messageID, author: y });
 t.setMessageReaction("✅", u.messageID, () => {}, true);
 } catch (N) {
 console.error("❌ API Error:", N.response?.data || N.message);
 t.setMessageReaction("❌", u.messageID, () => {}, true);
 let O = "⚠️ Orochi AI Error:\n\n";
 if (N.code === 'ECONNABORTED' || N.message.includes('timeout')) O += "⏱️ Timeout. Try again.";
 else if (N.response?.status === 429) O += "🚦 Too many requests. Slow down.";
 else O += "❌ Unexpected error.";
 return w.reply(O);
 }
};

module.exports = {
 config: {
 name: 'orochi',
 aliases: ['chi'],
 version: '4.3.1',
 author: 'Orochi AI',
 role: 0,
 category: 'ai',
 longDescription: { en: 'Orochi AI: chat, image, music, video, clear.' },
 guide: {
 en: `
.orochi [your message]
• 🤖 Chat, 🎨 Image, 🎵 Music, 🎬 Video
• Reply to image or message
• Type "clear" to reset
 `
 }
 },

 onStart: async function ({ api: a, event: b, args: c, message: d }) {
 const e = c.join(' ').trim().toLowerCase();
 if (!e) return d.reply("❗ Enter message for Orochi.");
 if (['clear', 'reset'].includes(e)) return await n(a, b, d);
 return await s(a, b, e, d);
 },

 onReply: async function ({ api: a, event: b, Reply: c, message: d }) {
 if (b.senderID !== c.author) return;
 const e = b.body?.trim();
 if (!e) return;
 if (['clear', 'reset'].includes(e.toLowerCase())) return await n(a, b, d);
 return await s(a, b, e, d, true);
 }
};