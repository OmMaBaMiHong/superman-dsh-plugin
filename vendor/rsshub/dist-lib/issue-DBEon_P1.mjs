import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ekantipur/issue.ts
const route = {
	path: "/:channel?",
	categories: ["traditional-media"],
	example: "/ekantipur/news",
	parameters: { channel: "Find it in the ekantipur.com menu or pick from the list below:" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["ekantipur.com/:channel"],
		target: "/:channel"
	}],
	name: "Full Article RSS",
	maintainers: ["maniche04"],
	handler,
	description: `Channels:

| समाचार | अर्थ / वाणिज्य | विचार     | खेलकुद   | उपत्यका    | मनोरञ्जन        | फोटोफिचर          | फिचर     | विश्व   | ब्लग  |
| ---- | ---------- | ------- | ------ | -------- | ------------- | -------------- | ------- | ----- | ---- |
| news | business   | opinion | sports | national | entertainment | photo\\_feature | feature | world | blog |`
};
async function handler(ctx) {
	const baseUrl = "https://ekantipur.com";
	const { channel = "news" } = ctx.req.param();
	const { data: response } = await got_default(`${baseUrl}/${channel}`);
	const $ = load(response);
	const list = $("article.normal").toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		return {
			title: a.text(),
			link: `${baseUrl}${a.attr("href")}`,
			author: item.find("div.author").text(),
			category: channel
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		$("a.static-sponsor").remove();
		$("div.ekans-wrapper").remove();
		item.title = $("h1.eng-text-heading").text();
		item.description = $("div.current-news-block").first().html();
		return item;
	})));
	return {
		title: `Ekantipur - ${channel}`,
		link: `${baseUrl}/${channel}`,
		item: items
	};
}
//#endregion
export { route };
