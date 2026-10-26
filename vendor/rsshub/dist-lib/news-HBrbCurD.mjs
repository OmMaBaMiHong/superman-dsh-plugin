import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/gamebase/news.tsx
const types = {
	newslist: "newsList",
	r18list: "newsPornList"
};
const renderDescription = ({ images, intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	images?.length ? images.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt
	}) }, image.src) : null) : null,
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null
] }));
const handler = async (ctx) => {
	const { type = "newslist", category = "all" } = ctx.req.param();
	if (!types.hasOwnProperty(type)) throw new InvalidParameterError(`Invalid type: ${type}`);
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://news.gamebase.com.tw";
	const targetUrl = new URL(`news${category === "all" ? "" : `/newslist?type=${category}`}`, baseUrl).href;
	const apiUrl = new URL("api/news/getNewsList", "https://api.gamebase.com.tw").href;
	const response = await rofetch(apiUrl, {
		method: "post",
		body: {
			GB_type: types[type],
			category,
			page: 1
		}
	});
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-TW";
	const items = await Promise.all(response.return_msg?.list?.slice(0, limit).map((item) => cache_default.tryGet(`gamebase-news-${item.news_no}`, async () => {
		const title = item.news_title;
		const pubDate = item.post_time;
		const linkUrl = item.news_no ? `news/detail/${item.news_no}` : void 0;
		const categories = [item.system];
		const authors = item.nickname;
		const guid = `gamebase-news-${item.news_no}`;
		const image = item.news_img;
		const updated = item.updated ?? pubDate;
		let metaDesc = item.news_meta?.meta_des;
		if (!metaDesc) metaDesc = ((await rofetch(item.link)).match(/(\\u003C.*?)","/)?.[1] ?? "").replaceAll(String.raw`\"`, "\"").replaceAll(/\\u([\da-f]{4})/gi, (match, hex) => String.fromCodePoint(Number.parseInt(hex, 16)));
		const description = renderDescription({
			images: image && !metaDesc ? [{
				src: image,
				alt: title
			}] : void 0,
			intro: item.news_short_desc,
			description: metaDesc
		});
		return {
			title,
			description,
			pubDate: pubDate ? timezone(parseDate(pubDate), 8) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			category: categories,
			author: authors,
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: updated ? timezone(parseDate(updated), 8) : void 0,
			language
		};
	})) ?? []);
	return {
		title: $("title").text(),
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: $("meta[property=\"og:title\"]").attr("content")?.split(/\|/).pop()?.trim(),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/news/:type?/:category?",
	name: "新聞",
	url: "news.gamebase.com.tw",
	maintainers: ["nczitzk"],
	handler,
	example: "/gamebase/news",
	parameters: {
		type: "類型，見下表，預設為 newslist",
		category: "分類，預設為 `all`，即全部，可在對應分類頁 URL 中找到"
	},
	description: `::: tip
若訂閱 [手機遊戲新聞](https://news.gamebase.com.tw/news/newslist?type=mobile)，網址為 \`https://news.gamebase.com.tw/news/newslist?type=mobile\`，請截取 \`https://news.gamebase.com.tw/news/\` 到末尾的部分 \`newslist\` 作為 \`type\` 參數填入，\`mobile\` 作為 \`category\` 參數填入，此時目標路由為 [\`/gamebase/news/newslist/mobile\`](https://rsshub.app/gamebase/news/newslist/mobile)。
:::

| newslist | r18list |
| -------- | ------- |`,
	categories: ["game"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["news.gamebase.com.tw/news", "news.gamebase.com.tw/news/:type"],
		target: (params, url) => {
			const type = params.type;
			const category = new URL(url).searchParams.get("type") ?? void 0;
			return `/gamebase/news${type ? `/${type}${category ? `/${category}` : ""}` : ""}`;
		}
	}],
	view: 0,
	zh: {
		path: "/news/:type?/:category?",
		name: "新闻",
		url: "news.gamebase.com.tw",
		maintainers: ["nczitzk"],
		handler,
		example: "/gamebase/news",
		parameters: {
			type: "类型，见下表，默认为 newslist",
			category: "分类，默认为 `all`，即全部，可在对应分类页 URL 中找到"
		},
		description: `::: tip
若订阅 [手机游戏新闻](https://news.gamebase.com.tw/news/newslist?type=mobile)，网址为 \`https://news.gamebase.com.tw/news/newslist?type=mobile\`，请截取 \`https://news.gamebase.com.tw/news/\` 到末尾的部分 \`newslist\` 作为 \`type\` 参数填入，\`mobile\` 作为 \`category\` 参数填入，此时目标路由为 [\`/gamebase/news/newslist/mobile\`](https://rsshub.app/gamebase/news/newslist/mobile)。
:::

| newslist | r18list |
| -------- | ------- |`
	}
};
//#endregion
export { handler, route };
