import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as renderDescription } from "./description-40dho8OB.mjs";
import { load } from "cheerio";
import markdownit from "markdown-it";
//#region lib/routes/dgtle/util.ts
const md = markdownit({
	html: true,
	linkify: true
});
const baseUrl = "https://www.dgtle.com";
const ProcessItems = async (limit, dataList) => {
	let items = dataList.slice(0, limit).map((item) => {
		const title = item.title || item.content;
		const image = item.cover;
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: title
			}] : void 0,
			intro: item.content
		});
		const pubDate = item.created_at;
		const linkUrl = `${item.live_status === void 0 ? item.category_name ? "article" : "news" : "live"}-${item.id}-1.html`;
		const categories = [...new Set([item.column, item.category_name].filter(Boolean))];
		const authors = [{
			name: item.user?.username ?? item.user_name,
			url: new URL(`user?uid=${item.user_id}`, baseUrl).href,
			avatar: item.user?.avatar_path ?? item.avatar_path
		}];
		const guid = `dgtle-${item.id}`;
		const updated = pubDate;
		return {
			title,
			description,
			pubDate: pubDate ? parseDate(pubDate, "X") : void 0,
			link: new URL(linkUrl, baseUrl).href,
			category: categories,
			author: authors,
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: updated ? parseDate(updated, "X") : void 0,
			live_status: item.live_status
		};
	});
	items = await Promise.all(items.map((item) => {
		if (item.live_status !== void 0 || !item.link) {
			delete item.live_status;
			return item;
		}
		delete item.live_status;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			$$("div.logo").remove();
			$$("p.tip").remove();
			$$("p.dgtle").remove();
			$$("figure").each((_, el) => {
				const $$el = $$(el);
				$$el.replaceWith(renderDescription({ images: [{ src: $$el.find("img").attr("data-original")?.replace(/_\d+_\d+_w/, "") }] }));
			});
			const processedItem = { description: renderDescription({ description: $$("div.whale_news_detail-daily-content, div#articleContent, div.forum-viewthread-article-box").html() }) };
			return {
				...item,
				...processedItem
			};
		});
	}));
	return items;
};
const ProcessFeedItems = (limit, dataList, $) => dataList.slice(0, limit).map((item) => {
	const content = item.content ? md.render(item.content) : "";
	const title = $(content).text();
	const description = renderDescription({
		images: item.imgs_url.map((src) => ({ src })),
		description: content
	});
	const pubDate = item.created_at;
	const linkUrl = item.url;
	const categories = [...new Set((item.tags_info?.map((t) => t.title) ?? []).filter(Boolean))];
	const authors = [{
		name: item.user_name,
		url: new URL(`user?uid=${item.encode_uid}`, baseUrl).href,
		avatar: item.avatar_path
	}];
	const guid = `dgtle-${item.id}`;
	const image = item.imgs_url?.[0];
	const updated = item.updated_at ?? pubDate;
	let processedItem = {
		title,
		description,
		pubDate: pubDate ? parseDate(pubDate, "X") : void 0,
		link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
		category: categories,
		author: authors,
		guid,
		id: guid,
		content: {
			html: description,
			text: description
		},
		image,
		banner: image,
		updated: updated ? parseDate(updated, "X") : void 0
	};
	const medias = (() => {
		const acc = {};
		for (const media of item.imgs_url) {
			const url = media;
			if (!url) continue;
			const medium = "image";
			const key = `${medium}${Object.values(acc).filter((m) => m.medium === medium).length + 1}`;
			acc[key] = {
				url,
				medium,
				title: "",
				description: "",
				thumbnail: url
			};
		}
		return acc;
	})();
	processedItem = {
		...processedItem,
		media: medias
	};
	return processedItem;
});
//#endregion
export { ProcessItems as n, baseUrl as r, ProcessFeedItems as t };
