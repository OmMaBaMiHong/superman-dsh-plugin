import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/wtu/index.ts
const route = {
	path: "/:type",
	categories: ["university"],
	example: "/wtu/2",
	parameters: { type: "公告类型，详见表格" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "信息门户公告",
	maintainers: ["loyio"],
	handler,
	description: `| 公告类型 | 通知公告 | 教务信息 | 科研动态 |
| -------- | -------- | -------- | -------- |
| 参数     | 1        | 2        | 3        |`
};
async function handler(ctx) {
	const apiUrl = "https://ehall.wtu.edu.cn/wtu/api/queryBulletinListByConditional.do?pageNum=1&pageSize=20&columnId=";
	const listUrl = "https://ehall.wtu.edu.cn/new/list.html?type=";
	const psgUrl = "https://ehall.wtu.edu.cn/new/detail-word.html?";
	const map = /* @__PURE__ */ new Map([
		[1, {
			title: "通知公告",
			type: "2",
			id: "1994a3b58bef4ee887e1efc19881decd"
		}],
		[2, {
			title: "教务信息",
			type: "6",
			id: "36d47fcd3e774f289adfef1d93138a9d"
		}],
		[3, {
			title: "科研动态",
			type: "7",
			id: "48e8abfb983b4e4486b69feacad1dc1b"
		}]
	]);
	const typeInt = Number.parseInt(ctx.req.param("type"));
	const value = map.get(typeInt);
	const title = value.title;
	const columnId = value.id;
	const type = value.type;
	const resJson = (await got_default({
		method: "get",
		url: `${apiUrl}${columnId}`
	})).data.bulletinList;
	return {
		title: `${title} - 武汉纺织大学信息门户`,
		link: `${listUrl}${type}`,
		description: `${title} - 武汉纺织大学信息门户`,
		item: resJson.map((item) => ({
			title: item.TITLE,
			pubDate: timezone(parseDate(item.CREATE_TIME), 8),
			link: item.GOTO_URL ?? `${psgUrl}type=${type}?bulletinId=${item.WID}`,
			author: item.PUBLISH_USER_DEPT_NAME
		}))
	};
}
//#endregion
export { route };
