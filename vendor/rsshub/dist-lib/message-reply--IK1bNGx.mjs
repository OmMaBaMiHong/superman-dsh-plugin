import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as cache_default } from "./cache-DzpZriu0.mjs";
//#region lib/routes/bilibili/message-reply.ts
const route = {
	path: "/message/reply/:uid",
	categories: ["social-media"],
	example: "/bilibili/message/reply/2267573",
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
	name: "回复我的",
	maintainers: ["pilgrimlyieu"],
	handler,
	description: `::: warning
用户消息需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
:::`
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	const name = await cache_default.getUsernameFromUID(uid);
	const cookie = config.bilibili.cookies[uid];
	if (cookie === void 0) throw new ConfigNotFoundError("缺少对应 uid 的 Bilibili 用户登录后的 Cookie 值");
	const response = await rofetch("https://api.bilibili.com/x/msgfeed/reply", {
		query: {
			platform: "web",
			build: 0,
			mobi_app: "web"
		},
		headers: {
			Referer: "https://message.bilibili.com/",
			Cookie: cookie
		}
	});
	if (response.code !== 0) throw new Error(response.message ?? `Error code ${response.code}`);
	const items = (response.data.items || []).map((item) => {
		const replyUser = item.user;
		const replyItem = item.item;
		const sourceContent = replyItem.source_content;
		const targetContent = replyItem.target_reply_content;
		const rootContent = replyItem.root_reply_content;
		let description = `<p><strong>${replyUser.nickname}</strong> 回复了你：</p>`;
		description += `<blockquote>${sourceContent}</blockquote>`;
		if (targetContent) description += `<p>你的评论：</p><blockquote>${targetContent}</blockquote>`;
		else if (rootContent) description += `<p>你的评论：</p><blockquote>${rootContent}</blockquote>`;
		if (replyItem.image) description += `<p><img src="${replyItem.image.replace("http://", "https://")}" /></p>`;
		description += `<p>来自：${replyItem.business} - ${replyItem.title}</p>`;
		let link = replyItem.uri;
		if (replyItem.root_id && replyItem.uri) link = `${replyItem.uri}/#reply${replyItem.root_id}`;
		else if (replyItem.source_id && replyItem.uri) link = `${replyItem.uri}/#reply${replyItem.source_id}`;
		return {
			title: `${replyUser.nickname} 回复了你：${sourceContent}`,
			description,
			link,
			pubDate: parseDate(item.reply_time * 1e3),
			author: replyUser.nickname
		};
	});
	return {
		title: `${name} 的 B站消息 - 回复我的`,
		link: "https://message.bilibili.com/#/reply",
		description: `${name} 的 B站消息 - 回复我的`,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
