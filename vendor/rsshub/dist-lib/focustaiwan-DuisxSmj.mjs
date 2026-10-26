import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/focustaiwan/index.tsx
const route = {
	path: "/:category?",
	categories: ["new-media"],
	example: "/focustaiwan",
	parameters: { category: "分类，见下表，默认为 news" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Category",
	maintainers: ["nczitzk"],
	handler,
	description: `| Latest | Editor's Picks | Photos of the Day |
| ------ | -------------- | ----------------- |
| news   | editorspicks   | photos            |

| Politics | Cross-strait | Business | Society | Science & Tech | Culture | Sports |
| -------- | ------------ | -------- | ------- | -------------- | ------- | ------ |
| politics | cross-strait | business | society | science & tech | culture | sports |`
};
async function handler(ctx) {
	const response = await got_default({
		method: "post",
		url: `https://focustaiwan.tw/cna2019api/cna/FTNewsList`,
		form: {
			action: 4,
			category: ctx.req.param("category") ?? "news",
			pageidx: 2,
			pagesize: 50
		}
	});
	const list = response.data.ResultData.Items.map((item) => ({
		title: item.HeadLine,
		link: item.PageUrl,
		category: item.ClassName,
		pubDate: timezone(parseDate(item.CreateTime), 8)
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		const content = load(detailResponse.data);
		content("img").each((_, el) => {
			content(el).html(`<img src="${content(el).attr("data-src")}">`);
		});
		const image = content("meta[property=\"og:image\"]").attr("content");
		const matches = detailResponse.data.match(/var pAudio_url = "(.*)\.mp3";/);
		if (matches) {
			item.enclosure_url = matches[1];
			item.enclosure_type = "audio/mpeg";
			item.itunes_item_image = image;
		}
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: image }), /* @__PURE__ */ jsx("div", { children: content(".paragraph").html() ? raw(content(".paragraph").html()) : null })] }));
		return item;
	})));
	return {
		title: response.data.ResultData.MetaData.Title,
		link: response.data.ResultData.MetaData.CanonicalUrl,
		item: items,
		itunes_author: "Focus Taiwan",
		image: "https://imgcdn.cna.com.tw/Eng/website/img/default.png"
	};
}
//#endregion
export { route };
