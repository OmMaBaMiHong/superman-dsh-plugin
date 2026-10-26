import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/dangdang/notice.ts
const typeMap = {
	0: "全部",
	1: "其他",
	2: "规则变更"
};
/**
*
* @param ctx {import('koa').Context}
*/
const route = {
	path: "/notice/:type?",
	categories: ["programming"],
	example: "/dangdang/notice/1",
	parameters: { type: "公告分类，默认为全部" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "公告",
	maintainers: ["353325487"],
	handler,
	description: `| 类型     | type |
| -------- | ---- |
| 全部     | 0    |
| 其他     | 1    |
| 规则变更 | 2    |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const list = (await got_default({
		method: "get",
		url: `https://open.dangdang.com/op-api/developer-platform/document/menu/list?categoryId=3&type=${type > 0 ? typeMap[type] : ""}`
	})).data.data.documentMenu.map((item) => ({
		title: item.title,
		description: item.type,
		documentId: item.documentId,
		source: `https://open.dangdang.com/op-api/developer-platform/document/info/get?document_id=${item.documentId}`,
		link: `https://open.dangdang.com/home/notice/message/1/${item.documentId}`,
		pubDate: timezone(parseDate(item.modifyTime), 8)
	}));
	const result = await Promise.all(list.map((item) => cache_default.tryGet(item.source, async () => {
		item.description = (await got_default(item.source)).data.data.documentContentList[0].content;
		return item;
	})));
	return {
		title: `当当开放平台 - ${typeMap[type] || typeMap[0]}`,
		link: "https://open.dangdang.com/home/notice/message/1",
		item: result
	};
}
//#endregion
export { route };
