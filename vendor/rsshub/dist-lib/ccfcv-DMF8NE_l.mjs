import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/ccf/ccfcv/index.tsx
const rootUrl = "https://tc.ccf.org.cn";
const cateTitleMap = { xsdt: {
	xsqy: "学术前沿",
	rdzw: "热点征文",
	xshy: "学术会议"
} };
const route = {
	path: "/ccfcv/:channel/:category",
	categories: ["study"],
	example: "/ccf/ccfcv/xsdt/xsqy",
	parameters: {
		channel: "频道，仅支持 `xsdt`",
		category: "分类，见下表，亦可在网站 url 里找到"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "计算机视觉专委会 - 学术动态 - 分类",
	maintainers: ["elxy"],
	handler,
	description: `| 学术前沿 | 热点征文 | 学术会议 |
| -------- | -------- | -------- |
| xsqy     | rdzw     | xshy     |`
};
async function handler(ctx) {
	const channel = ctx.req.param("channel");
	const cate = ctx.req.param("category");
	const url = `${rootUrl}/ccfcv/${channel}/${cate}/`;
	const $ = load((await got_default(url)).data);
	let items = $("div.article-item").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("h3 a").text(),
			link: (cate === "xsqy" ? rootUrl : "") + item.find("h3 a").attr("href"),
			pubDate: parseDate(item.find("div p").text())
		};
	});
	if (cate === "xsqy") items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		let detailResponse;
		try {
			detailResponse = await got_default(item.link);
		} catch {
			item.status = 404;
		}
		if (item.status !== 404) item.description = renderToString(/* @__PURE__ */ jsx("center", { children: /* @__PURE__ */ jsx("embed", { src: load(detailResponse.data)("div.g-box1 p a").attr("href") }) }));
		delete item.status;
		return item;
	})));
	return {
		title: `计算机视觉专委 - ${cateTitleMap[channel][cate]}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
