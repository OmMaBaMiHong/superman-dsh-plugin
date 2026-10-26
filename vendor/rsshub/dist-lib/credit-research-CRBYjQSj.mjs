import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/chinaratings/credit-research.ts
const handler = async (ctx) => {
	const { category = "Industry/Comment" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "15");
	const baseUrl = "https://www.chinaratings.com.cn";
	const targetUrl = new URL(`CreditResearch/${category.endsWith("/") ? category : `${category}/`}`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = "zh-CN";
	let items = $("div.contRight ul.list li").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("a");
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
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const detailResponse = await rofetch(item.link);
			const $$ = load(detailResponse);
			const title = $$("div.newshead h2, div.title h3").text();
			const description = $$("div.news div.content").html() ?? "";
			const metaStr = $$("div.newshead p span, div.title p span").text();
			const pubDateStr = metaStr?.match(/(\d{4}-\d{2}-\d{2})/)?.[1];
			const authors = metaStr?.match(/来源：(.*)/)?.[1];
			const upDatedStr = pubDateStr;
			let processedItem = {
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
			const docUrl = detailResponse.match(/(\/upload\/docs\/\d{4}-\d{2}-\d{2}\/doc_\d+)"/)?.[1];
			const enclosureUrl = docUrl ? `${new URL(docUrl, baseUrl).href}.pdf` : void 0;
			if (enclosureUrl) processedItem = {
				...processedItem,
				enclosure_url: enclosureUrl,
				enclosure_type: "application/pdf",
				enclosure_title: title
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
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("a.logo_c").attr("href") ? new URL($("a.logo_c").attr("href"), targetUrl).href : void 0,
		author: title.split(/-/).pop(),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/CreditResearch/:category{.+}?",
	name: "中债研究",
	url: "www.chinaratings.com.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/chinaratings/CreditResearch",
	parameters: { category: "分类，默认为 `Industry/Comment`，即行业评论，可在对应分类页 URL 中找到" },
	description: `::: tip
若订阅 [行业评论](https://www.chinaratings.com.cn/CreditResearch/Industry/Comment/)，网址为 \`https://www.chinaratings.com.cn/CreditResearch/Industry/Comment/\`，请截取 \`https://www.chinaratings.com.cn/CreditResearch/\` 到末尾 \`/\` 的部分 \`Industry/Comment\` 作为 \`category\` 参数填入，此时目标路由为 [\`/chinaratings/CreditResearch/Industry/Comment\`](https://rsshub.app/chinaratings/CreditResearch/Industry/Comment)。
:::`,
	categories: ["finance"],
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
		source: ["www.chinaratings.com.cn/CreditResearch/:category"],
		target: (params) => {
			const category = params.category;
			return `/chinaratings/CreditResearch${category ? `/${category}` : ""}`;
		}
	}],
	view: 0
};
//#endregion
export { handler, route };
