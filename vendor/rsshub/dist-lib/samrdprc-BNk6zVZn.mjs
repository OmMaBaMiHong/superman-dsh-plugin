import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/samrdprc/index.ts
const handler = async (ctx) => {
	const { id = "xwdt/gzdt" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "17");
	const baseUrl = "https://www.samrdprc.org.cn";
	const targetUrl = new URL(id.endsWith("/") ? id : `${id}/`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh";
	let items = $("div.boxl_ul ul li").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("a").first();
		const title = $aEl.text();
		const pubDateStr = $el.find("span").text();
		const linkUrl = $aEl.attr("href");
		const upDatedStr = pubDateStr;
		return {
			title,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl ? new URL(linkUrl, targetUrl).href : void 0,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("div.show_tit").text();
			const description = $$("div.TRS_Editor div.TRS_Editor").html() ?? void 0;
			const pubDateStr = $$("div.show_tit2").text().split(/：/).pop()?.trim();
			const categories = $$("meta[name=\"keywords\"]").attr("content")?.split(/,/) ?? [];
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
				category: categories,
				content: {
					html: description,
					text: description
				},
				updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}));
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: new URL("images/logo_DPRC.png", baseUrl).href,
		author: $("meta[name=\"keyword\"]").attr("content")?.split(/,/, 1)[0],
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/:id{.+}?",
	name: "栏目",
	url: "www.samrdprc.org.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/samrdprc/xwdt/gzdt",
	parameters: { id: {
		description: "栏目 id，默认为 `xwdt/gzdt`，即国内新闻，可在对应分类页 URL 中找到",
		options: [
			{
				label: "新闻动态",
				value: "xwdt/gzdt"
			},
			{
				label: "网站公告",
				value: "wzgg"
			},
			{
				label: "汽车召回",
				value: "qczh"
			},
			{
				label: "消费品召回",
				value: "xfpzh"
			},
			{
				label: "技术报告",
				value: "yjgz/jsyj"
			},
			{
				label: "SAC/TC463",
				value: "yjgz/sactc"
			},
			{
				label: "研究动态",
				value: "yjgz/yjfx"
			},
			{
				label: "安全教育",
				value: "aqjy"
			},
			{
				label: "国内法规",
				value: "flfg/gnfg"
			}
		]
	} },
	description: `::: tip
订阅 [网站公告](https://www.samrdprc.org.cn/wzgg/)，其源网址为 \`https://www.samrdprc.org.cn/wzgg/\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/samrdprc/wzgg\`](https://rsshub.app/samrdprc/wzgg)。
:::

<details>
  <summary>更多分类</summary>

#### 网站首页

| [新闻动态](https://www.samrdprc.org.cn/xwdt/gzdt/) | [网站公告](https://www.samrdprc.org.cn/wzgg/) | [汽车召回](https://www.samrdprc.org.cn/qczh/) | [消费品召回](https://www.samrdprc.org.cn/xfpzh/) |
| -------------------------------------------------- | --------------------------------------------- | --------------------------------------------- | ------------------------------------------------ |
| [xwdt/gzdt](https://rsshub.app/samrdprc/xwdt/gzdt) | [wzgg](https://rsshub.app/samrdprc/wzgg)      | [qczh](https://rsshub.app/samrdprc/qczh)      | [xfpzh](https://rsshub.app/samrdprc/xfpzh)       |

#### 科学研究

| [技术报告](https://www.samrdprc.org.cn/yjgz/jsyj/) | [SAC/TC463](https://www.samrdprc.org.cn/yjgz/sactc/) | [研究动态](https://www.samrdprc.org.cn/yjgz/yjfx/) |
| -------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| [yjgz/jsyj](https://rsshub.app/samrdprc/yjgz/jsyj) | [yjgz/sactc](https://rsshub.app/samrdprc/yjgz/sactc) | [yjgz/yjfx](https://rsshub.app/samrdprc/yjgz/yjfx) |

#### 安全教育

| [安全教育](https://www.samrdprc.org.cn/aqjy/) |
| --------------------------------------------- |
| [aqjy](https://rsshub.app/samrdprc/aqjy)      |

#### 法律法规

| [国内法规](https://www.samrdprc.org.cn/flfg/gnfg/) |
| -------------------------------------------------- |
| [flfg/gnfg](https://rsshub.app/samrdprc/flfg/gnfg) |

</details>`,
	categories: ["government"],
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
			source: ["www.samrdprc.org.cn/:id"],
			target: "/:id"
		},
		{
			title: "网站首页 - 新闻动态",
			source: ["www.samrdprc.org.cn/xwdt/gzdt/"],
			target: "/xwdt/gzdt"
		},
		{
			title: "网站首页 - 网站公告",
			source: ["www.samrdprc.org.cn/wzgg/"],
			target: "/wzgg"
		},
		{
			title: "网站首页 - 汽车召回",
			source: ["www.samrdprc.org.cn/qczh/"],
			target: "/qczh"
		},
		{
			title: "网站首页 - 消费品召回",
			source: ["www.samrdprc.org.cn/xfpzh/"],
			target: "/xfpzh"
		},
		{
			title: "科学研究 - 技术报告",
			source: ["www.samrdprc.org.cn/yjgz/jsyj/"],
			target: "/yjgz/jsyj"
		},
		{
			title: "科学研究 - SAC/TC463",
			source: ["www.samrdprc.org.cn/yjgz/sactc/"],
			target: "/yjgz/sactc"
		},
		{
			title: "科学研究 - 研究动态",
			source: ["www.samrdprc.org.cn/yjgz/yjfx/"],
			target: "/yjgz/yjfx"
		},
		{
			title: "安全教育 - 安全教育",
			source: ["www.samrdprc.org.cn/aqjy/"],
			target: "/aqjy"
		},
		{
			title: "法律法规 - 国内法规",
			source: ["www.samrdprc.org.cn/flfg/gnfg/"],
			target: "/flfg/gnfg"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
