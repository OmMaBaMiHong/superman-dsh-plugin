import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/qq/lol/news.ts
const handler = async (ctx) => {
	const { category = 23 } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://lol.qq.com";
	const apiBaseUrl = "https://apps.game.qq.com";
	const targetUrl = new URL("news/index.shtml", baseUrl).href;
	const apiListUrl = new URL("cmc/zmMcnTargetContentList", apiBaseUrl).href;
	const apiInfoUrl = new URL("cmc/zmMcnContentInfo", apiBaseUrl).href;
	const response = await rofetch(apiListUrl, { query: {
		page: 1,
		num: limit,
		target: category
	} });
	const targetResponse = await rofetch(targetUrl, { responseType: "arrayBuffer" });
	const $ = load(iconv.decode(Buffer.from(targetResponse), "gbk"));
	const language = $("html").attr("lang") ?? "zh-CN";
	let items = response.data.result.slice(0, limit).map((item) => {
		const title = item.sTitle;
		const pubDate = item.sCreated;
		const linkUrl = item.iDocID ? `${item.iVideoId ? "v/v2" : "news"}/detail.shtml?docid=${item.iDocID}` : void 0;
		const authors = item.sAuthor ? [{
			name: item.sAuthor,
			avatar: item.sCreaterHeader
		}] : void 0;
		const guid = item.iDocID;
		const image = item.sIMG ? item.sIMG.startsWith("http") ? item.sIMG : `https:${item.sIMG}` : void 0;
		const updated = item.updated ?? pubDate;
		return {
			title,
			pubDate: pubDate ? timezone(parseDate(pubDate), 8) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			author: authors,
			guid,
			id: guid,
			image,
			banner: image,
			updated: updated ? timezone(parseDate(updated), 8) : void 0,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const result = (await rofetch(apiInfoUrl, { query: {
				type: 0,
				docid: item.guid
			} }))?.data?.result ?? void 0;
			if (!result) return item;
			const title = result.sTitle;
			const description = result.sContent;
			const pubDate = result.sCreated;
			const linkUrl = result.iDocID ? `${result.iVideoId ? "v/v2" : "news"}/detail.shtml?docid=${result.iDocID}` : void 0;
			const authors = result.sAuthor ? [{
				name: result.sAuthor,
				avatar: result.sCreaterHeader
			}] : void 0;
			const guid = `qq-lol-${result.iDocID}`;
			const image = result.sIMG ? result.sIMG.startsWith("http") ? result.sIMG : `https:${result.sIMG}` : void 0;
			const updated = result.sIdxTime ?? pubDate;
			const processedItem = {
				title,
				description,
				pubDate: pubDate ? timezone(parseDate(pubDate), 8) : void 0,
				link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
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
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	return {
		title: `${$("div.website-path a").toArray().map((a) => $(a).text()).join("")} - ${$(`li[data-newsId="${category}"]`).text()}`,
		description: $("meta[name=\"Description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: `https:${$("a.logo img").attr("src")}`,
		author: $("meta[name=\"author\"]").attr("content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/lol/news/:category?",
	name: "英雄联盟新闻",
	url: "lol.qq.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/qq/lol/news",
	parameters: { category: "分类，默认为 `23`，即综合，见下表" },
	description: `::: tip
若订阅 [英雄联盟首页新闻列表 - 公告](https://lol.qq.com/news/index.shtml)，网址为 \`https://lol.qq.com/news/index.shtml\`，请选择 \`24\` 作为 \`category\` 参数填入，此时目标路由为 [\`/qq/lol/news/24\`](https://rsshub.app/qq/lol/news/24)。
:::

| 综合 | 公告 | 赛事 | 攻略 | 社区 |
| ---- | ---- | ---- | ---- | ---- |
| 23   | 24   | 25   | 27   | 28   |`,
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
	radar: [
		{
			title: "综合",
			source: ["lol.qq.com/news/index.shtml"],
			target: "/lol/news/23"
		},
		{
			title: "公告",
			source: ["lol.qq.com/news/index.shtml"],
			target: "/lol/news/24"
		},
		{
			title: "赛事",
			source: ["lol.qq.com/news/index.shtml"],
			target: "/lol/news/25"
		},
		{
			title: "攻略",
			source: ["lol.qq.com/news/index.shtml"],
			target: "/lol/news/27"
		},
		{
			title: "社区",
			source: ["lol.qq.com/news/index.shtml"],
			target: "/lol/news/28"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
