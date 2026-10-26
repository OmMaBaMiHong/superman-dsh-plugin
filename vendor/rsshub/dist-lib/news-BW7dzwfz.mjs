import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as renderDescription } from "./description-ZXJHCPET.mjs";
import { load } from "cheerio";
//#region lib/routes/ali213/news.ts
const handler = async (ctx) => {
	const { category = "new" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const rootUrl = "https://www.ali213.net";
	const targetUrl = new URL(`news/${category.endsWith("/") ? category : `${category}/`}`, rootUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").prop("lang") ?? "zh-CN";
	let items = $("div.n_lone").slice(0, limit).toArray().map((item) => {
		const $item = $(item);
		const aEl = $item.find("h2.lone_t a");
		const title = aEl.prop("title") || aEl.text();
		const link = aEl.prop("href");
		const imageEl = $item.find("img");
		const imageSrc = imageEl?.prop("src");
		const imageAlt = imageEl?.prop("alt");
		const intro = $item.find("div.lone_f_r_t").text();
		const description = renderDescription({
			images: imageEl ? [{
				src: imageSrc,
				alt: imageAlt
			}] : void 0,
			intro
		});
		const author = $item.find("div.lone_f_r_f span").last().text().split(/：/).pop();
		return {
			title,
			description,
			pubDate: parseDate($item.find("div.lone_f_r_f span").first().text()),
			link,
			author,
			content: {
				html: description,
				text: $item.find("div.lone_f_r_t").text()
			},
			image: imageSrc,
			banner: imageSrc,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link && typeof item.link !== "string") return item;
		return cache_default.tryGet(item.link, async () => {
			try {
				const $$ = load(await rofetch(item.link));
				const title = $$("h1.newstit").text();
				const image = $$("div#Content img").first().prop("src");
				const mediaContent = $$("div#Content p span img");
				const media = {};
				if (mediaContent.length) mediaContent.each((_, el) => {
					const $$el = $$(el);
					const pEl = $$el.closest("p");
					const mediaUrl = $$el.prop("src");
					const mediaType = mediaUrl?.split(/\./).pop();
					if (mediaType && mediaUrl) {
						media[mediaType] = { url: mediaUrl };
						pEl.replaceWith(renderDescription({ images: [{ src: mediaUrl }] }));
					}
				});
				const description = renderDescription({ description: $$("div#Content").html() ?? "" });
				const extraLinks = $$("div.extend_read ul li a").toArray().map((el) => {
					const $$el = $$(el);
					return {
						url: $$el.prop("href"),
						type: "related",
						content_html: $$el.prop("title") || $$el.text()
					};
				}).filter((_) => true);
				return {
					...item,
					title,
					description,
					pubDate: timezone(parseDate($$("div.newstag_l").text().split(/\s/, 1)[0]), 8),
					content: {
						html: description,
						text: $$("div#Content").html() ?? ""
					},
					image,
					banner: image,
					language,
					media: Object.keys(media).length > 0 ? media : void 0,
					_extra: { links: extraLinks.length > 0 ? extraLinks : void 0 }
				};
			} catch {
				return item;
			}
		});
	}))).filter((_) => true);
	const author = "游侠网";
	const title = $("div.news-list-title").text();
	const feedImage = new URL("news/images/ali213_app_big.png", rootUrl).href;
	return {
		title: `${author} - ${title}`,
		description: title,
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: feedImage,
		author,
		language,
		id: targetUrl
	};
};
const route = {
	path: "/news/:category?",
	name: "资讯",
	url: "www.ali213.net",
	maintainers: ["nczitzk"],
	handler,
	example: "/ali213/news/new",
	parameters: { category: "分类，默认为 `new`，即最新资讯，可在对应分类页 URL 中找到" },
	description: `::: tip
若订阅 [游戏资讯](https://www.ali213.net/news/game/)，网址为 \`https://www.ali213.net/news/game/\`，请截取 \`https://www.ali213.net/news/\` 到末尾 \`/\` 的部分 \`game\` 作为 \`category\` 参数填入，此时目标路由为 [\`/ali213/news/game\`](https://rsshub.app/ali213/news/game)。
:::

| 分类名称 | 分类 ID |
| -------- | ------- |
| 最新资讯 | new     |
| 评测     | pingce  |
| 游戏     | game    |
| 动漫     | comic   |
| 影视     | movie   |
| 科技     | tech    |
| 电竞     | esports |
| 娱乐     | amuse   |
| 手游     | mobile  |`,
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
			source: ["www.ali213.net/news/:category"],
			target: (params) => {
				const category = params.category;
				return `/news/${category ? `/${category}` : ""}`;
			}
		},
		{
			title: "最新资讯",
			source: ["www.ali213.net/news/new"],
			target: "/news/new"
		},
		{
			title: "评测",
			source: ["www.ali213.net/news/pingce"],
			target: "/news/pingce"
		},
		{
			title: "游戏",
			source: ["www.ali213.net/news/game"],
			target: "/news/game"
		},
		{
			title: "动漫",
			source: ["www.ali213.net/news/comic"],
			target: "/news/comic"
		},
		{
			title: "影视",
			source: ["www.ali213.net/news/movie"],
			target: "/news/movie"
		},
		{
			title: "科技",
			source: ["www.ali213.net/news/tech"],
			target: "/news/tech"
		},
		{
			title: "电竞",
			source: ["www.ali213.net/news/esports"],
			target: "/news/esports"
		},
		{
			title: "娱乐",
			source: ["www.ali213.net/news/amuse"],
			target: "/news/amuse"
		},
		{
			title: "手游",
			source: ["www.ali213.net/news/mobile"],
			target: "/news/mobile"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
