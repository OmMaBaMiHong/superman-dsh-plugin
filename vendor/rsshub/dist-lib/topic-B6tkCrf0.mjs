import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/modb/topic.ts
const route = {
	path: "/topic/:id",
	categories: ["programming"],
	example: "/modb/topic/44158",
	parameters: { id: "合辑序号" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "合辑",
	maintainers: ["yueneiqi"],
	handler
};
async function handler(ctx) {
	const baseUrl = "https://www.modb.pro";
	const topicId = ctx.req.param("id");
	const list = (await rofetch(`${baseUrl}/api/columns/getKnowledge`, { query: {
		pageNum: 1,
		pageSize: 20,
		columnId: topicId
	} })).list.map((item) => {
		let doc = {};
		let baseLink = {};
		switch (item.type) {
			case 0:
				doc = item.knowledge;
				baseLink = `${baseUrl}/db`;
				break;
			case 1:
				doc = item.dbDoc;
				baseLink = `${baseUrl}/doc`;
				break;
			default: logger.error(`unknown type ${item.type}`);
		}
		return {
			title: doc.title,
			link: `${baseLink}/${item.rid}`,
			pubDate: timezone(parseDate(item.createdTime), 8),
			author: doc.createdByName,
			category: doc.tags
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load(await rofetch(item.link))("div.editor-content-styl.article-style").first().html();
		return item;
	})));
	return {
		title: "墨天轮合辑",
		link: `${baseUrl}/topic/${topicId}`,
		item: items
	};
}
//#endregion
export { route };
