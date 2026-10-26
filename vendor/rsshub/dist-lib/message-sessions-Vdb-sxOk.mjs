import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as cache_default$1 } from "./cache-DzpZriu0.mjs";
//#region lib/routes/bilibili/message-sessions.ts
const route = {
	path: "/message/sessions/:uid",
	categories: ["social-media"],
	example: "/bilibili/message/sessions/2267573",
	parameters: { uid: "用户 id" },
	features: {
		requireConfig: [{
			name: "BILIBILI_COOKIE_*",
			description: `BILIBILI_COOKIE_{uid}: 用于用户关注动态系列路由，对应 uid 的 b 站用户登录后的 Cookie 值，\`{uid}\` 替换为 uid，如 \`BILIBILI_COOKIE_2267573\`，获取方式：
    1.  打开 [https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8)
    2.  打开控制台，切换到 Network 面板，刷新
    3.  点击 dynamic_new 请求，找到 Cookie
    4.  视频和专栏，UP 主粉丝及关注只要求 \`SESSDATA\` 字段，动态需复制整段 Cookie`
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "我的消息",
	maintainers: ["pilgrimlyieu"],
	handler,
	description: `::: warning
用户消息需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
:::`
};
/**
* Parse message content based on msg_type
* msg_type 1: text, 2: image, 5: recall, etc.
*/
function parseMessageContent(content, msgType) {
	try {
		const parsed = JSON.parse(content);
		switch (msgType) {
			case 1: return parsed.content || content;
			case 2: return `[图片] ${parsed.url || ""}`;
			case 5: return "[消息已撤回]";
			case 6: return "[表情]";
			case 7: return `[分享] ${parsed.title || ""}`;
			case 10: return parsed.content || parsed.title || content;
			case 11: return `[视频] ${parsed.title || ""}`;
			case 12: return `[专栏] ${parsed.title || ""}`;
			case 14: return `[番剧] ${parsed.title || ""}`;
			default: return parsed.content || parsed.title || content;
		}
	} catch {
		return content;
	}
}
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	const name = await cache_default$1.getUsernameFromUID(uid);
	const cookie = config.bilibili.cookies[uid];
	if (cookie === void 0) throw new ConfigNotFoundError("缺少对应 uid 的 Bilibili 用户登录后的 Cookie 值");
	const response = await rofetch("https://api.vc.bilibili.com/session_svr/v1/session_svr/get_sessions", {
		query: {
			session_type: 1,
			group_fold: 1,
			unfollow_fold: 0,
			sort_rule: 2,
			build: 0,
			mobi_app: "web"
		},
		headers: {
			Referer: "https://message.bilibili.com/",
			Cookie: cookie
		}
	});
	if (response.code !== 0) throw new Error(response.message ?? response.msg ?? `Error code ${response.code}`);
	const sessionList = response.data.session_list || [];
	const talkerIds = sessionList.filter((s) => s.session_type === 1).map((s) => s.talker_id);
	let userCards = {};
	if (talkerIds.length > 0) userCards = await cache_default.tryGet(`bilibili-user-cards-${talkerIds.join(",")}`, async () => {
		return (await rofetch("https://api.bilibili.com/x/polymer/pc-electron/v1/user/cards", {
			query: {
				uids: talkerIds.join(","),
				build: 0,
				mobi_app: "web"
			},
			headers: {
				Referer: "https://message.bilibili.com/",
				Cookie: cookie
			}
		})).data || {};
	}, config.cache.routeExpire);
	const items = sessionList.filter((session) => session.last_msg).map((session) => {
		const lastMsg = session.last_msg;
		const talkerId = session.talker_id;
		const userInfo = userCards[String(talkerId)];
		const talkerName = userInfo?.name || `用户${talkerId}`;
		const talkerFace = userInfo?.face || "";
		const msgContent = parseMessageContent(lastMsg.content, lastMsg.msg_type);
		const isSentByMe = lastMsg.sender_uid === Number(uid);
		let description = "";
		if (talkerFace) description += `<p><img src="${talkerFace.replace("http://", "https://")}" width="48" height="48" style="border-radius: 50%;" /></p>`;
		description += isSentByMe ? `<p><strong>你</strong> 对 <strong>${talkerName}</strong> 说：</p>` : `<p><strong>${talkerName}</strong> 说：</p>`;
		description += `<blockquote>${msgContent}</blockquote>`;
		if (session.unread_count > 0) description += `<p>未读消息: ${session.unread_count} 条</p>`;
		return {
			title: isSentByMe ? `你对 ${talkerName} 说：${msgContent}` : `${talkerName}：${msgContent}`,
			description,
			link: `https://message.bilibili.com/#/whisper/mid${talkerId}`,
			pubDate: parseDate(lastMsg.timestamp * 1e3),
			author: isSentByMe ? name : talkerName,
			guid: `bilibili-session-${talkerId}-${lastMsg.msg_key}`
		};
	});
	return {
		title: `${name} 的 B站消息 - 我的消息`,
		link: "https://message.bilibili.com/#/whisper",
		description: `${name} 的 B站消息 - 我的消息`,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
