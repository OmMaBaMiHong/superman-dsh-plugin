import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as renderDescription } from "./description-40dho8OB.mjs";
import { load } from "cheerio";
//#region lib/routes/dgtle/video.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "18");
	const baseUrl = "https://www.dgtle.com";
	const targetUrl = new URL("video", baseUrl).href;
	const apiUrl = new URL("video/list/1", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	let items = (await rofetch(apiUrl)).data.list.slice(0, limit).map((item) => {
		const title = item.title;
		const image = item.cover?.split(/\?/, 1)?.[0];
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: title
			}] : void 0,
			intro: item.description
		});
		const linkUrl = item.url;
		const authors = [{
			name: item.author.username,
			url: void 0,
			avatar: item.author.avatar_path?.split(/\?/, 1)?.[0]
		}];
		const guid = `dgtle-${item.id}`;
		return {
			title,
			description,
			link: linkUrl,
			author: authors,
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			language,
			enclosure_length: item.duration
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("h1.video-title").text();
			const $$enclosureEl = $$("div.video-play video source").first();
			const enclosureUrl = $$enclosureEl.attr("src");
			const image = $$("div.video-play").attr("data-url");
			const description = renderDescription({
				videos: enclosureUrl ? [{
					src: enclosureUrl,
					type: "video/mp4",
					poster: image
				}] : void 0,
				intro: $$("h3.video-summary").text()
			});
			const pubDateStr = $$("p.video-time").text()?.split(/\s/, 1)?.[0];
			const linkUrl = $$(".title").attr("href");
			const categoryEls = $$(".category").toArray();
			const categories = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
			const authors = $$(".author").toArray().map((authorEl) => {
				const $$authorEl = $$(authorEl);
				return {
					name: $$authorEl.text(),
					url: $$authorEl.attr("href"),
					avatar: $$authorEl.find("img").attr("src")
				};
			});
			const guid = $$(".id").text();
			const upDatedStr = pubDateStr;
			let processedItem = {
				title,
				description,
				pubDate: pubDateStr ? timezone(parseRelativeDate(pubDateStr), 8) : item.pubDate,
				link: linkUrl ? new URL(linkUrl, baseUrl).href : item.link,
				category: categories,
				author: authors,
				doi: $$("meta[name=\"citation_doi\"]").attr("content"),
				guid,
				id: guid,
				content: {
					html: description,
					text: description
				},
				image,
				banner: image,
				updated: upDatedStr ? timezone(parseRelativeDate(upDatedStr), 8) : item.updated,
				language
			};
			if (enclosureUrl) {
				const enclosureType = $$enclosureEl.attr("type") || "video/mp4";
				processedItem = {
					...processedItem,
					enclosure_url: enclosureUrl,
					enclosure_type: enclosureType,
					enclosure_title: title,
					enclosure_length: item.enclosure_length,
					itunes_duration: item.enclosure_length,
					itunes_item_image: image
				};
			}
			return {
				...item,
				...processedItem
			};
		});
	}));
	const author = $("meta[name=\"keywords\"]").attr("content")?.split(/,/, 1)[0] ?? void 0;
	return {
		title: $("title").text().trim().split(/\s/, 1)[0],
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		author,
		language,
		itunes_author: author,
		itunes_category: "Technology",
		id: targetUrl
	};
};
const route = {
	path: "/video",
	name: "视频",
	url: "www.dgtle.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/dgtle/video",
	parameters: void 0,
	description: void 0,
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
		source: ["www.dgtle.com/video"],
		target: "/video"
	}],
	view: 0
};
//#endregion
export { handler, route };
