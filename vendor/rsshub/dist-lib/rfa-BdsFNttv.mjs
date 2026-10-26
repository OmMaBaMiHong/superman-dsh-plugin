import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/rfa/index.ts
const route = {
	path: "/:language?/:channel?/:subChannel?",
	categories: ["traditional-media"],
	example: "/rfa/english",
	parameters: {
		language: "language, English by default",
		channel: "channel",
		subChannel: "subchannel, where applicable"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "News",
	maintainers: ["zphw"],
	handler,
	description: `Delivers a better experience by supporting parameter specification.

Parameters can be obtained from the official website, for instance:

\`https://www.rfa.org/cantonese/news\` corresponds to \`/rfa/cantonese/news\`

\`https://www.rfa.org/cantonese/news/htm\` corresponds to \`/rfa/cantonese/news/htm\``
};
async function handler(ctx) {
	let url = "https://www.rfa.org/" + (ctx.req.param("language") ?? "english");
	if (ctx.req.param("channel")) url += "/" + ctx.req.param("channel");
	if (ctx.req.param("subChannel")) url += "/" + ctx.req.param("subChannel");
	const $ = load((await got_default(url)).data);
	const selectors = [
		"div[id=topstorywidefull]",
		"div.two_featured",
		"div.three_featured",
		"div.single_column_teaser",
		"div.sectionteaser",
		"div.specialwrap"
	];
	const list = [];
	for (const selector of selectors) $(selector).each((_, e) => {
		const item = {
			title: $(e).find("h2 a span").first().text(),
			link: $(e).find("h2 a").first().attr("href")
		};
		list.push(item);
	});
	return {
		title: "RFA",
		link: "https://www.rfa.org/",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const description = load((await got_default(item.link)).data);
			item.description = description("#headerimg").html() + description("div[id=storytext]").html();
			item.pubDate = parseDate(description("span[id=story_date]").text());
			if (description("meta[property=og:audio]").attr("content") !== void 0) {
				item.enclosure_url = description("meta[property=og:audio]").attr("content");
				item.enclosure_type = description("meta[property=og:audio:type]").attr("content");
			}
			return item;
		})))
	};
}
//#endregion
export { route };
