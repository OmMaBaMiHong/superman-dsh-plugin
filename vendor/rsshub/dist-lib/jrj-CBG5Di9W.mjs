import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/jrj/index.ts
const options = {
	"103": "财经资讯",
	"508": "科技资讯",
	"106": "商业资讯",
	"632": "消费资讯",
	"630": "医疗资讯",
	"119": "康养资讯",
	"004": "汽车资讯",
	"009": "房产资讯",
	"629": "ESG 资讯",
	"010": "A股资讯",
	"001": "港股资讯",
	"102": "美股资讯",
	"113": "银行资讯",
	"115": "保险资讯",
	"104": "基金资讯",
	"503": "私募资讯",
	"112": "信托资讯",
	"007": "外汇资讯",
	"107": "期货资讯",
	"118": "债券资讯",
	"603": "券商资讯",
	"105": "观点"
};
const route = {
	path: "/:channelNum",
	categories: ["finance"],
	example: "/jrj/103",
	parameters: { channelNum: {
		description: "栏目编号",
		options: Object.entries(options).map(([value, label]) => ({
			value,
			label
		}))
	} },
	url: "www.jrj.com.cn",
	name: "资讯",
	description: `| column | Description |
| ------ | ----------- |
| 103    | 财经资讯    |
| 508    | 科技资讯    |
| 106    | 商业资讯    |
| 632    | 消费资讯    |
| 630    | 医疗资讯    |
| 119    | 康养资讯    |
| 004    | 汽车资讯    |
| 009    | 房产资讯    |
| 629    | ESG 资讯    |
| 001    | 港股资讯    |
| 102    | 美股资讯    |
| 113    | 银行资讯    |
| 115    | 保险资讯    |
| 104    | 基金资讯    |
| 503    | 私募资讯    |
| 112    | 信托资讯    |
| 007    | 外汇资讯    |
| 107    | 期货资讯    |
| 118    | 债券资讯    |
| 603    | 券商资讯    |
| 105    | 观点        |`,
	maintainers: ["p3psi-boo"],
	handler
};
async function handler(ctx) {
	const channelNum = ctx.req.param("channelNum");
	const list = (await rofetch("https://gateway.jrj.com/jrj-news/news/queryNewsList", {
		method: "post",
		body: {
			sortBy: 1,
			pageSize: 20,
			makeDate: "",
			channelNum,
			infoCls: ""
		}
	})).data.data.map((item) => {
		const link = item.pcInfoUrl;
		return {
			title: item.title,
			link,
			author: item.paperMediaSource,
			pubDate: parseDate(item.makeDate)
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const articleUrl = item.link;
		item.description = load(await rofetch(articleUrl))(".article_content").html();
		return item;
	})));
	return {
		title: `${options[channelNum]} - 金融界`,
		link: "https://jrj.com",
		item: items
	};
}
//#endregion
export { route };
