import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { i as fixArticleContent } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/wechat/ce.ts
const UA = "Mozilla/5.0 (X11; Linux x86_64) RSS Reader";
const route = {
	path: "/ce/:id",
	categories: ["new-media"],
	example: "/wechat/ce/595a5b14d7164e53908f1606",
	parameters: { id: "公众号 id，在 [CareerEngine](https://search.careerengine.us/) 搜索公众号，通过 URL 中找到对应的公众号 id" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cimidata.com/a/:id"] }],
	name: "公众号（CareerEngine 来源）",
	maintainers: ["HenryQW"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const response = await got_default.get(`https://posts.careerengine.us/author/${id}/rss`, { headers: { "User-Agent": UA } });
	const feed = await parser.parseString(response.data);
	const items = await Promise.all(feed.items.splice(0, 10).map((item) => {
		item.link = item.link.replace(/^http:\/\//, "https://");
		return cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default.get(item.link, { headers: { "User-Agent": UA } })).data);
			const description = fixArticleContent($(".post"));
			let pubDate = item.pubDate;
			if (!pubDate || pubDate === "Invalid Date") {
				pubDate = parseDate($(".post-date").text().replaceAll(/\s+|发表/g, ""), "YYYY年MM月DD日");
				pubDate = /* @__PURE__ */ new Date(pubDate.getTime() - pubDate.getTimezoneOffset() * 60 * 1e3);
			}
			return {
				title: item.title,
				description,
				pubDate,
				link: item.link
			};
		});
	}));
	return {
		title: `微信公众号 - ${feed.title}`,
		link: `https://posts.careerengine.us/author/${id}/posts`,
		description: feed.description,
		item: items
	};
}
//#endregion
export { route };
