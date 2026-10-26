import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as parseToken } from "./cookies-CBhJvxcZ.mjs";
import sanitizeHtml from "sanitize-html";
import queryString from "query-string";
//#region lib/routes/xueqiu/stock-info.ts
const route = {
	path: "/stock_info/:id/:type?",
	categories: ["finance"],
	example: "/xueqiu/stock_info/SZ000002",
	parameters: {
		id: "股票代码（需要带上交易所）",
		type: "动态的类型, 不填则为股票公告"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["xueqiu.com/S/:id", "xueqiu.com/s/:id"],
		target: "/stock_info/:id"
	}],
	name: "股票信息",
	maintainers: ["YuYang"],
	handler,
	description: `| 全部 | 讨论    | 交易  | 资讯 | 公告         |
| ---- | ------- | ----- | ---- | ------------ |
| all  | discuss | trans | news | announcement |`
};
const typeMap = {
	all: {
		source: "all",
		label: "全部",
		endpoint: "search"
	},
	discuss: {
		source: "user",
		label: "讨论",
		endpoint: "search"
	},
	trans: {
		source: "trans",
		label: "交易",
		endpoint: "search"
	},
	news: {
		source: "自选股新闻",
		label: "资讯",
		endpoint: "timeline"
	},
	announcement: {
		source: "公告",
		label: "公告",
		endpoint: "timeline"
	}
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const type = ctx.req.param("type") || "announcement";
	if (!Object.hasOwn(typeMap, type)) throw new InvalidParameterError(`Invalid type: ${type}. Supported types: ${Object.keys(typeMap).join(", ")}`);
	const { source, label, endpoint } = typeMap[type];
	const link = `https://xueqiu.com/S/${id}`;
	const cookie = await parseToken(link);
	const stock_name = (await got_default({
		method: "get",
		url: "https://stock.xueqiu.com/v5/stock/quote.json",
		searchParams: queryString.stringify({ symbol: id }),
		headers: {
			Cookie: cookie,
			Referer: link
		}
	})).data.data?.quote?.name || id;
	const data = (await got_default({
		method: "get",
		url: endpoint === "search" ? "https://api.xueqiu.com/query/v1/symbol/search/status.json" : "https://api.xueqiu.com/statuses/stock_timeline.json",
		searchParams: queryString.stringify({
			symbol_id: id,
			symbol: id,
			source,
			count: 10,
			page: 1,
			sort: endpoint === "search" ? "time" : "alpha",
			comment: "0",
			hl: "0"
		}),
		headers: {
			Cookie: cookie,
			Referer: link
		}
	})).data.list;
	return {
		title: `${id} ${stock_name} - ${label}`,
		link,
		description: `${stock_name} - ${label}`,
		item: data.map((item) => ({
			title: item.title || sanitizeHtml(item.description, {
				allowedTags: [],
				allowedAttributes: {}
			}),
			description: item.description,
			pubDate: parseDate(item.created_at),
			link: `https://xueqiu.com${item.target}`
		}))
	};
}
//#endregion
export { route };
