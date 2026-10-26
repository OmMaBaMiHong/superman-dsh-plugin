import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/zhibo8/forum.ts
const route = {
	path: "/forum/:id",
	categories: ["bbs"],
	example: "/zhibo8/forum/8",
	parameters: { id: "子论坛 id，可在子论坛 URL 找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "子论坛",
	maintainers: ["LogicJake"],
	handler
};
async function handler(ctx) {
	const link = `https://bbs.zhibo8.cc/forum/list/?fid=${ctx.req.param("id")}`;
	const $ = load((await got_default(link)).data);
	const title = $("div.intro > h2").text();
	const list = $("table.topic-list > tbody:nth-child(3) > tr");
	const out = await Promise.all(list.toArray().map((item) => {
		item = $(item);
		const a = item.find("td:nth-child(1) > a:nth-child(2)");
		const link = "https://bbs.zhibo8.cc" + a.attr("href");
		return cache_default.tryGet(link, async () => {
			const title = a.text();
			const author = item.find("td:nth-child(2) cite a").text();
			const date = item.find("td:nth-child(2) em").text();
			return {
				title,
				description: load((await got_default(link)).data)(".detail_ent").html(),
				author,
				link,
				pubDate: timezone(parseDate(date, "YYYY-MM-DD HH:mm"), 8)
			};
		});
	}));
	return {
		title: `${title}—直播吧`,
		link,
		item: out
	};
}
//#endregion
export { route };
