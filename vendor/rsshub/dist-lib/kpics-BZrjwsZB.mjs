import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as renderDescription } from "./description-B-3uLW1k.mjs";
import { load } from "cheerio";
//#region lib/routes/kpopping/kpics.ts
const handler = async (ctx) => {
	const { filter } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://kpopping.com";
	const targetUrl = new URL(`kpics${filter ? `/${filter}` : ""}`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = $("div.pics div.matrix div.cell").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.find("figcaption section").text();
		const description = renderDescription({ images: $el.find("a.picture img").attr("src") ? [{
			src: $el.find("a.picture img").attr("src"),
			alt: title
		}] : void 0 });
		const linkUrl = $el.find("a").first().attr("href");
		const authors = $el.find("figcaption section a").contents().last().text();
		const image = $el.find("a.picture img").attr("src");
		return {
			title,
			description,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			author: authors,
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
			const title = $$("h1").contents().first().text();
			const description = renderDescription({ description: $$("div.pics").first().html() });
			const pubDateStr = $$("meta[property=\"article:published_time\"]").attr("content");
			const categoryEls = $$("div.buttons a").toArray();
			const categories = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
			const authors = $$("div.content-snippet aside:not(.like)").toArray().map((authorEl) => {
				const $$authorEl = $$(authorEl);
				const $$authorAEl = $$authorEl.find("a").last();
				return {
					name: $$authorAEl.text(),
					url: new URL($$authorAEl.attr("href"), baseUrl).href,
					avatar: $$authorEl.find("img").attr("src")
				};
			});
			const image = $$("meta[name=\"twitter:image\"]").attr("content");
			const upDatedStr = $$("meta[property=\"article:modified_time\"]").attr("content");
			let processedItem = {
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
			const mediaEls = $$("div.pics").first().find("img").toArray();
			const medias = {};
			let imageCount = 1;
			for (const mediaEl of mediaEls) {
				const $$mediaEl = $$(mediaEl);
				const url = $$mediaEl.attr("src") ? new URL($$mediaEl.attr("src"), baseUrl).href : void 0;
				if (!url) continue;
				const medium = "image";
				const key = `${medium}${imageCount++}`;
				medias[key] = {
					url,
					medium,
					title: $$mediaEl.attr("alt") || title,
					description: $$mediaEl.attr("alt") || title,
					thumbnail: url
				};
			}
			if (Object.keys(medias).length > 0) processedItem = {
				...processedItem,
				media: medias
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
	path: "/kpics/:filter{.+}?",
	name: "Pics",
	url: "kpopping.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/kpopping/kpics/gender-male/category-all/idol-any/group-any/order",
	parameters: { filter: "Filter" },
	description: `::: tip
If you subscribe to [All male photo albums](https://kpopping.com/kpics/gender-male/category-all/idol-any/group-any/order)，where the URL is \`https://kpopping.com/kpics/gender-male/category-all/idol-any/group-any/order\`, extract the part \`https://kpopping.com/kpics/\` to the end, which is \`gender-male/category-all/idol-any/group-any/order\`, and use it as the parameter to fill in. Therefore, the route will be [\`/kpopping/kpics/gender-male/category-all/idol-any/group-any/order\`](https://rsshub.app/kpopping/kpics/gender-male/category-all/idol-any/group-any/order).
:::`,
	categories: ["picture"],
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
		source: ["kpopping.com/kpics/:filter"],
		target: (params) => {
			const filter = params.filter;
			return `/kpopping/kpics${filter ? `/${filter}` : ""}`;
		}
	}],
	view: 0,
	zh: {
		path: "/kpics/:filter{.+}?",
		name: "Pics",
		url: "kpopping.com",
		maintainers: ["nczitzk"],
		handler,
		example: "/kpopping/kpics/gender-male/category-all/idol-any/group-any/order",
		parameters: { filter: "筛选，可在对应分类页 URL 中找到" },
		description: `::: tip
若订阅 [All male photo albums](https://kpopping.com/kpics/gender-male/category-all/idol-any/group-any/order)，网址为 \`https://kpopping.com/kpics/gender-male/category-all/idol-any/group-any/order\`，请截取 \`https://kpopping.com/kpics/\` 到末尾的部分 \`gender-male/category-all/idol-any/group-any/order\` 作为 \`filter\` 参数填入，此时目标路由为 [\`/kpopping/kpics/gender-male/category-all/idol-any/group-any/order\`](https://rsshub.app/kpopping/kpics/gender-male/category-all/idol-any/group-any/order)。
:::`
	}
};
//#endregion
export { handler, route };
