import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as getUserInfoFromUID } from "./utils-kD_aMnVf.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/luogu/user-article.ts
const route = {
	path: "/user/article/:uid",
	categories: ["programming"],
	example: "/luogu/user/article/1",
	parameters: { name: "用户 UID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["luogu.com/user/:uid"] }, { source: ["luogu.com.cn/user/:uid"] }],
	name: "用户文章",
	maintainers: ["TonyRL"],
	handler
};
const baseUrl = "https://www.luogu.com";
async function handler(ctx) {
	const { uid } = ctx.req.param();
	const userInfo = await getUserInfoFromUID(uid);
	const posts = (await rofetch(`${baseUrl}/api/article/find`, { query: {
		user: uid,
		page: 1,
		ascending: false
	} })).articles.result.map((item) => ({
		title: item.title,
		link: `${baseUrl}/article/${item.lid}`,
		author: item.author.name,
		pubDate: parseDate(item.time, "X"),
		description: item.content
	}));
	const item = await Promise.all(posts.map((item) => cache_default.tryGet(item.link, async () => {
		const response = await rofetch(item.link);
		item.description = cheerio.load(response)("div#rendered-preview").html();
		return item;
	})));
	return {
		title: `${userInfo.name} 的个人中心 - 洛谷 | 计算机科学教育新生态`,
		description: userInfo.description,
		link: `${baseUrl}/user/${uid}#article`,
		image: userInfo.avatar,
		item
	};
}
//#endregion
export { route };
