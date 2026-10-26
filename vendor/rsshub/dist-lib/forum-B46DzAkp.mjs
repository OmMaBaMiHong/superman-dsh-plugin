import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { i as getDate, n as fetchThread, r as generateDescription, t as bbsOrigin } from "./utils-Zt_83OBT2.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/yamibo/bbs/forum.ts
const route = {
	name: "BBS - 板块",
	categories: ["bbs"],
	path: "/bbs/forum/:fid/:type?",
	example: "/yamibo/bbs/forum/5/404",
	parameters: {
		fid: "板块 id，可从URL中提取。https://bbs.yamibo.com/forum-aa-b.html中的aa部分即为fid值",
		type: "板块子分类，网页中选中板块分类后URL中的typeid值"
	},
	maintainers: ["KarasuShin"],
	handler,
	features: {
		antiCrawler: true,
		requireConfig: [{
			optional: true,
			name: "YAMIBO_SALT",
			description: "百合会BBS登录后的认证信息，获取方式：1. 登录百合会BBS网页版 2. 打开浏览器开发者工具，切换到 Application 面板\n3. 点击侧边栏中的Storage -> Cookies -> https://bbs.yamibo.com 4. 复制 Cookie 中的 EeqY_2132_saltkey 值"
		}, {
			optional: true,
			name: "YAMIBO_AUTH",
			description: "百合会BBS登录后的认证信息，获取方式：1. 登录百合会BBS网页版 2. 打开浏览器开发者工具，切换到 Application 面板\n3. 点击侧边栏中的Storage -> Cookies -> https://bbs.yamibo.com 4. 复制 Cookie 中的 EeqY_2132_auth 值"
		}]
	},
	description: `::: warning
百合会 BBS 访问部分板块需要用户登录认证，请参考配置说明
:::`
};
async function handler(ctx) {
	const fid = ctx.req.param("fid");
	const type = ctx.req.param("type");
	const { auth, salt } = config.yamibo;
	const params = new URLSearchParams();
	params.set("mod", "forumdisplay");
	params.set("fid", fid);
	params.set("orderby", "dateline");
	if (type) {
		params.set("filter", "typeid");
		params.set("typeid", type);
	}
	const headers = {};
	if (auth && salt) headers.cookie = `EeqY_2132_saltkey=${salt}; EeqY_2132_auth=${auth}`;
	const link = `${bbsOrigin}/forum.php?${params.toString()}`;
	const $ = load(await rofetch(link, { headers }));
	const title = $("title").text().replace(" -  百合会 -  Powered by Discuz!", "");
	let items = $("tbody[id^=\"normalthread_\"]").toArray().map((item) => {
		const $item = $(item);
		const id = $item.attr("id").match(/\d+/)[0];
		return {
			id,
			title: $item.find("th em").text() + $item.find("th .s.xst").text(),
			link: `${bbsOrigin}/thread-${id}-1-1.html`,
			pubDate: getDate($item.find("td.by").first().find("em").text())
		};
	});
	items = await pMap(items, async (item) => await cache_default.tryGet(item.link, async () => {
		let description;
		const { data } = await fetchThread(item.id);
		if (data && !data.startsWith("<script type=\"text/javascript\">")) {
			const $ = load(data);
			if ($("#postlist>div[id^=\"post_\"]").length) {
				const op = $("#postlist>div[id^=\"post_\"]").first();
				const postId = op.attr("id")?.match(/\d+/)?.[0];
				if (postId) description = generateDescription(op, postId);
			}
		}
		return {
			title: item.title,
			link: item.link,
			description,
			pubDate: item.pubDate
		};
	}), { concurrency: 5 });
	return {
		title,
		link,
		item: items
	};
}
//#endregion
export { route };
