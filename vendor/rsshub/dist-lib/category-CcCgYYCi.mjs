import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import * as cheerio from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/famitsu/category.tsx
const baseUrl = "https://www.famitsu.com";
const route = {
	path: "/category/:category?",
	categories: ["game"],
	example: "/famitsu/category/new-article",
	parameters: { category: "Category, see table below, `new-article` by default" },
	radar: [{ source: ["www.famitsu.com/category/:category/page/1"] }],
	name: "Category",
	maintainers: ["TonyRL"],
	handler,
	description: `| 新着        | Switch | PS5 | PS4 | PC ゲーム | ニュース | 動画   | 特集・企画記事  | インタビュー | 取材・リポート | レビュー | インディーゲーム |
| ----------- | ------ | --- | --- | --------- | -------- | ------ | --------------- | ------------ | -------------- | -------- | ---------------- |
| new-article | switch | ps5 | ps4 | pc-game   | news     | videos | special-article | interview    | event-report   | review   | indie-game       |`
};
function getBuildId() {
	return cache_default.tryGet("famitsu:buildId", async () => {
		const data = await rofetch(baseUrl);
		const $ = cheerio.load(data);
		return JSON.parse($("#__NEXT_DATA__").text()).buildId;
	}, config.cache.routeExpire, false);
}
function render(data) {
	return renderToString(/* @__PURE__ */ jsx(FamitsuDescription, {
		bannerImage: data.bannerImage,
		content: data.content
	}));
}
function renderJSON(c) {
	if (Array.isArray(c.content)) return c.content.map((con) => con.type && renderJSON(con)).join("");
	switch (c.type) {
		case "B":
		case "INTERVIEWEE":
		case "STRONG": return `<b>${c.content}</b>`;
		case "HEAD": return `<h2>${c.content}</h2>`;
		case "SHEAD": return `<h3>${c.content}</h3>`;
		case "LINK_B":
		case "LINK_B_TAB": return `<a href="${c.url}"><b>${c.content}</b></a><br>`;
		case "IMAGE": return `<img src="${c.path}">`;
		case "NEWS": return `<a href="${c.url}">${c.content}<br>${c.description}</a><br>`;
		case "HTML": return c.content;
		case "ANNOTATION":
		case "CAPTION":
		case "ITEMIZATION":
		case "ITEMIZATION_NUM":
		case "NOLINK":
		case "PBOX":
		case "STRING":
		case "TWITTER":
		case "YOUTUBE": return `<div><span>${c.content}</span></div>`;
		case "BUTTON":
		case "BUTTON_ANDROID":
		case "BUTTON_EC":
		case "BUTTON_IOS":
		case "BUTTON_QUESTION":
		case "BUTTON_TAB":
		case "LINK":
		case "LINK_TAB": return `<a href="${c.url}">${c.content}</a><br>`;
		default: throw new Error(`Unhandle type: ${c.type}`);
	}
}
async function handler(ctx) {
	const { category = "new-article" } = ctx.req.param();
	const url = `${baseUrl}/category/${category}/page/1`;
	const buildId = await getBuildId();
	const data = await rofetch(`https://www.famitsu.com/_next/data/${buildId}/category/${category}/page/1.json`, { query: {
		categoryCode: category,
		pageNumber: 1
	} });
	const list = data.pageProps.categoryArticleDataForPc.filter((item) => !item.advertiserName).map((item) => {
		const publicationDate = item.publishedAt?.slice(0, 7).replace("-", "");
		return {
			title: item.title,
			link: `https://www.famitsu.com/article/${publicationDate}/${item.id}`,
			pubDate: parseDate(item.publishedAt),
			category: [.../* @__PURE__ */ new Set([item.mainCategory.nameJa, ...item.subCategories?.map((c) => c.nameJa) ?? []])],
			publicationDate,
			articleId: item.id
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const articleDetail = (await rofetch(`https://www.famitsu.com/_next/data/${buildId}/article/${item.publicationDate}/${item.articleId}.json`, { query: {
			publicationDate: item.publicationDate,
			articleId: item.articleId
		} })).pageProps.articleDetailData;
		item.author = articleDetail.authors?.map((a) => a.name_ja).join(", ") ?? articleDetail.user.name_ja;
		item.description = render({
			bannerImage: articleDetail.ogpImageUrl ?? articleDetail.thumbnailUrl,
			content: articleDetail.content.flatMap((c) => c.contents.map((con) => renderJSON(con))).join("")
		});
		return item;
	})));
	return {
		title: `${data.pageProps.targetCategory.nameJa}の最新記事 | ゲーム・エンタメ最新情報のファミ通.com`,
		image: "https://www.famitsu.com/img/1812/favicons/apple-touch-icon.png",
		link: url,
		item: items,
		language: "ja"
	};
}
const FamitsuDescription = ({ bannerImage, content }) => /* @__PURE__ */ jsxs(Fragment, { children: [bannerImage ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: bannerImage }), /* @__PURE__ */ jsx("br", {})] }) : null, content ? raw(content) : null] });
//#endregion
export { route };
