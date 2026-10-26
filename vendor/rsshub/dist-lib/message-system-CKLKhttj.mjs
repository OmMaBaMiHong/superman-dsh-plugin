import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as cache_default } from "./cache-DzpZriu0.mjs";
//#region lib/routes/bilibili/message-system.ts
const route = {
	path: "/message/system/:uid",
	categories: ["social-media"],
	example: "/bilibili/message/system/2267573",
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
	name: "系统通知",
	maintainers: ["pilgrimlyieu"],
	handler,
	description: `::: warning
用户消息需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
:::`
};
/**
* Parse bilibili message content with special link format
* Format: #{text}{"url"} -> <a href="url">text</a>
*/
function parseMessageContent(content) {
	return content.replaceAll(/#\{([^}]+)\}\{"([^"]+)"\}/g, "<a href=\"$2\">$1</a>");
}
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	const name = await cache_default.getUsernameFromUID(uid);
	const cookie = config.bilibili.cookies[uid];
	if (cookie === void 0) throw new ConfigNotFoundError("缺少对应 uid 的 Bilibili 用户登录后的 Cookie 值");
	const response = await rofetch("https://message.bilibili.com/x/sys-msg/query_user_notify", {
		query: {
			page_size: 20,
			build: 0,
			mobi_app: "web"
		},
		headers: {
			Referer: "https://message.bilibili.com/",
			Cookie: cookie
		}
	});
	if (response.code !== 0) throw new Error(response.message ?? response.msg ?? `Error code ${response.code}`);
	const items = (response.data.system_notify_list || []).map((item) => {
		let description = `<p><strong>${item.title}</strong></p>`;
		const parsedContent = parseMessageContent(item.content);
		description += `<p>${parsedContent.replaceAll("\n", "<br>")}</p>`;
		if (item.source.logo) description += `<p><img src="${item.source.logo.replace("http://", "https://")}" width="40" /></p>`;
		if (item.card_cover) description += `<p><img src="${item.card_cover.replace("http://", "https://")}" /></p>`;
		const link = item.card_link || "https://message.bilibili.com/#/system";
		return {
			title: item.title,
			description,
			link,
			pubDate: parseDate(item.time_at),
			guid: `bilibili-system-notify-${item.id}-${item.cursor}`
		};
	});
	return {
		title: `${name} 的 B站消息 - 系统通知`,
		link: "https://message.bilibili.com/#/system",
		description: `${name} 的 B站消息 - 系统通知`,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
