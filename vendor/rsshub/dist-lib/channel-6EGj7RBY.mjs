import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/fx-markets/channel.ts
const route = {
	path: "/:channel",
	categories: ["finance"],
	example: "/fx-markets/trading",
	parameters: { channel: "channel, can be found in the navi bar links at the home page" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Channel",
	maintainers: [],
	handler,
	description: `| Trading | Infrastructure | Tech and Data | Regulation |
| ------- | -------------- | ------------- | ---------- |
| trading | infrastructure | tech-and-data | regulation |`
};
async function handler(ctx) {
	const link = `https://www.fx-markets.com/${ctx.req.param("channel")}`;
	const html = (await got_default(link)).data;
	const $ = load(html);
	const title = `FX-Markets ${$("header.select-header > h1").text()}`;
	const articles = $("div#listings").children().toArray().map((el) => {
		const $el = $(el);
		const $titleEl = $el.find("h5 > a");
		const articleURL = `https://www.fx-markets.com${$titleEl.attr("href")}`;
		return {
			title: $titleEl.attr("title"),
			link: articleURL,
			pubDate: parseDate($el.find("time").text())
		};
	});
	return {
		title,
		link,
		item: await Promise.all(articles.map((item) => cache_default.tryGet(item.link, async () => {
			const doc = load((await got_default(item.link)).data);
			const dateScript = doc("script[type=\"application/ld+json\"]").toArray()[0].children[0].data;
			const dateStr = /"datePublished": "(?<dateTimePub>.*)"/.exec(dateScript).groups.dateTimePub;
			const pubDateTime = parseDate(dateStr, "YYYY-MM-DDTHH:mm:ssZ");
			item.description = doc("div.article-page-body-content:not(.print-access-info)").html();
			return {
				title: item.title,
				link: item.link,
				description: item.description,
				pubDate: pubDateTime ?? item.pubDate
			};
		})))
	};
}
//#endregion
export { route };
