import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/laohu8/personal.ts
const rootUrl = "https://www.laohu8.com";
const route = {
	path: "/personal/:id",
	categories: ["finance"],
	view: 0,
	example: "/laohu8/personal/3527667596890271",
	parameters: { id: "用户 ID，见网址链接" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["laohu8.com/personal/:id"] }],
	name: "个人主页",
	maintainers: ["Fatpandac"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const url = `${rootUrl}/personal/${id}`;
	const $ = load((await got_default(url)).data);
	const author = $("h2.personal-name").text();
	const data = JSON.parse($("#__APP_DATA__").text()).tweetList;
	const items = await Promise.all(data.map((item) => cache_default.tryGet(item.link, () => ({
		title: item.title,
		description: String(item.htmlText).replaceAll("\n", "<br><br>"),
		link: `${rootUrl}/post/${item.id}`,
		pubDate: parseDate(item.gmtCreate)
	}))));
	return {
		title: `老虎社区 - ${author} 个人社区`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
