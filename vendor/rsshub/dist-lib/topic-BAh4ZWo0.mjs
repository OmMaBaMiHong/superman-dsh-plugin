import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as fetchBbcContent } from "./utils-DSYLl3sO.mjs";
import { load } from "cheerio";
//#region lib/routes/bbc/topic.ts
const route = {
	path: "/topics/:topic",
	name: "Topics",
	maintainers: ["TonyRL"],
	handler,
	example: "/bbc/topics/c77jz3md4rwt",
	parameters: { topic: "The topic ID to fetch news for, can be found in the URL." },
	radar: [{ source: ["www.bbc.com/news/topics/:topic"] }],
	categories: ["traditional-media"]
};
async function handler(ctx) {
	const { topic } = ctx.req.param();
	const link = `https://www.bbc.com/news/topics/${topic}`;
	const $ = load(await rofetch(link));
	const pageProps = JSON.parse($("script#__NEXT_DATA__").text()).props.pageProps;
	const topicData = pageProps.page[pageProps.pageKey];
	const list = topicData.sections[0].content.map((item) => ({
		title: item.title,
		link: `https://www.bbc.com${item.href}`,
		description: item.description,
		pubDate: parseDate(item.metadata.firstUpdated),
		category: item.metadata.topics,
		image: item.image ? item.image.model.blocks.src : void 0
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { category, description } = await fetchBbcContent(item.link, item);
		item.category = category;
		item.description = description;
		return item;
	})));
	return {
		title: topicData.seo.title,
		description: topicData.seo.description,
		link,
		image: "https://www.bbc.com/favicon.ico",
		item: items
	};
}
//#endregion
export { route };
