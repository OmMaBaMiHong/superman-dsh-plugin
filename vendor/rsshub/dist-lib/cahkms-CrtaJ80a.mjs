import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/cahkms/index.tsx
const titles = {
	"01": "关于我们",
	"02": "港澳新闻",
	"03": "重要新闻",
	"04": "顾问点评、会员观点",
	"05": "专题汇总",
	"06": "港澳时评",
	"07": "图片新闻",
	"08": "视频中心",
	"09": "港澳研究",
	10: "最新书讯",
	11: "研究资讯"
};
const route = {
	path: "/:category?",
	categories: ["new-media"],
	example: "/cahkms",
	parameters: { category: "分类，见下表，默认为重要新闻" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cahkms.org/"] }],
	name: "分类",
	maintainers: ["nczitzk"],
	handler,
	url: "cahkms.org/",
	description: `| 关于我们 | 港澳新闻 | 重要新闻 | 顾问点评、会员观点 | 专题汇总 |
| -------- | -------- | -------- | ------------------ | -------- |
| 01       | 02       | 03       | 04                 | 05       |

| 港澳时评 | 图片新闻 | 视频中心 | 港澳研究 | 最新书讯 | 研究资讯 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 06       | 07       | 08       | 09       | 10       | 11       |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "03";
	const rootUrl = "http://www.cahkms.org";
	const currentUrl = `${rootUrl}/HKMAC/indexMac/getRightList?dm=${category}&page=1&countPage=${ctx.req.query("limit") ?? 10}`;
	let items = (await got_default({
		method: "get",
		url: currentUrl
	})).data.filter((item) => item.ID).map((item) => ({
		title: item.TITLE,
		description: `<p>${item.GJZ}</p>`,
		pubDate: timezone(parseDate(item.JDRQ), 8),
		link: `${rootUrl}/HKMAC/indexMac/getWzxx?id=${item.ID}`
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		item.author = detailResponse.data.WZLY;
		const video = detailResponse.data.VIDEO.indexOf(".mp4") > 0 ? detailResponse.data.VIDEO : null;
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
			detailResponse.data.URL ? /* @__PURE__ */ jsx("img", { src: `${rootUrl}${detailResponse.data.URL}` }) : null,
			detailResponse.data.CONTENT ? raw(detailResponse.data.CONTENT) : null,
			video ? /* @__PURE__ */ jsx("video", {
				controls: true,
				children: /* @__PURE__ */ jsx("source", {
					src: `${rootUrl}${video}`,
					type: "video/mp4"
				})
			}) : null,
			detailResponse.data.fjlist?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsx("b", { children: "下载附件：" }),
				/* @__PURE__ */ jsx("br", {}),
				detailResponse.data.fjlist.map((file) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("a", {
					href: `${rootUrl}${file.URL}`,
					children: file.FJMC
				}), /* @__PURE__ */ jsx("br", {})] }))
			] }) : null
		] }));
		item.link = `${rootUrl}/HKMAC/webView/mc/AboutUs_1.html?${category}&${titles[category]}`;
		return item;
	})));
	return {
		title: `${titles[category]} - 全国港澳研究会`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
