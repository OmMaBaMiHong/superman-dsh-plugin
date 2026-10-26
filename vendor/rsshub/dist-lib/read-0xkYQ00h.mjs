import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/nlc/read.tsx
const route = {
	path: "/read/:type?",
	categories: ["other"],
	example: "/nlc/read/电子图书",
	parameters: { type: "分类，见下表，默认为电子图书" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "读者云平台",
	maintainers: ["nczitzk"],
	handler,
	description: `| [电子图书](http://read.nlc.cn/outRes/outResList?type=电子图书) | [电子期刊](http://read.nlc.cn/outRes/outResList?type=电子期刊) | [电子论文](http://read.nlc.cn/outRes/outResList?type=电子论文) | [电子报纸](http://read.nlc.cn/outRes/outResList?type=电子报纸) | [音视频](http://read.nlc.cn/outRes/outResList?type=音视频) |
| -------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |

| [标准专利](http://read.nlc.cn/outRes/outResList?type=标准专利) | [工具书](http://read.nlc.cn/outRes/outResList?type=工具书) | [少儿资源](http://read.nlc.cn/outRes/outResList?type=少儿资源) |
| -------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------- |`
};
async function handler(ctx) {
	const { type = "电子图书" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 15;
	const author = "中国国家图书馆";
	const rootUrl = "http://read.nlc.cn";
	const currentUrl = new URL(`/outRes/outResList?type=${type}`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	const items = $("ul.YMH2019_New_GRZX_list7 li a.aa").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const title = item.find("span").first().text();
		return {
			title,
			link: item.prop("onclick").match(/openOutRes\('1','(.*?)','1',/)[1],
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [item.find("div.pic img").toArray().map((img) => {
				const src = $(img).prop("src");
				return src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
					src,
					alt: title
				}) }) : null;
			}), item.find("div.txt").prop("title") ? /* @__PURE__ */ jsx("p", { children: item.find("div.txt").prop("title") }) : null] })),
			author,
			category: [type],
			guid: `nlc-read#${item.prev().prop("onclick").match(/\('(\d+)'\)/)[1]}`
		};
	});
	const image = new URL("static/style/css/images/YMH_home_main_logo.png", rootUrl).href;
	const icon = new URL($("link[rel=\"shortcut icon\"]").prop("href"), rootUrl).href;
	return {
		item: items,
		title: `${$("title").text()} - ${type}`,
		link: currentUrl,
		description: type,
		language: "zh",
		image,
		icon,
		logo: icon,
		subtitle: type,
		author,
		allowEmpty: true
	};
}
//#endregion
export { route };
