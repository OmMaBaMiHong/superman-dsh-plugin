import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/cccmc/index.ts
const handler = async (ctx) => {
	const { category = "ywgg/tzgg" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "15");
	const baseUrl = "https://www.cccmc.org.cn";
	const targetUrl = new URL(category.endsWith("/") ? category : `${category}/`, baseUrl).href;
	const response = await rofetch(targetUrl);
	const $ = load(response);
	const language = $("html").attr("lang") ?? "zh-CN";
	let items = response.match(/\{url:'(.*)',title:'(.*)',time:'(.*)'\},/g)?.slice(0, limit).map((item) => {
		const matches = item.match(/'(.*?)'/);
		const title = matches?.[2] ?? "";
		const pubDateStr = matches?.[3];
		const linkUrl = matches?.[1];
		const upDatedStr = pubDateStr;
		return {
			title,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	}) ?? [];
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("div.title").text();
			const description = $$("div#article-content").html() ?? "";
			const pubDateStr = $$("span.time").text().split(/：/).pop();
			const authors = $$("span.form, span.from").toArray().map((authorEl) => {
				const $$authorEl = $$(authorEl);
				return { name: $$authorEl.text().split(/：/).pop() ?? $$authorEl.text() };
			});
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
				author: authors,
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
	}))).filter((_) => true);
	const title = $("title").text();
	return {
		title,
		description: title.split(/-/, 1)[0].trim(),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("img.logo").attr("src"),
		author: title.split(/-/)?.pop()?.trim(),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/:category{.+}?",
	name: "通用",
	url: "www.cccmc.org.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/cccmc/ywgg/tzgg",
	parameters: { category: "分类，默认为 `ywgg/tzgg`，即通知公告，可在对应分类页 URL 中找到, Category, `ywgg/tzgg`，即通知公告  by default" },
	description: `::: tip
若订阅 [综合政策](https://www.cccmc.org.cn/zcfg/zhzc/)，网址为 \`https://www.cccmc.org.cn/zcfg/zhzc/\`，请截取 \`https://www.cccmc.org.cn/\` 到末尾的部分 \`zcfg/zhzc\` 作为 \`category\` 参数填入，此时目标路由为 [\`/cccmc/zcfg/zhzc\`](https://rsshub.app/cccmc/zcfg/zhzc)。
:::

<details>
<summary>更多分类</summary>

#### [会员之家](https://www.cccmc.org.cn/hyzj)

| [会员之声](https://www.cccmc.org.cn/hyzj/hyzs/) | [会员动态](https://www.cccmc.org.cn/hyzj/hydt/) | [会员推介](https://www.cccmc.org.cn/hyzj/hytj/) |
| ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| [hyzj/hyzs](https://rsshub.app/cccmc/hyzj/hyzs) | [hyzj/hydt](https://rsshub.app/cccmc/hyzj/hydt) | [hyzj/hytj](https://rsshub.app/cccmc/hyzj/hytj) |

#### [政策法规](https://www.cccmc.org.cn/zcfg)

| [综合政策](https://www.cccmc.org.cn/zcfg/zhzc/) | [国内贸易](https://www.cccmc.org.cn/zcfg/gnmy/) | [对外贸易](https://www.cccmc.org.cn/zcfg/dwmy/) | [投资合作](https://www.cccmc.org.cn/zcfg/tzhz/) |
| ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| [zcfg/zhzc](https://rsshub.app/cccmc/zcfg/zhzc) | [zcfg/gnmy](https://rsshub.app/cccmc/zcfg/gnmy) | [zcfg/dwmy](https://rsshub.app/cccmc/zcfg/dwmy) | [zcfg/tzhz](https://rsshub.app/cccmc/zcfg/tzhz) |

#### [行业资讯](https://www.cccmc.org.cn/hyzx)

| [统计分析](https://www.cccmc.org.cn/hyzx/tjfx/) | [石油化工](https://www.cccmc.org.cn/hyzx/syhg/) | [金属矿产](https://www.cccmc.org.cn/hyzx/jskc/) | [五金建材](https://www.cccmc.org.cn/hyzx/wjjc/) |
| ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| [hyzx/tjfx](https://rsshub.app/cccmc/hyzx/tjfx) | [hyzx/syhg](https://rsshub.app/cccmc/hyzx/syhg) | [hyzx/jskc](https://rsshub.app/cccmc/hyzx/jskc) | [hyzx/wjjc](https://rsshub.app/cccmc/hyzx/wjjc) |

#### [商业机会](https://www.cccmc.org.cn/syjh/)+

| [供应信息](https://www.cccmc.org.cn/syjh/gyxx/) | [需求信息](https://www.cccmc.org.cn/syjh/xqxx/) | [合作信息](https://www.cccmc.org.cn/syjh/hzxx/) |
| ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| [syjh/gyxx](https://rsshub.app/cccmc/syjh/gyxx) | [syjh/xqxx](https://rsshub.app/cccmc/syjh/xqxx) | [syjh/hzxx](https://rsshub.app/cccmc/syjh/hzxx) |

#### [商会党建](https://www.cccmc.org.cn/shdj)

| [党群动态](https://www.cccmc.org.cn/shdj/dqdt/) | [党内法规](https://www.cccmc.org.cn/shdj/dnfg/) | [青年工作](https://www.cccmc.org.cn/shdj/qngz/) |
| ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| [shdj/dqdt](https://rsshub.app/cccmc/shdj/dqdt) | [shdj/dnfg](https://rsshub.app/cccmc/shdj/dnfg) | [shdj/qngz](https://rsshub.app/cccmc/shdj/qngz) |

</details>`,
	categories: ["new-media"],
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
			source: ["www.cccmc.org.cn/:category"],
			target: (params) => {
				const category = params.category;
				return `/cccmc${category ? `/${category}` : ""}`;
			}
		},
		{
			title: "商业机会 - 供应信息",
			source: ["www.cccmc.org.cn/syjh/gyxx/"],
			target: "/syjh/gyxx"
		},
		{
			title: "商业机会 - 需求信息",
			source: ["www.cccmc.org.cn/syjh/xqxx/"],
			target: "/syjh/xqxx"
		},
		{
			title: "商业机会 - 合作信息",
			source: ["www.cccmc.org.cn/syjh/hzxx/"],
			target: "/syjh/hzxx"
		},
		{
			title: "商会党建 - 党群动态",
			source: ["www.cccmc.org.cn/shdj/dqdt/"],
			target: "/shdj/dqdt"
		},
		{
			title: "商会党建 - 党内法规",
			source: ["www.cccmc.org.cn/shdj/dnfg/"],
			target: "/shdj/dnfg"
		},
		{
			title: "商会党建 - 青年工作",
			source: ["www.cccmc.org.cn/shdj/qngz/"],
			target: "/shdj/qngz"
		},
		{
			title: "行业资讯 - 统计分析",
			source: ["www.cccmc.org.cn/hyzx/tjfx/"],
			target: "/hyzx/tjfx"
		},
		{
			title: "行业资讯 - 石油化工",
			source: ["www.cccmc.org.cn/hyzx/syhg/"],
			target: "/hyzx/syhg"
		},
		{
			title: "行业资讯 - 金属矿产",
			source: ["www.cccmc.org.cn/hyzx/jskc/"],
			target: "/hyzx/jskc"
		},
		{
			title: "行业资讯 - 五金建材",
			source: ["www.cccmc.org.cn/hyzx/wjjc/"],
			target: "/hyzx/wjjc"
		},
		{
			title: "会员之家 - 会员之声",
			source: ["www.cccmc.org.cn/hyzj/hyzs/"],
			target: "/hyzj/hyzs"
		},
		{
			title: "会员之家 - 会员动态",
			source: ["www.cccmc.org.cn/hyzj/hydt/"],
			target: "/hyzj/hydt"
		},
		{
			title: "会员之家 - 会员推介",
			source: ["www.cccmc.org.cn/hyzj/hytj/"],
			target: "/hyzj/hytj"
		},
		{
			title: "政策法规 - 综合政策",
			source: ["www.cccmc.org.cn/zcfg/zhzc/"],
			target: "/zcfg/zhzc"
		},
		{
			title: "政策法规 - 国内贸易",
			source: ["www.cccmc.org.cn/zcfg/gnmy/"],
			target: "/zcfg/gnmy"
		},
		{
			title: "政策法规 - 对外贸易",
			source: ["www.cccmc.org.cn/zcfg/dwmy/"],
			target: "/zcfg/dwmy"
		},
		{
			title: "政策法规 - 投资合作",
			source: ["www.cccmc.org.cn/zcfg/tzhz/"],
			target: "/zcfg/tzhz"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
