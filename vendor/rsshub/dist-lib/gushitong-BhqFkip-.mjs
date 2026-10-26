import "./types-DNj6Etbg.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/baidu/gushitong/index.tsx
const STATUS_MAP = {
	up: "上涨",
	down: "下跌"
};
const route = {
	path: "/gushitong/index",
	categories: ["finance"],
	view: 5,
	example: "/baidu/gushitong/index",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gushitong.baidu.com/"] }],
	name: "首页指数",
	maintainers: ["CaoMeiYouRen"],
	handler,
	url: "gushitong.baidu.com/"
};
async function handler() {
	return {
		title: "百度股市通",
		description: "百度股市通，汇聚全球金融市场的股票、基金、外汇、期货等实时行情，7*24小时覆盖专业财经资讯，提供客观、准确、及时、全面的沪深港美上市公司股价、财务、股东、分红等信息，让用户在复杂的金融市场，更简单的获取投资信息。",
		link: "https://gushitong.baidu.com/",
		item: (await got_default("https://finance.pae.baidu.com/api/indexbanner?market=ab&finClientType=pc")).data.Result.map((e) => ({
			title: e.name,
			description: renderToString(/* @__PURE__ */ jsxs("p", { children: [
				"市场：",
				e.market.toUpperCase(),
				/* @__PURE__ */ jsx("br", {}),
				"代码：",
				e.code,
				/* @__PURE__ */ jsx("br", {}),
				"名称：",
				e.name,
				/* @__PURE__ */ jsx("br", {}),
				"收盘价：",
				e.price,
				/* @__PURE__ */ jsx("br", {}),
				"涨跌幅：",
				e.ratio,
				/* @__PURE__ */ jsx("br", {}),
				"涨跌额：",
				e.increase,
				/* @__PURE__ */ jsx("br", {}),
				"走势：",
				STATUS_MAP[e.status],
				/* @__PURE__ */ jsx("br", {})
			] })),
			link: `https://gushitong.baidu.com/index/${e.market}-${e.code}`
		}))
	};
}
//#endregion
export { route };
