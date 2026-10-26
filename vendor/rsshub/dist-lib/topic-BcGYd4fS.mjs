import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/hbr/topic.ts
const route = {
	path: "/topic/:topic?/:type?",
	categories: ["new-media"],
	example: "/hbr/topic/Leadership/Popular",
	parameters: {
		topic: "Topic, can be found in URL, Leadership by default",
		type: {
			description: "Type, see below, Popular by default",
			options: [
				{
					value: "Popular",
					label: "Popular"
				},
				{
					value: "From the Store",
					label: "From the Store"
				},
				{
					value: "For You",
					label: "For You"
				}
			],
			default: "Popular"
		}
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["hbr.org/topic/:topic?", "hbr.org/"] }],
	name: "Topic",
	maintainers: ["nczitzk", "pseudoyu"],
	handler,
	description: `| POPULAR | FROM THE STORE | FOR YOU |
| ------- | -------------- | ------- |
| Popular | From the Store | For You |

::: tip
Click here to view [All Topics](https://hbr.org/topics)
:::`
};
async function handler(ctx) {
	const topic = ctx.req.param("topic") ?? "Leadership";
	const type = ctx.req.param("type") ?? "Popular";
	const rootUrl = "https://hbr.org";
	const currentUrl = `${rootUrl}/topic/${topic}`;
	const $ = load(await rofetch(currentUrl));
	const list = $(`stream-content[data-stream-name="${type}"]`).find(".stream-item").toArray().map((item) => {
		item = $(item);
		return {
			title: item.attr("data-title"),
			author: item.attr("data-authors"),
			category: item.attr("data-topic"),
			link: `${rootUrl}${item.attr("data-url")}`
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load(await rofetch(item.link));
		item.description = content(".article-body, article[itemprop=\"description\"]").html();
		item.pubDate = parseDate(content("meta[property=\"article:published_time\"]").attr("content"));
		return item;
	})));
	return {
		title: `${$("title").eq(0).text()} - ${type}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
