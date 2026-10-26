import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as getFullText } from "./utils-BOvP2_rk.mjs";
//#region lib/routes/cna/index.ts
const route = {
	path: "/:id?",
	categories: ["traditional-media"],
	example: "/cna/aall",
	parameters: { id: "分类 id 或新闻专题 id。分类 id 见下表，新闻专题 id 為 https://www.cna.com.tw/list/newstopic.aspx 中，連結的數字部份。此參數默认为 aall" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "分类",
	maintainers: ["nczitzk"],
	handler,
	description: `| 聚焦      | 即時 | 政治 | 國際 | 兩岸 | 產經 | 證券 | 科技 | 生活 | 社會 | 地方 | 文化 | 運動 | 娛樂 |
| --------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| headlines | aall | aipl | aopl | acn  | aie  | asc  | ait  | ahel | asoc | aloc | acul | aspt | amov |`
};
async function handler(ctx) {
	const id = ctx.req.param("id") || "aall";
	const isTopic = /^\d+$/.test(id);
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20;
	const { data: response } = await got_default({
		method: "post",
		url: `https://www.cna.com.tw/cna2018api/api/${isTopic ? "WTopic" : "WNewsList"}`,
		json: {
			action: "0",
			category: isTopic ? "newstopic" : id,
			tno: isTopic ? id : void 0,
			pagesize: limit,
			pageidx: 1
		}
	});
	const { ResultData: { MetaData: metadata }, ResultData: resultData } = response;
	const list = (isTopic ? resultData.Topic.NewsItems : resultData.Items).slice(0, limit).map((item) => ({
		title: item.HeadLine,
		link: item.PageUrl,
		pubDate: timezone(parseDate(item.CreateTime), 8)
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => await getFullText(item))));
	return {
		title: metadata.Title,
		description: metadata.Description,
		link: metadata.CanonicalUrl,
		image: metadata.Image,
		item: items
	};
}
//#endregion
export { route };
