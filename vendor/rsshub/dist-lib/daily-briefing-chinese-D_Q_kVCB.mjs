import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/nytimes/daily-briefing-chinese.tsx
const route = {
	path: "/daily_briefing_chinese",
	categories: ["traditional-media"],
	example: "/nytimes/daily_briefing_chinese",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["nytimes.com/"],
		target: ""
	}],
	name: "Daily Briefing",
	maintainers: ["yueyericardo", "nczitzk"],
	handler,
	url: "nytimes.com/",
	description: "URL: <https://www.nytimes.com/zh-hans/series/daily-briefing-chinese>"
};
async function handler() {
	const currentUrl = `https://www.nytimes.com/zh-hans/series/daily-briefing-chinese`;
	const response = await got_default({
		method: "get",
		url: currentUrl
	});
	const listData = JSON.parse(response.data.match(/"initialState":(.*),"config"/)[1]);
	let items = [];
	for (const [key, item] of Object.entries(listData)) if (key.startsWith("Article:") && item.url) items.push({
		link: item.url,
		pubDate: parseDate(item.firstPublished)
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		const content = load(detailResponse.data);
		content(".StoryBodyCompanionColumn").last().find("p").last().remove();
		const images = detailResponse.data.match(/"url":"[^{}]+","name":"articleLarge"/g).map((e) => JSON.parse(`{${e}}`).url);
		let i = 0;
		content("figure").each((_, el) => {
			content(el).html(renderToString(/* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", { src: images[i++] }) })));
		});
		item.title = content("meta[property=\"og:title\"]").attr("content");
		item.author = content("meta[name=\"byl\"]").attr("content").replace(/By /, "");
		item.description = content("section[name=\"articleBody\"]").html();
		return item;
	})));
	return {
		title: "Daily Briefing - The New York Times",
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
