import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as renderDescription } from "./description-ZXJHCPET.mjs";
import { load } from "cheerio";
//#region lib/routes/ali213/zl.ts
const handler = async (ctx) => {
	const { category } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "1");
	const rootUrl = "https://www.ali213.net";
	const apiRootUrl = "https://mp.ali213.net";
	const targetUrl = new URL(`/news/zl/${category ? category.endsWith("/") ? category : `${category}/` : ""}`, rootUrl).href;
	const apiUrl = new URL("ajax/newslist", apiRootUrl).href;
	const response = await rofetch(apiUrl, { query: { type: "new" } });
	const $ = load(await rofetch(targetUrl));
	const language = $("html").prop("lang") ?? "zh";
	let items = JSON.parse(response.replace(/^\((.*)\)$/, "$1")).data.slice(0, limit).map((item) => {
		const title = item.Title;
		const description = renderDescription({ intro: item.GuideRead ?? "" });
		const guid = `ali213-zl-${item.ID}`;
		const image = item.PicPath ? `https:${item.PicPath}` : void 0;
		const author = item.xiaobian;
		return {
			title,
			description,
			pubDate: parseDate(item.addtime * 1e3),
			link: item.url ? `https:${item.url}` : void 0,
			author,
			guid,
			id: guid,
			content: {
				html: description,
				text: item.GuideRead ?? ""
			},
			image,
			banner: image,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link && typeof item.link !== "string") return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("h1.newstit").text();
			let description = $$("div#Content").html() ?? "";
			const pageLinks = [];
			$$("a.currpage").parent().find("a:not(.currpage)").each((_, el) => {
				const href = $$(el).attr("href");
				if (href) pageLinks.push(href);
			});
			const pageContents = await Promise.all(pageLinks.map(async (link) => {
				return load(await rofetch(new URL(link, item.link).href))("div#Content").html() ?? "";
			}));
			description += pageContents.join("");
			description = renderDescription({ description });
			const extraLinks = $$("div.extend_read a").toArray().map((el) => {
				const $$el = $$(el);
				return {
					url: $$el.prop("href"),
					type: "related",
					content_html: $$el.text()
				};
			}).filter((_) => true);
			return {
				title,
				description,
				pubDate: item.pubDate,
				category: $$(".category").toArray().map((c) => $$(c).text()),
				author: item.author,
				doi: $$("meta[name=\"citation_doi\"]").prop("content") || void 0,
				guid: item.guid,
				id: item.guid,
				content: {
					html: description,
					text: description
				},
				image: item.image,
				banner: item.image,
				language,
				_extra: { links: extraLinks.length > 0 ? extraLinks : void 0 }
			};
		});
	}))).filter((_) => true);
	const title = $("title").text();
	const feedImage = new URL("news/images/dxhlogo.png", rootUrl).href;
	return {
		title,
		description: $("meta[name=\"description\"]").prop("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: feedImage,
		author: title.split(/_/).pop(),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/zl/:category?",
	name: "大侠号",
	url: "www.ali213.net",
	maintainers: ["nczitzk"],
	handler,
	example: "/ali213/zl",
	parameters: { category: "分类，默认为首页，可在对应分类页 URL 中找到" },
	description: `::: tip
若订阅 [游戏](https://www.ali213.net/news/zl/game/)，网址为 \`https://www.ali213.net/news/zl/game/\`，请截取 \`https://www.ali213.net/news/zl/\` 到末尾 \`/\` 的部分 \`game\` 作为 \`category\` 参数填入，此时目标路由为 [\`/ali213/zl/game\`](https://rsshub.app/ali213/zl/game)。
:::

| 首页                                     | 游戏                                         | 动漫                                           | 影视                                           | 娱乐                                           |
| ---------------------------------------- | -------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| [index](https://www.ali213.net/news/zl/) | [game](https://www.ali213.net/news/zl/game/) | [comic](https://www.ali213.net/news/zl/comic/) | [movie](https://www.ali213.net/news/zl/movie/) | [amuse](https://www.ali213.net/news/zl/amuse/) |`,
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
			source: ["www.ali213.net/news/zl/:category"],
			target: (params) => {
				const category = params.category;
				return `/ali213/zl${category ? `/${category}` : ""}`;
			}
		},
		{
			title: "首页",
			source: ["www.ali213.net/news/zl/"],
			target: "/zl"
		},
		{
			title: "游戏",
			source: ["www.ali213.net/news/zl/game/"],
			target: "/zl/game"
		},
		{
			title: "动漫",
			source: ["www.ali213.net/news/zl/comic/"],
			target: "/zl/comic"
		},
		{
			title: "影视",
			source: ["www.ali213.net/news/zl/movie/"],
			target: "/zl/movie"
		},
		{
			title: "娱乐",
			source: ["www.ali213.net/news/zl/amuse/"],
			target: "/zl/amuse"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
