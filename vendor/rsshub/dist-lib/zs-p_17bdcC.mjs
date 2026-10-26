import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/xjtu/zs.ts
const handler = async (ctx) => {
	const { category = "zsxx1/zskx" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL(`${category}.htm`, "https://zs.xjtu.edu.cn").href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh";
	let items = $("section.TextList ul li").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("a.flex");
		const title = $aEl.text();
		const pubDateStr = $el.find("b").text();
		const linkUrl = $aEl.attr("href");
		const categoryEls = $el.find("i.zc").toArray();
		const categories = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
		const upDatedStr = pubDateStr;
		return {
			title,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl ? new URL(linkUrl, targetUrl).href : void 0,
			category: categories,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("div.show01 h5").text();
			const description = $$("div.v_news_content").html();
			const pubDateStr = $$("div.show01 i").text()?.match(/(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})/)?.[1];
			const categoryEls = $$("div.mianbao a").toArray().slice(1);
			const categories = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : item.pubDate,
				category: categories,
				content: {
					html: description,
					text: description
				},
				updated: upDatedStr ? timezone(parseDate(upDatedStr), 8) : item.updated,
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
		description: title.split(/-/, 1)[0],
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("div.logoimg img").attr("src"),
		author: $("META[Name=\"keywords\"]").attr("Content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/zs/:category{.+}?",
	name: "本科招生网",
	url: "zs.xjtu.edu.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/xjtu/zs/zsxx1/zskx",
	parameters: { category: {
		description: "分类，默认为 zsxx1/zskx，可在对应分类页 URL 中找到",
		options: [
			{
				label: "招生快讯",
				value: "zsxx1/zskx"
			},
			{
				label: "招生政策",
				value: "zsxx1/zszc"
			},
			{
				label: "招生计划",
				value: "zsxx1/zsjh"
			},
			{
				label: "阳光公告",
				value: "zsxx1/yggg"
			},
			{
				label: "历年录取",
				value: "zsxx1/lnlq"
			}
		]
	} },
	description: `::: tip
若订阅 [招生快讯](https://zs.xjtu.edu.cn/zsxx1/zskx.htm)，网址为 \`https://zs.xjtu.edu.cn/zsxx1/zskx.htm\`，请截取 \`https://zs.xjtu.edu.cn/\` 到末尾 \`.htm\` 的部分 \`zsxx1/zskx\` 作为 \`category\` 参数填入，此时目标路由为 [\`/xjtu/zs/zsxx1/zskx\`](https://rsshub.app/xjtu/zs/zsxx1/zskx)。
:::

| [招生快讯](https://zs.xjtu.edu.cn/zsxx1/zskx.htm)   | [招生政策](https://zs.xjtu.edu.cn/zsxx1/zszc.htm)   | [招生计划](https://zs.xjtu.edu.cn/zsxx1/zsjh.htm)   | [阳光公告](https://zs.xjtu.edu.cn/zsxx1/yggg.htm)   | [历年录取](https://zs.xjtu.edu.cn/zsxx1/lnlq.htm)   |
| --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| [zsxx1/zskx](https://rsshub.app/xjtu/zs/zsxx1/zskx) | [zsxx1/zszc](https://rsshub.app/xjtu/zs/zsxx1/zszc) | [zsxx1/zsjh](https://rsshub.app/xjtu/zs/zsxx1/zsjh) | [zsxx1/yggg](https://rsshub.app/xjtu/zs/zsxx1/yggg) | [zsxx1/lnlq](https://rsshub.app/xjtu/zs/zsxx1/lnlq) |`,
	categories: ["university"],
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
		source: ["zs.xjtu.edu.cn/:category"],
		target: (params) => {
			const category = params.category;
			return `/xjtu/zs${category ? `/${category}` : ""}`;
		}
	}],
	view: 0
};
//#endregion
export { handler, route };
