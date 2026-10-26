import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./description-Cg5sBZFH.mjs";
import { load } from "cheerio";
//#region lib/routes/futunn/topic.ts
const route = {
	path: "/topic/:id",
	categories: ["finance"],
	example: "/futunn/topic/1267",
	parameters: { id: "Topic ID, can be found in URL" },
	features: { supportRadar: true },
	radar: [{
		source: ["news.futunn.com/news-topics/:id/*", "news.futunn.com/:lang/news-topics/:id/*"],
		target: "/topic/:id"
	}],
	name: "专题",
	maintainers: ["kennyfong19931"],
	handler
};
async function getTopic(rootUrl, id, seqMarkInput = "") {
	const { hasMore, seqMark, list } = (await got_default({
		method: "get",
		url: `${rootUrl}/news-site-api/main/get-topics-list?pageSize=48&seqMark=${seqMarkInput}`
	})).data.data.data;
	const topic = list.find((item) => item.idx === id);
	if (topic) return {
		topicTitle: topic.title,
		topicDescription: topic.detail
	};
	if (hasMore === 1) return getTopic(rootUrl, id, seqMark);
	return {
		topicTitle: "",
		topicDescription: ""
	};
}
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 48;
	const id = ctx.req.param("id");
	const rootUrl = "https://news.futunn.com";
	const link = `${rootUrl}/news-topics/${id}/`;
	const apiUrl = `${rootUrl}/news-site-api/topic/get-topics-news-list?topicsId=${id}&pageSize=${limit}`;
	const { topicTitle, topicDescription } = await cache_default.tryGet(link, async () => await getTopic(rootUrl, id));
	let items = (await got_default({
		method: "get",
		url: apiUrl
	})).data.data.data.map((item) => ({
		title: item.title,
		link: item.url,
		author: item.source,
		pubDate: parseDate(item.time * 1e3),
		description: renderDescription({
			abs: item.abstract,
			pic: item.pic
		})
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		if (/news\.futunn\.com/.test(item.link)) {
			const content = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			content(".futu-news-time-stamp").remove();
			content(".nnstock").each((_, el) => {
				content(el).replaceWith(`<a href="${content(el).attr("href")}">${content(el).text().replaceAll("$", "")}</a>`);
			});
			item.description = content(".origin_content").html();
			item.category = [...content(".news__from-topic__title").toArray().map((a) => content(a).text().trim()), ...content("#relatedStockWeb .stock-name").toArray().map((s) => content(s).text().trim())];
		}
		return item;
	})));
	return {
		title: `富途牛牛 - 专题 - ${topicTitle}`,
		link,
		description: topicDescription,
		item: items
	};
}
//#endregion
export { route };
