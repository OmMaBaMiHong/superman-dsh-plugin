import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/tmtpost/templates/description.tsx
const TmtpostDescription = ({ intro, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null, description ? raw(description) : null] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(TmtpostDescription, { ...data }));
//#endregion
//#region lib/routes/tmtpost/util.ts
const baseUrl = "https://www.tmtpost.com";
const apiBaseUrl = "https://api.tmtpost.com";
const postApiUrl = new URL("v1/posts/", apiBaseUrl).href;
const headers = { "app-version": "web1.0" };
const processItems = async (limit, query, apiUrl, targetUrl) => {
	const response = await rofetch(apiUrl, {
		query: {
			limit,
			...query
		},
		headers
	});
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	let items = response.data.slice(0, limit).map((item) => {
		const title = item.title;
		const description = renderDescription({ intro: item.summary });
		const pubDate = item.time_published;
		const linkUrl = item.share_link;
		const guid = item.guid;
		const image = item.thumb_image?.original?.url;
		const updated = item.updated ?? pubDate;
		return {
			title,
			description,
			pubDate: pubDate ? parseDate(pubDate, "X") : void 0,
			link: linkUrl,
			guid,
			id: guid,
			content: {
				html: description,
				text: item.content ?? description
			},
			image,
			banner: image,
			updated: updated ? parseDate(updated, "X") : void 0,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const detailApiUrl = new URL(item.guid, postApiUrl).href;
			const data = (await rofetch(detailApiUrl, {
				query: { fields: [
					"authors",
					"tags",
					"featured_image",
					"categories",
					"stock_list",
					"big_plate",
					"concept_plate",
					"plate",
					"plate_list",
					"share_link"
				].join(";") },
				headers
			})).data;
			if (!data) return item;
			const title = data.title;
			const description = renderDescription({
				intro: data.summary,
				description: data.main
			});
			const pubDate = data.time_published;
			const linkUrl = data.share_link;
			const categories = [...new Set([
				...data.categories ?? [],
				...data.stock_list ?? [],
				...data.big_plate ?? [],
				...data.concept_plate ?? [],
				...data.plate ?? [],
				...data.plate_list ?? [],
				...data.tags ?? []
			].map((c) => c.title ?? c.name ?? c.tag).filter(Boolean))];
			const authors = data.authors?.map((author) => ({
				name: author.username,
				url: new URL(`user/${author.guid}`, baseUrl).href,
				avatar: author.avatar
			}));
			const guid = `tmtpost-${data.post_guid}`;
			const image = data.images?.[0]?.url;
			const updated = data.time_updated;
			let processedItem = {
				title,
				description,
				pubDate: pubDate ? parseDate(pubDate, "X") : void 0,
				link: linkUrl ?? item.link,
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
				language
			};
			const enclosureUrl = data.audio;
			if (enclosureUrl) {
				const enclosureType = `audio/${enclosureUrl.split(/\./).pop()}`;
				const itunesDuration = data.duration;
				processedItem = {
					...processedItem,
					enclosure_url: enclosureUrl,
					enclosure_type: enclosureType,
					enclosure_title: title,
					enclosure_length: void 0,
					itunes_duration: itunesDuration,
					itunes_item_image: image
				};
			}
			const medias = {};
			if (data.full_size_images ?? data.images) {
				const images = data.full_size_images ?? data.images;
				for (const media of images) {
					const url = media.url ?? media;
					if (!url) continue;
					const medium = "image";
					const key = `${medium}${Object.values(medias).filter((m) => m.medium === medium).length + 1}`;
					medias[key] = {
						url,
						medium,
						title,
						thumbnail: media.thumbnail ?? url
					};
				}
			}
			processedItem = {
				...processedItem,
				media: medias
			};
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	const title = $("title").text();
	const author = title.split(/-/).pop();
	return {
		title,
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: title.split(/-/).pop(),
		language,
		itunes_author: author,
		itunes_category: "Technology",
		id: targetUrl
	};
};
//#endregion
export { baseUrl as n, processItems as r, apiBaseUrl as t };
