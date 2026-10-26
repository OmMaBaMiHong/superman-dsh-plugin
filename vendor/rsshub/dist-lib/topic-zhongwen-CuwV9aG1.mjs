import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as fetchBbcContent } from "./utils-DSYLl3sO.mjs";
import { load } from "cheerio";
//#region lib/routes/bbc/topic-zhongwen.ts
const route = {
	path: "/zhongwen/topics/:topic/:variant?",
	name: "Topics - BBC News 中文",
	maintainers: ["TonyRL"],
	handler,
	example: "/bbc/zhongwen/topics/ckr7mn6r003t",
	parameters: {
		topic: "The topic ID to fetch news for, can be found in the URL.",
		variant: {
			description: "The language variant.",
			default: "trad",
			options: [{
				label: "简",
				value: "simp"
			}, {
				label: "繁",
				value: "trad"
			}]
		}
	},
	radar: [{ source: ["www.bbc.com/zhongwen/topics/:topic/:variant"] }],
	categories: ["traditional-media"]
};
async function handler(ctx) {
	const { topic, variant = "trad" } = ctx.req.param();
	const link = `https://www.bbc.com/zhongwen/topics/${topic}/${variant}`;
	const $ = load(await rofetch(link));
	const pageData = JSON.parse($("script#__NEXT_DATA__").text()).props.pageProps.pageData;
	const list = pageData.curations[0].summaries.map((item) => ({
		title: item.title,
		link: item.link,
		pubDate: parseDate(item.firstPublished),
		image: item.imageUrl ? item.imageUrl.replace("/{width}/", "/1536/") : void 0
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { category, description } = await fetchBbcContent(item.link, item);
		item.category = category;
		item.description = description;
		return item;
	})));
	return {
		title: `${pageData.title} - BBC News 中文`,
		description: pageData.description,
		link,
		image: "https://www.bbc.com/favicon.ico",
		item: items
	};
}
//#endregion
export { route };
