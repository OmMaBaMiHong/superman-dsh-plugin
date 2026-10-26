import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as parseArticle } from "./utils-DEYcDo1v2.mjs";
//#region lib/routes/sina/finance/stock/usstock.ts
const route = {
	path: "/finance/stock/usstock/:cids?",
	categories: ["new-media"],
	example: "/sina/finance/stock/usstock",
	parameters: { cids: "分区 id，见下表，默认为 `57045`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["finance.sina.com.cn/stock/usstock", "finance.sina.com.cn/"],
		target: "/finance/stock/usstock"
	}],
	name: "美股",
	maintainers: ["TonyRL"],
	handler,
	url: "finance.sina.com.cn/stock/usstock",
	description: `| 最新报道 | 中概股 | 国际财经 | 互联网 |
| -------- | ------ | -------- | ------ |
| 57045    | 57046  | 56409    | 40811  |`
};
async function handler(ctx) {
	const { cids = "57045" } = ctx.req.param();
	const { limit = "50" } = ctx.req.query();
	const { data: response } = await got_default("https://interface.sina.cn/pc_api/public_news_data.d.json", { searchParams: {
		cids,
		pdps: "",
		smartFlow: "",
		editLevel: "0,1,2,3",
		type: "std_news,std_slide,std_video",
		pageSize: limit,
		cTime: "1483200000",
		tm: Date.now(),
		up: "0",
		action: "0",
		_: Date.now()
	} });
	const list = response.data.map((item) => ({
		title: item.title,
		link: item.url,
		pubDate: parseDate(item.ctime, "X"),
		author: item.media
	}));
	return {
		title: "美股|美股行情|美股新闻 - 新浪财经",
		link: "https://finance.sina.com.cn/stock/usstock/",
		item: await Promise.all(list.map((item) => parseArticle(item)))
	};
}
//#endregion
export { route };
