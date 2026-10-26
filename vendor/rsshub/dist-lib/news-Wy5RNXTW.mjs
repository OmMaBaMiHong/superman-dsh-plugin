import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as renderDescription } from "./description-B-3uLW1k.mjs";
import { load } from "cheerio";
//#region lib/routes/kpopping/news.ts
const handler = async (ctx) => {
	const { filter } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "2");
	const baseUrl = "https://kpopping.com";
	const targetUrl = new URL(`news${filter ? `/${filter}` : ""}`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = $("section.news-list-item").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("h4.title-wr a").last();
		const title = $aEl.text();
		const pubDateStr = $el.find("time.datetime-wr").attr("datetime");
		const linkUrl = $aEl.attr("href");
		const categoryEls = [$el.find("h4.title-wr a").first()];
		const categories = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
		const authors = $el.find("aside.author-wr").toArray().map((authorEl) => {
			const $authorAEl = $(authorEl).find("a").last();
			return {
				name: $authorAEl.text(),
				url: new URL($authorAEl.attr("href"), baseUrl).href,
				avatar: new URL($el.find("aside.author-wr a img").attr("src"), baseUrl).href
			};
		});
		const upDatedStr = pubDateStr;
		return {
			title,
			pubDate: pubDateStr ? timezone(parseDate(pubDateStr, "MMM D, YYYY h:mma"), 8) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			category: categories,
			author: authors,
			doi: $el.find("meta[name=\"citation_doi\"]").attr("content"),
			updated: upDatedStr ? timezone(parseDate(upDatedStr, "MMM D, YYYY h:mma"), 8) : void 0,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("h1").contents().first().text();
			const description = renderDescription({
				images: $$("figure.opening img").attr("src") ? [{
					src: new URL($$("figure.opening img").attr("src"), baseUrl).href,
					alt: title
				}] : void 0,
				description: $$("div#article-content").html()
			});
			const pubDateStr = $$("meta[property=\"article:published_time\"]").attr("content");
			const categoryEls = $$("aside.info a, div.supplements a.item").toArray();
			const categories = [...new Set(categoryEls.map((el) => $$(el).text()?.trim()).filter(Boolean))];
			const authors = $$("div.content-snippet aside:not(.like)").toArray().map((authorEl) => {
				const $$authorEl = $$(authorEl);
				const $$authorAEl = $$authorEl.find("a").last();
				return {
					name: $$authorAEl.text(),
					url: new URL($$authorAEl.attr("href"), baseUrl).href,
					avatar: $$authorEl.find("img").attr("src")
				};
			});
			const image = $$("meta[property=\"og:image\"]").attr("content");
			const upDatedStr = $$("meta[property=\"article:modified_time\"]").attr("content");
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
				category: categories,
				author: authors,
				content: {
					html: description,
					text: description
				},
				image,
				banner: image,
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
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/news/:filter{.+}?",
	name: "News",
	url: "kpopping.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/kpopping/news/gender-all/category-all/idol-any/group-any/order",
	parameters: { filter: "Filter" },
	description: `::: tip
If you subscribe to [All male articles](https://kpopping.com/news/gender-male/category-all/idol-any/group-any/order)，where the URL is \`https://kpopping.com/news/gender-male/category-all/idol-any/group-any/order\`, extract the part \`https://kpopping.com/news\` to the end, which is \`gender-male/category-all/idol-any/group-any/order\`, and use it as the parameter to fill in. Therefore, the route will be [\`/kpopping/news/gender-male/category-all/idol-any/group-any/order\`](https://rsshub.app/kpopping/news/gender-male/category-all/idol-any/group-any/order).
:::`,
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
	radar: [{
		source: ["kpopping.com/news/:filter"],
		target: (params) => {
			const filter = params.filter;
			return `/kpopping/news${filter ? `/${filter}` : ""}`;
		}
	}],
	view: 0,
	zh: {
		path: "/news/:filter{.+}?",
		name: "News",
		url: "kpopping.com",
		maintainers: ["nczitzk"],
		handler,
		example: "/kpopping/news/gender-all/category-all/idol-any/group-any/order",
		parameters: { filter: "筛选，可在对应分类页 URL 中找到" },
		description: `::: tip
若订阅 [All male articles](https://kpopping.com/news/gender-male/category-all/idol-any/group-any/order)，网址为 \`https://kpopping.com/news/gender-male/category-all/idol-any/group-any/order\`，请截取 \`https://kpopping.com/news/\` 到末尾的部分 \`gender-male/category-all/idol-any/group-any/order\` 作为 \`filter\` 参数填入，此时目标路由为 [\`/kpopping/news/gender-male/category-all/idol-any/group-any/order\`](https://rsshub.app/kpopping/news/gender-male/category-all/idol-any/group-any/order)。
:::`
	}
};
//#endregion
export { handler, route };
