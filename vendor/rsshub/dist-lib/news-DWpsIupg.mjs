import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ustb/tj/news.ts
const baseUrl = "http://tj.ustb.edu.cn";
const maps = {
	xyxw: "/Class/xyxw/index.htm",
	xshhd: "/Class/xshhd/index.htm",
	csjsxy: "/Class/csjsxy/index.htm",
	xxgcxy: "/Class/xxgcxy/index.htm",
	jjx: "/Class/jjx/index.htm",
	glxy: "/Class/glxy/index.htm",
	clx: "/Class/clx/index.htm",
	jxgcx: "/Class/jxgcx/index.htm",
	hlx: "/Class/hlx/index.htm",
	flx: "/Class/flx/index.htm",
	wyx: "/Class/wyx/index.htm",
	ysx: "/Class/ysx/index.htm"
};
function getNews(data) {
	return load(data)("div[class=\"classnews\"] ul li a").toArray().map((elem) => ({
		link: baseUrl + elem.attribs.href,
		title: elem.children[0].data,
		pubDate: timezone(parseDate(elem.attribs.href.split("/", 4)[3].split(".", 1)[0].slice(0, 14), "YYYYMMDDHHmmss"), 8)
	}));
}
const route = {
	path: "/tj/news/:type?",
	categories: ["university"],
	example: "/ustb/tj/news/all",
	parameters: { type: "默认为 `all`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "天津学院",
	maintainers: ["henbf"],
	handler,
	description: `| 全部 | 学院新闻 | 学术活动 | 城市建设学院 | 信息工程学院 | 经济学院 | 管理学院 | 材料系 | 机械工程系 | 护理系 | 法律系 | 外语系 | 艺术系 |
| ---- | -------- | -------- | ------------ | ------------ | -------- | -------- | ------ | ---------- | ------ | ------ | ------ | ------ |
| all  | xyxw     | xshhd    | csjsxy       | xxgcxy       | jjx      | glxy     | clx    | jxgcx      | hlx    | flx    | wyx    | ysx    |`
};
async function handler(ctx) {
	let type = ctx.req.param("type") || "all";
	if (!Object.keys(maps).includes(type)) type = "all";
	const responseData = {
		title: "北京科技大学天津学院新闻动态",
		link: baseUrl,
		item: null
	};
	if (type === "all") responseData.item = (await Promise.all(Object.values(maps).map(async (link) => {
		return getNews((await got_default(baseUrl + link)).data);
	}))).flat();
	else responseData.item = getNews((await got_default(baseUrl + maps[type])).data);
	return responseData;
}
//#endregion
export { route };
