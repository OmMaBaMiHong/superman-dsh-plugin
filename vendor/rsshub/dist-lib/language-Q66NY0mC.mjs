import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/chinadaily/templates/description.tsx
const renderDescription = ({ images, intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	images?.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt ?? void 0
	}) }) : null),
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null
] }));
//#endregion
//#region lib/routes/chinadaily/language.ts
const handler = async (ctx) => {
	const { category = "thelatest" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL(category, "https://language.chinadaily.com.cn").href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	let items = $("div.gy_box, ul.content_list li").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("a:not(.gy_box_img):not(.a_img)").first();
		const title = $aEl.text();
		const image = $el.find("a.gy_box_img img, a.a_img img").attr("src");
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: title
			}] : void 0,
			intro: $el.find("p.gy_box_txt3 a").text()
		});
		const linkUrl = $aEl.attr("href");
		return {
			title,
			description,
			link: linkUrl?.startsWith("//") ? `https:${linkUrl}` : linkUrl,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("meta[ property=\"og:title\"]").attr("content");
			const pubDateStr = $$("p.main_title3").text().split(/\s/).pop();
			const categories = $$("meta[name=\"keywords\"]").attr("content")?.split(/,/);
			const authorEls = $$("meta[name=\"source\"], meta[name=\"author\"], meta[name=\"editor\"]").toArray();
			const authors = [...new Set(authorEls.map((authorEl) => {
				return $$(authorEl).attr("content");
			}).filter((content) => content !== void 0))].map((name) => ({ name }));
			const image = $$("meta[property=\"og:image\"]").attr("content");
			const upDatedStr = pubDateStr;
			let processedItem = {
				title,
				pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : item.pubDate,
				category: categories,
				author: authors,
				image,
				banner: image,
				updated: upDatedStr ? timezone(parseDate(upDatedStr), 8) : item.updated,
				language
			};
			const enclosureUrl = $$("iframe#playerFrame, audio").first().attr("src");
			if (enclosureUrl) processedItem = {
				...processedItem,
				enclosure_url: enclosureUrl?.startsWith("//") ? `https:${enclosureUrl}` : enclosureUrl,
				enclosure_title: title,
				enclosure_length: void 0,
				itunes_duration: void 0,
				itunes_item_image: image
			};
			$$("div.urlShareArea").remove();
			const description = item.description + renderDescription({ description: $$("div#Content").html() ?? void 0 });
			processedItem = {
				...processedItem,
				description,
				content: {
					html: description,
					text: description
				}
			};
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	const title = $("title").text();
	const author = title.split(/-\s/).pop();
	return {
		title,
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("a.header2_logo1 img").attr("src"),
		author,
		language,
		itunes_author: author,
		itunes_category: "Language",
		id: targetUrl
	};
};
const route = {
	path: "/language/:category{.+}?",
	name: "英语点津",
	url: "language.chinadaily.com.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/chinadaily/language/thelatest",
	parameters: { category: {
		description: "分类，默认为 `thelatest`，即精彩推荐，可在对应分类页 URL 中找到, Category, `thelatest`，即精彩推荐  by default",
		options: [
			{
				label: "精彩推荐",
				value: "thelatest"
			},
			{
				label: "每日一词",
				value: "news_hotwords/word_of_the_day"
			},
			{
				label: "双语新闻",
				value: "news_bilingual"
			},
			{
				label: "新闻热词",
				value: "news_hotwords"
			},
			{
				label: "实用口语",
				value: "practice_tongue"
			},
			{
				label: "译词课堂",
				value: "trans_collect"
			},
			{
				label: "图片新闻",
				value: "news_photo"
			},
			{
				label: "视频精选",
				value: "video_links"
			},
			{
				label: "新闻播报",
				value: "audio_cd"
			},
			{
				label: "专栏作家",
				value: "columnist"
			},
			{
				label: "权威发布",
				value: "5af95d44a3103f6866ee845c"
			}
		]
	} },
	description: `::: tip
若订阅 [精彩推荐](https://language.chinadaily.com.cn/thelatest)，网址为 \`https://language.chinadaily.com.cn/thelatest\`，请截取 \`https://language.chinadaily.com.cn/\` 到末尾的部分 \`thelatest\` 作为 \`category\` 参数填入，此时目标路由为 [\`/chinadaily/language/thelatest\`](https://rsshub.app/chinadaily/language/thelatest)。
:::

<details>
  <summary>更多分类</summary>

| 分类                                                                         | ID                                                                                                        |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [精彩推荐](https://language.chinadaily.com.cn/thelatest)                     | [thelatest](https://rsshub.app/chinadaily/language/thelatest)                                             |
| [每日一词](https://language.chinadaily.com.cn/news_hotwords/word_of_the_day) | [news\\_hotwords/word\\_of\\_the\\_day](https://rsshub.app/chinadaily/language/news_hotwords/word_of_the_day) |
| [双语新闻](https://language.chinadaily.com.cn/news_bilingual)                | [news\\_bilingual](https://rsshub.app/chinadaily/language/news_bilingual)                                  |
| [新闻热词](https://language.chinadaily.com.cn/news_hotwords)                 | [news\\_hotwords](https://rsshub.app/chinadaily/language/news_hotwords)                                    |
| [实用口语](https://language.chinadaily.com.cn/practice_tongue)               | [practice\\_tongue](https://rsshub.app/chinadaily/language/practice_tongue)                                |
| [译词课堂](https://language.chinadaily.com.cn/trans_collect)                 | [trans\\_collect](https://rsshub.app/chinadaily/language/trans_collect)                                    |
| [图片新闻](https://language.chinadaily.com.cn/news_photo)                    | [news\\_photo](https://rsshub.app/chinadaily/language/news_photo)                                          |
| [视频精选](https://language.chinadaily.com.cn/video_links)                   | [video\\_links](https://rsshub.app/chinadaily/language/video_links)                                        |
| [新闻播报](https://language.chinadaily.com.cn/audio_cd)                      | [audio\\_cd](https://rsshub.app/chinadaily/language/audio_cd)                                              |
| [专栏作家](https://language.chinadaily.com.cn/columnist)                     | [audio\\_cd](https://rsshub.app/chinadaily/language/columnist)                                             |
| [权威发布](https://language.chinadaily.com.cn/5af95d44a3103f6866ee845c)      | [5af95d44a3103f6866ee845c](https://rsshub.app/chinadaily/language/5af95d44a3103f6866ee845c)               |

</details>`,
	categories: ["traditional-media"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	radar: [
		{
			source: ["language.chinadaily.com.cn/:category"],
			target: (params) => {
				const category = params.category;
				return `/chinadaily/language${category ? `/${category}` : ""}`;
			}
		},
		{
			title: "精彩推荐",
			source: ["language.chinadaily.com.cn/thelatest"],
			target: "/language/thelatest"
		},
		{
			title: "每日一词",
			source: ["language.chinadaily.com.cn/news_hotwords/word_of_the_day"],
			target: "/language/news_hotwords/word_of_the_day"
		},
		{
			title: "双语新闻",
			source: ["language.chinadaily.com.cn/news_bilingual"],
			target: "/language/news_bilingual"
		},
		{
			title: "新闻热词",
			source: ["language.chinadaily.com.cn/news_hotwords"],
			target: "/language/news_hotwords"
		},
		{
			title: "实用口语",
			source: ["language.chinadaily.com.cn/practice_tongue"],
			target: "/language/practice_tongue"
		},
		{
			title: "译词课堂",
			source: ["language.chinadaily.com.cn/trans_collect"],
			target: "/language/trans_collect"
		},
		{
			title: "图片新闻",
			source: ["language.chinadaily.com.cn/news_photo"],
			target: "/language/news_photo"
		},
		{
			title: "视频精选",
			source: ["language.chinadaily.com.cn/video_links"],
			target: "/language/video_links"
		},
		{
			title: "新闻播报",
			source: ["language.chinadaily.com.cn/audio_cd"],
			target: "/language/audio_cd"
		},
		{
			title: "专栏作家",
			source: ["language.chinadaily.com.cn/columnist"],
			target: "/language/columnist"
		},
		{
			title: "权威发布",
			source: ["language.chinadaily.com.cn/5af95d44a3103f6866ee845c"],
			target: "/language/5af95d44a3103f6866ee845c"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
