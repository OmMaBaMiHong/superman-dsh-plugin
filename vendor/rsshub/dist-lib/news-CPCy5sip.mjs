import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/mycard520/news.ts
const handler = async (ctx) => {
	const { category = "cardgame" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "18");
	const targetUrl = new URL(`category/${category.endsWith("/") ? category : `${category}/`}`, "https://app.mycard520.com.tw").href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-TW";
	$("div.page_numbers").remove();
	let items = $("div#tab1 ul li").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("a");
		const title = $el.find("div.text_box p").text();
		const description = $aEl.html() ?? void 0;
		const pubDateStr = $el.find("div.date").text().trim();
		const linkUrl = $aEl.attr("href");
		const image = $el.find("div.img_box img").attr("src");
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl,
			content: {
				html: description ?? "",
				text: description ?? ""
			},
			image,
			banner: image,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const $$pageBox = $$("div.page_box");
			const title = $$pageBox.find("h2").text();
			const pubDateStr = $$("div.date").first().text();
			const upDatedStr = pubDateStr;
			$$pageBox.find("h2, div.date, .the_champ_sharing_container").remove();
			const description = $$pageBox.html() ?? item.description;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
				content: {
					html: description ?? "",
					text: description ?? ""
				},
				updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	return {
		title: $("title").text(),
		description: $("meta[name=\"keywords\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("div.logo img").attr("src"),
		author: $("title").text().split(/-/).pop()?.trim(),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/category/:category?",
	name: "遊戲新聞",
	url: "app.mycard520.com.tw",
	maintainers: ["nczitzk"],
	handler,
	example: "/mycard520/category/cardgame",
	parameters: { category: {
		description: "分类，默认为 `cardgame`，即最新遊戲，可在对应分类页 URL 中找到",
		options: [
			{
				label: "最新遊戲",
				value: "cardgame"
			},
			{
				label: "手機遊戲",
				value: "cardgame-mobile"
			},
			{
				label: "PC 遊戲",
				value: "cardgame-pc"
			},
			{
				label: "電競賽事",
				value: "cardgame-esports"
			},
			{
				label: "實況直播",
				value: "cardgame-live"
			}
		]
	} },
	description: `::: tip
若订阅 [最新遊戲](https://app.mycard520.com.tw/category/cardgame/)，网址为 \`https://app.mycard520.com.tw/category/cardgame/\`，请截取 \`https://app.mycard520.com.tw/category/\` 到末尾 \`/\` 的部分 \`cardgame\` 作为 \`category\` 参数填入，此时目标路由为 [\`/mycard520/category/cardgame\`](https://rsshub.app/mycard520/category/cardgame)。
:::

| [最新遊戲](https://app.mycard520.com.tw/category/cardgame/) | [手機遊戲](https://app.mycard520.com.tw/category/cardgame-mobile/)       | [PC 遊戲](https://app.mycard520.com.tw/category/cardgame-pc/)    | [電競賽事](https://app.mycard520.com.tw/category/cardgame-esports/)        | [實況直播](https://app.mycard520.com.tw/category/cardgame-live/)     |
| ----------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [cardgame](https://rsshub.app/mycard520/category/cardgame)  | [cardgame-mobile](https://rsshub.app/mycard520/category/cardgame-mobile) | [cardgame-pc](https://rsshub.app/mycard520/category/cardgame-pc) | [cardgame-esports](https://rsshub.app/mycard520/category/cardgame-esports) | [cardgame-live](https://rsshub.app/mycard520/category/cardgame-live) |`,
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
			source: ["app.mycard520.com.tw/category/:category"],
			target: (params) => {
				const category = params.category;
				return `/mycard520${category ? `/${category}` : ""}`;
			}
		},
		{
			title: "最新遊戲",
			source: ["app.mycard520.com.tw/category/cardgame"],
			target: "/category/cardgame"
		},
		{
			title: "手機遊戲",
			source: ["app.mycard520.com.tw/category/cardgame-mobile"],
			target: "/category/cardgame-mobile"
		},
		{
			title: "PC 遊戲",
			source: ["app.mycard520.com.tw/category/cardgame-pc"],
			target: "/category/cardgame-pc"
		},
		{
			title: "電競賽事",
			source: ["app.mycard520.com.tw/category/cardgame-esports"],
			target: "/category/cardgame-esports"
		},
		{
			title: "實況直播",
			source: ["app.mycard520.com.tw/category/cardgame-live"],
			target: "/category/cardgame-live"
		}
	],
	view: 0,
	zh: {
		path: "/category/:category?",
		name: "游戏新闻",
		url: "app.mycard520.com.tw",
		maintainers: ["nczitzk"],
		handler,
		example: "/mycard520/category/cardgame",
		parameters: { category: {
			description: "分类，默认为 `cardgame`，即最新游戏，可在对应分类页 URL 中找到",
			options: [
				{
					label: "最新游戏",
					value: "cardgame"
				},
				{
					label: "手机游戏",
					value: "cardgame-mobile"
				},
				{
					label: "PC 游戏",
					value: "cardgame-pc"
				},
				{
					label: "电竞赛事",
					value: "cardgame-esports"
				},
				{
					label: "实况直播",
					value: "cardgame-live"
				}
			]
		} },
		description: `::: tip
若订阅 [最新游戏](https://app.mycard520.com.tw/category/cardgame/)，网址为 \`https://app.mycard520.com.tw/category/cardgame/\`，请截取 \`https://app.mycard520.com.tw/category/\` 到末尾 \`/\` 的部分 \`cardgame\` 作为 \`category\` 参数填入，此时目标路由为 [\`/mycard520/category/cardgame\`](https://rsshub.app/mycard520/category/cardgame)。
:::

| [最新游戏](https://app.mycard520.com.tw/category/cardgame/) | [手机游戏](https://app.mycard520.com.tw/category/cardgame-mobile/)       | [PC 游戏](https://app.mycard520.com.tw/category/cardgame-pc/)    | [电竞赛事](https://app.mycard520.com.tw/category/cardgame-esports/)        | [实况直播](https://app.mycard520.com.tw/category/cardgame-live/)     |
| ----------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [cardgame](https://rsshub.app/mycard520/category/cardgame)  | [cardgame-mobile](https://rsshub.app/mycard520/category/cardgame-mobile) | [cardgame-pc](https://rsshub.app/mycard520/category/cardgame-pc) | [cardgame-esports](https://rsshub.app/mycard520/category/cardgame-esports) | [cardgame-live](https://rsshub.app/mycard520/category/cardgame-live) |`
	}
};
//#endregion
export { handler, route };
