import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as cache_default$1 } from "./cache-DzpZriu0.mjs";
import { load } from "cheerio";
//#region lib/routes/bilibili/article.ts
const route = {
	path: "/user/article/:uid",
	categories: ["social-media"],
	example: "/bilibili/user/article/334958638",
	parameters: { uid: "用户 id, 可在 UP 主主页中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["space.bilibili.com/:uid"] }],
	name: "UP 主图文",
	maintainers: [
		"lengthmin",
		"Qixingchen",
		"hyoban"
	],
	handler
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	const name = await cache_default$1.getUsernameFromUID(uid);
	const data = (await got_default({
		method: "get",
		url: `https://api.bilibili.com/x/polymer/web-dynamic/v1/opus/feed/space?host_mid=${uid}`,
		headers: { Referer: `https://space.bilibili.com/${uid}/article` }
	})).data.data;
	const title = `${name} 的 bilibili 图文`;
	const link = `https://space.bilibili.com/${uid}/article`;
	const description = `${name} 的 bilibili 图文`;
	const cookie = await cache_default$1.getCookie();
	return {
		title,
		link,
		description,
		item: await Promise.all(data.items.map(async (item) => {
			const link = "https:" + item.jump_url;
			const $ = load(await cache_default.tryGet(link, async () => (await got_default({
				method: "get",
				url: link,
				headers: {
					Referer: `https://space.bilibili.com/${uid}/article`,
					Cookie: cookie
				}
			})).data));
			const description = $(".opus-module-content").html();
			const pubDate = $(".opus-module-author__pub__text").text().replace("编辑于 ", "");
			return {
				title: item.content,
				link,
				description: description || item.content,
				pubDate: pubDate ? parseDate(pubDate, "YYYY年MM月DD日 HH:mm") : void 0
			};
		}))
	};
}
//#endregion
export { route };
