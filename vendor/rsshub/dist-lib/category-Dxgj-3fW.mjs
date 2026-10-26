import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/grainoil/category.ts
const handler = async (ctx) => {
	const { category, id } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "http://load.grainoil.com.cn";
	const targetUrl = new URL(`${category}/${id}.jspx`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	let items = $("div.m_listpagebox ol li a").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.find("b").text();
		const pubDateStr = $el.find("span").text().trim();
		const linkUrl = $el.attr("href");
		const upDatedStr = pubDateStr;
		return {
			title,
			pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : void 0,
			link: linkUrl,
			updated: upDatedStr ? timezone(parseDate(upDatedStr), 8) : void 0,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("div.m_tit h2").text();
			const description = $$("div.TRS_Editor").html() ?? "";
			const processedItem = {
				title,
				description,
				author: $$("div.m_tit h2 a").first().text(),
				content: {
					html: description,
					text: description
				},
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
		description: $("meta[http-equiv=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("div.top_logo img").attr("src") ? new URL($("div.top_logo img").attr("src"), baseUrl).href : void 0,
		author: $("meta[http-equiv=\"keywords\"]").attr("content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/:category/:id",
	name: "分类",
	url: "load.grainoil.com.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/grainoil/newsListHome/3",
	parameters: {
		category: {
			description: "分类，默认为 `newsListHome`，可在对应分类页 URL 中找到",
			options: [{
				label: "newsListHome",
				value: "newsListHome"
			}, {
				label: "newsListChannel",
				value: "newsListChannel"
			}]
		},
		id: { description: "分类 ID，可在对应分类页 URL 中找到" }
	},
	description: `::: tip
若订阅 [政务信息](http://load.grainoil.com.cn/newsListHome/1430.jspx)，网址为 \`http://load.grainoil.com.cn/newsListHome/1430.jspx\`，请截取 \`https://load.grainoil.com.cn/\` 到末尾 \`.jspx\` 的部分 \`newsListHome/1430\` 作为 \`category\` 和 \`id\`参数填入，此时目标路由为 [\`/grainoil/newsListHome/1430\`](https://rsshub.app/grainoil/newsListHome/1430)。
:::

<details>
  <summary>更多分类</summary>

| 分类     | ID                 |
| -------- | ------------------ |
| 政务信息 | newsListHome/1430  |
| 要闻动态 | newsListHome/3     |
| 产业经济 | newsListHome/1469  |
| 产业信息 | newsListHome/1471  |
| 爱粮节粮 | newsListHome/1470  |
| 政策法规 | newsListChannel/18 |
| 生产气象 | newsListChannel/19 |
| 统计资料 | newsListChannel/20 |
| 综合信息 | newsListChannel/21 |

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
			source: ["load.grainoil.com.cn/:category/:id"],
			target: (params) => {
				return `/grainoil/${params.category}/${params.id}`;
			}
		},
		{
			title: "政务信息",
			source: ["load.grainoil.com.cn/newsListHome/1430.jspx"],
			target: "/newsListHome/1430"
		},
		{
			title: "要闻动态",
			source: ["load.grainoil.com.cn/newsListHome/3.jspx"],
			target: "/newsListHome/3"
		},
		{
			title: "产业经济",
			source: ["load.grainoil.com.cn/newsListHome/1469.jspx"],
			target: "/newsListHome/1469"
		},
		{
			title: "产业信息",
			source: ["load.grainoil.com.cn/newsListHome/1471.jspx"],
			target: "/newsListHome/1471"
		},
		{
			title: "爱粮节粮",
			source: ["load.grainoil.com.cn/newsListHome/1470.jspx"],
			target: "/newsListHome/1470"
		},
		{
			title: "政策法规",
			source: ["load.grainoil.com.cn/newsListChannel/18.jspx"],
			target: "/newsListChannel/18"
		},
		{
			title: "生产气象",
			source: ["load.grainoil.com.cn/newsListChannel/19.jspx"],
			target: "/newsListChannel/19"
		},
		{
			title: "统计资料",
			source: ["load.grainoil.com.cn/newsListChannel/20.jspx"],
			target: "/newsListChannel/20"
		},
		{
			title: "综合信息",
			source: ["load.grainoil.com.cn/newsListChannel/21.jspx"],
			target: "/newsListChannel/21"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
