import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/sass/gs/index.ts
const host = "https://gs.sass.org.cn";
const route = {
	path: "/gs/:type",
	categories: ["university"],
	example: "/sass/gs/1793",
	parameters: { type: "类别 ID，见下表，其他未列出的栏目参数可以从页面的 URL Path 中找到，例如：硕士统考招生的网址为 `https://gs.sass.org.cn/1793/list.htm`，则类别 ID 为`1793`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gs.sass.org.cn/:type/list.htm"] }],
	name: "研究生院",
	maintainers: ["yanbot-team"],
	handler,
	description: `| 硕士统考招生 | 硕士推免招生 |
| ------------ | ------------ |
| 1793         | sstmzs       |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const url = `${host}/${type}/list.htm`;
	const $ = load((await got_default(url)).data);
	const list = $(".column-news-list .cols_list .cols");
	return {
		title: "上海社会科学院 - 研究生院",
		link: url,
		description: "上海社会科学院 - 研究生院",
		item: await Promise.all(list.map((i, item) => {
			const [titleLink, time] = item.children;
			const itemDate = $(time).text();
			const { href: path, title: itemTitle } = titleLink.children[0].attribs;
			const itemUrl = path.startsWith("http") ? path : host + path;
			return cache_default.tryGet(itemUrl, async () => {
				let description;
				if (itemUrl) {
					const $ = load((await got_default(itemUrl)).data);
					description = $(".read .wp_articlecontent").length ? $(".read .wp_articlecontent").html().trim() : itemTitle;
				} else description = itemTitle;
				return {
					title: itemTitle,
					link: itemUrl,
					description,
					pubDate: parseDate(itemDate, "YYYY-MM-DD")
				};
			});
		}))
	};
}
//#endregion
export { route };
