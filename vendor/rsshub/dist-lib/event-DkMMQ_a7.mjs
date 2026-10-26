import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as renderDescription } from "./description-BH7rFpWG.mjs";
import { load } from "cheerio";
//#region lib/routes/oschina/event.ts
const handler = async (ctx) => {
	const { category = "latest" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://www.oschina.net";
	const targetUrl = new URL(`event?tab=${category}`, baseUrl).href;
	const apiUrl = new URL("action/ajax/get_more_event_list", baseUrl).href;
	const $ = load(await rofetch(apiUrl, {
		method: "post",
		body: { tab: category }
	}));
	const $target = load(await rofetch(targetUrl));
	const language = $target("html").attr("lang") ?? "zh-CN";
	let items = $("div.event-item").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.find("a.summary").text();
		const image = $el.find("header.item-banner img").attr("data-delay");
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: title
			}] : void 0,
			description: $el.html()
		});
		const pubDateStr = $el.find("footer.when-where label").first().text();
		const linkUrl = $el.find("a.summary").attr("href");
		const categories = [$el.find("footer.when-where label").last().text()];
		const authors = $el.find("div.sponsor").toArray().map((authorEl) => {
			const $authorEl = $(authorEl);
			return {
				name: $authorEl.find("span").text(),
				avatar: $authorEl.find("img").attr("data-delay")
			};
		});
		const upDatedStr = pubDateStr;
		return {
			title,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl,
			category: categories,
			author: authors,
			content: {
				html: description,
				text: description
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
			const title = $$("h1").text();
			const image = $$("div.event-img img").attr("src");
			const description = renderDescription({
				images: image ? [{
					src: image,
					alt: title
				}] : void 0,
				description: $$("div.event-detail").html()
			});
			const pubDateStr = $$("span.box-fl").filter((_, el) => $$(el).text().includes("时间")).next().text()?.split("至", 1)[0]?.trim();
			const linkUrl = $$("val[data-name=\"weixinUrl\"]").attr("data-value");
			const categories = [...item.category ?? [], $$("div.cost span.c").text()].filter(Boolean);
			const authors = $$("div.user-list div.box-aw").toArray().map((authorEl) => {
				const $$authorEl = $$(authorEl);
				return {
					name: $$authorEl.find("h3").text(),
					url: $$authorEl.find("a").attr("href"),
					avatar: $$authorEl.prev().find("img").attr("src")
				};
			});
			const upDatedStr = pubDateStr;
			let processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
				link: linkUrl ?? item.link,
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
			const extraLinks = $$("div.aside-list ul li").toArray().map((extraLinkEl) => {
				const $$extraLinkEl = $$(extraLinkEl);
				return {
					url: $$extraLinkEl.find("a.list-item").attr("href"),
					type: "related",
					content_html: $$extraLinkEl.find("a.list-item").html()
				};
			}).filter((_) => true);
			if (extraLinks) processedItem = {
				...processedItem,
				_extra: { links: extraLinks }
			};
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	return {
		title: $target("title").text(),
		description: $target("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		language,
		id: targetUrl
	};
};
const route = {
	path: "/event/:category?",
	name: "活动",
	url: "www.oschina.net",
	maintainers: ["nczitzk"],
	handler,
	example: "/oschina/event",
	parameters: { category: "分类，默认为 `latest`，即最新活动，可在对应分类页 URL 中找到" },
	description: `::: tip
若订阅 [强力推荐](https://www.oschina.net/event?tab=recommend)，网址为 \`https://www.oschina.net/event?tab=recommend\`，请截取 \`https://www.oschina.net/event?tab=\` 到末尾的部分 \`recommend\` 作为 \`category\` 参数填入，此时目标路由为 [\`/oschina/event/recommend\`](https://rsshub.app/oschina/event/recommend)。
:::

| 强力推荐  | 最新活动 |
| --------- | -------- |
| recommend | latest   |`,
	categories: ["programming"],
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
			source: ["www.oschina.net"],
			target: (_, url) => {
				const category = new URL(url).searchParams.get("tab") ?? void 0;
				return `/oschina/event${category ? `/${category}` : ""}`;
			}
		},
		{
			title: "强力推荐",
			source: ["www.oschina.net"],
			target: "/event/recommend"
		},
		{
			title: "最新活动",
			source: ["www.oschina.net"],
			target: "/event/latest"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
