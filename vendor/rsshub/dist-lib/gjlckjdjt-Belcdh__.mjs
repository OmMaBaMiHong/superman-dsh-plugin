import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/gov/forestry/templates/description.tsx
const renderDescription = ({ image, video }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [image ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt
}) }) : null, video ? /* @__PURE__ */ jsxs("video", {
	controls: true,
	children: [/* @__PURE__ */ jsx("source", { src: video.src }), /* @__PURE__ */ jsx("object", {
		data: video.src,
		children: /* @__PURE__ */ jsx("embed", { src: video.src })
	})]
}) : null] }));
//#endregion
//#region lib/routes/gov/forestry/gjlckjdjt.ts
const route = {
	path: "/gjlckjdjt/:category?",
	categories: ["government"],
	example: "/gov/forestry/gjlckjdjt",
	parameters: { category: "分类，见下表，默认为全部" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "国家林草科技大讲堂",
	maintainers: ["nczitzk"],
	handler,
	description: `| 分类     | id   |
| -------- | ---- |
| 经济林   | jjl  |
| 林木良种 | lmlz |
| 林下经济 | lxjj |
| 生态修复 | stxf |
| 用材林   | ycl  |
| 其他     | qt   |`
};
async function handler(ctx) {
	const { category = "gjlckjdjt" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const rootUrl = "http://www.forestry.gov.cn";
	const currentUrl = new URL(`${category}.jhtml`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("a.items").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const title = item.find("p.name").text();
		const link = new URL(item.prop("href"), rootUrl).href;
		const pubDateMatches = link.match(/\/\d{8}\//);
		return {
			title,
			link,
			description: renderDescription({ image: {
				src: item.find("img").prop("src"),
				alt: title
			} }),
			pubDate: pubDateMatches ? parseDate(pubDateMatches[1]) : void 0
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		content("p").each((_, e) => {
			e = content(e);
			if (e.find("img, video, embed.edui-faked-video").length === 0 && /^\s*$/.test(e.text())) e.remove();
		});
		content("video, embed.edui-faked-video").each((_, e) => {
			e = content(e);
			const src = e.prop("src");
			item.enclosure_url ??= src;
			e.replaceWith(renderDescription({ video: { src } }));
		});
		const pubDateMatches = item.link.match(/\/\d{8}\//);
		item.title = content("div.tit").text();
		item.description += content("div.zhengwen").html();
		item.pubDate = pubDateMatches ? parseDate(pubDateMatches[1]) : void 0;
		item.enclosure_type = item.enclosure_url ? "video/mp4" : void 0;
		return item;
	})));
	const icon = new URL("favicon.ico", rootUrl).href;
	return {
		item: items,
		title: $("title").text(),
		link: currentUrl,
		language: $("html").prop("lang"),
		image: new URL("r/cms/www/default/zhuanti/2021djt/images/top.png", rootUrl).href,
		icon,
		logo: icon,
		subtitle: $("div.weizhi").contents().last().text(),
		author: "国家林业和草原局",
		allowEmpty: true
	};
}
//#endregion
export { route };
