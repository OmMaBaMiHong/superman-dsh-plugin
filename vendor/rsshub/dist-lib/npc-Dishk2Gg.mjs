import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/npc/index.ts
const route = {
	path: "/:caty",
	categories: ["government"],
	example: "/gov/npc/c183",
	parameters: { caty: "分类名，支持形如 `http://www.npc.gov.cn/npc/c2/*/` 的网站，传入 npc 之后的参数" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["npc.gov.cn/npc/c2/:caty"] }],
	name: "通用",
	maintainers: ["233yeee"],
	handler,
	description: `| 立法 | 监督 | 代表 | 理论 | 权威发布 | 滚动新闻 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| c183 | c184 | c185 | c189 | c12435   | c10134   |`
};
async function handler(ctx) {
	const baseurl = `http://www.npc.gov.cn/npc/c2/${ctx.req.param("caty")}/`;
	const data = (await got_default(baseurl)).data;
	const $ = load(data);
	const title = $("title").text();
	const links = $(".clist a").toArray().map((item) => new URL($(item).attr("href"), baseurl).href);
	return {
		title,
		link: baseurl,
		description: title,
		item: await Promise.all(links.map((link) => cache_default.tryGet(link, async () => {
			const data = (await got_default(link)).data;
			const $ = load(data);
			const title = $("title").text().replace("_中国人大网", "");
			const time = $("script:contains(\"fbrq\")").text().match(/fbrq = "(.*?)"/)[1];
			return {
				title,
				link,
				description: $("#Zoom").html(),
				pubDate: timezone(parseDate(time, "YYYY年MM月DD日 HH:mm"), 8)
			};
		})))
	};
}
//#endregion
export { route };
