import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/bbc/learningenglish.ts
const channelMap = {
	"take-away-english": "随身英语",
	"authentic-real-english": "地道英语",
	"media-english": "媒体英语",
	lingohack: "英语大破解",
	"english-in-a-minute": "一分钟英语",
	"phrasal-verbs": "短语动词",
	"todays-phrase": "今日短语",
	"q-and-a": "你问我答",
	"english-at-work": "白领英语",
	storytellers: "亲子英语故事"
};
const route = {
	name: "Learning English",
	maintainers: ["Blank0120"],
	categories: ["study"],
	handler,
	path: "/learningenglish/:channel?",
	example: "/bbc/learningenglish/take-away-english",
	parameters: { channel: {
		description: "英语学习分类栏目",
		options: Object.entries(channelMap).map(([value, label]) => ({
			value,
			label
		})),
		default: "take-away-english"
	} }
};
async function handler(ctx) {
	const { channel = "take-away-english" } = ctx.req.param();
	const rootURL = "https://www.bbc.co.uk";
	const targerURL = `${rootURL}/learningenglish/chinese/features/${channel}`;
	const $ = load(await rofetch(targerURL, { parseResponse: (txt) => txt }));
	const firstItem = {
		title: $("[data-widget-index=4]").find("h2").text(),
		link: `${rootURL}${$("[data-widget-index=4]").find("h2 a").attr("href")}`,
		pubDate: parseDate($("[data-widget-index=4]").find(".details h3").text())
	};
	const restItems = $(".threecol li").toArray().slice(0, 10).map((article) => {
		const $article = load(article);
		return {
			title: $article("h2").text(),
			link: `${rootURL}${$article("h2 a").attr("href")}`,
			pubDate: parseDate($article(".details h3").text())
		};
	});
	const items = await Promise.all([firstItem, ...restItems].map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			item.description = load(await rofetch(item.link, { parseResponse: (txt) => txt }))(".widget-richtext").html() ?? void 0;
			return item;
		});
	}));
	return {
		title: `BBC英语学习-${channelMap[channel]}`,
		link: targerURL,
		item: items
	};
}
//#endregion
export { route };
