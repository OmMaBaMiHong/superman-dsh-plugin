import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
import { SourceMapConsumer } from "source-map";
//#region lib/routes/kunchengblog/essay.ts
const route = {
	path: "/essay",
	categories: ["blog"],
	example: "/kunchengblog/essay",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["kunchengblog.com/essay"] }],
	name: "Essay",
	maintainers: ["nczitzk"],
	handler,
	url: "kunchengblog.com/essay"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 100;
	const rootUrl = "https://www.kunchengblog.com";
	const currentUrl = new URL("essay", rootUrl).href;
	const { data: currentResponse } = await got_default(currentUrl);
	const $ = load(currentResponse);
	const title = $("title").text();
	const mapUrl = new URL(`${$("script").first().prop("src")}.map`, rootUrl).href;
	const { data: response } = await got_default(mapUrl);
	const items = await SourceMapConsumer.with(response, null, (consumer) => consumer.sources.filter((s) => /routes\/essays/.test(s)).toReversed().slice(0, limit).map((item) => {
		const content = load(consumer.sourceContentFor(item).replaceAll(/\s\n/g, "").replaceAll(/(\w+)=\{+([^{}]+)\}+/g, (match, key, value) => {
			return `${key}="${value.slice(1, -1).replaceAll("\"", "'").trim()}"`;
		}));
		return {
			title: content("title").text(),
			pubDate: parseDate(content("p[className=\"App-essay-article\"]").last().find("b").first().text(), "MMM YYYY"),
			link: new URL(`essay/${item.match(/\/(\w+)\.js/)[1].toLowerCase()}`, currentUrl).href,
			description: content("p[className=\"App-essay-article\"]").toArray().map((p) => content(p).html()).join(""),
			author: title
		};
	}));
	const description = $("meta[name=\"description\"]").prop("content");
	const icon = new URL($("link[rel=\"icon\"]").prop("href"), rootUrl).href;
	return {
		item: items,
		title: `${title} - Essay`,
		link: currentUrl,
		description,
		language: $("html").prop("lang"),
		image: icon,
		icon,
		logo: icon,
		subtitle: description,
		author: title,
		allowEmpty: true
	};
}
//#endregion
export { route };
