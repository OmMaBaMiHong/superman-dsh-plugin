import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { a as renderDescription, i as parseContent, n as imageBaseUrl, t as baseUrl } from "./util-n4gNRv9n.mjs";
import { load } from "cheerio";
//#region lib/routes/gcores/user-radios.ts
const buildAuthors = (relationships, included) => {
	const authorObj = relationships?.user?.data;
	const authorIncluded = authorObj ? included.find((i) => i.type === authorObj.type && i.id === authorObj.id) : void 0;
	return authorIncluded ? [{
		name: authorIncluded.attributes?.nickname,
		url: authorIncluded.id ? new URL(`users/${authorIncluded.id}`, baseUrl).href : void 0,
		avatar: authorIncluded.thumb ? new URL(authorIncluded.thumb, imageBaseUrl).href : void 0
	}] : void 0;
};
const buildEnclosure = (attributes, relationships, included, image, title) => {
	const mediaAttrs = included.find((i) => i.id === relationships.media?.data?.id)?.attributes;
	let enclosureUrl;
	let enclosureType;
	if (attributes["speech-path"]) {
		enclosureUrl = new URL(`uploads/audio/${attributes["speech-path"]}`, "https://alioss.gcores.com").href;
		enclosureType = `audio/${enclosureUrl?.split(/\./).pop()}`;
	} else if (mediaAttrs && mediaAttrs.audio) {
		enclosureUrl = mediaAttrs.audio;
		enclosureType = `audio/${enclosureUrl?.split(/\./).pop()}`;
	}
	if (!enclosureUrl) return {};
	const enclosureLength = attributes.duration ? Number(attributes.duration) : 0;
	return {
		enclosure_url: enclosureUrl,
		enclosure_type: enclosureType,
		enclosure_title: title,
		enclosure_length: enclosureLength,
		itunes_duration: enclosureLength,
		itunes_item_image: image
	};
};
const buildDescription = (attributes, title, enclosureUrl, enclosureType) => renderDescription({
	images: attributes.cover ? [{
		src: new URL(attributes.cover, imageBaseUrl).href,
		alt: title
	}] : void 0,
	audios: enclosureType?.startsWith("audio") && enclosureUrl ? [{
		src: enclosureUrl,
		type: enclosureType
	}] : void 0,
	intro: attributes.desc || attributes.excerpt,
	description: attributes.content ? parseContent(JSON.parse(attributes.content)) : void 0
});
const handler = async (ctx) => {
	const { id } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL(`users/${id}/content?tab=radios`, baseUrl).href;
	const apiUrl = new URL(`gapi/v1/users/${id}/radios`, baseUrl).href;
	const response = await rofetch(apiUrl, { query: {
		"page[limit]": limit,
		sort: "-published-at",
		include: "user,media,albums"
	} });
	const data = response.data;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	const included = response.included || [];
	const items = data.map((item) => {
		const attributes = item.attributes;
		const relationships = item.relationships;
		const title = attributes.title;
		const pubDate = attributes["published-at"];
		const linkUrl = new URL(`radios/${item.id}`, baseUrl).href;
		const image = attributes.cover ?? attributes.thumb ? new URL(attributes.cover ?? attributes.thumb, imageBaseUrl).href : void 0;
		const authors = buildAuthors(relationships, included);
		const enclosure = buildEnclosure(attributes, relationships, included, image, title);
		const description = buildDescription(attributes, title, enclosure.enclosure_url, enclosure.enclosure_type);
		const albumNames = (relationships?.albums?.data || []).map((album) => included.find((i) => i.type === album.type && i.id === album.id)?.attributes?.title).filter(Boolean);
		return {
			title: title ?? $(description).text(),
			pubDate: pubDate ? parseDate(pubDate) : void 0,
			link: linkUrl,
			author: authors,
			category: albumNames.length > 0 ? albumNames : void 0,
			guid: `gcores-${item.id}`,
			id: `gcores-${item.id}`,
			image,
			banner: image,
			updated: pubDate ? parseDate(pubDate) : void 0,
			language,
			description,
			content: {
				html: description,
				text: description
			},
			...enclosure
		};
	});
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		author: $("title").text().split(/\|/).pop()?.trim(),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/users/:id/radios",
	name: "用户播客",
	url: "www.gcores.com",
	maintainers: ["DzmingLi"],
	handler,
	example: "/gcores/users/31418/radios",
	parameters: { id: { description: "用户 ID，可在用户主页 URL 中找到" } },
	description: `::: tip
若订阅用户 [这样重这样轻](https://www.gcores.com/users/31418) 发布的播客，网址为 \`https://www.gcores.com/users/31418\`，请截取 \`https://www.gcores.com/users/\` 之后的部分 \`31418\` 作为 \`id\` 参数填入，此时目标路由为 [\`/gcores/users/31418/radios\`](https://rsshub.app/gcores/users/31418/radios)。
:::`,
	categories: ["game"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	radar: [{
		source: ["www.gcores.com/users/:id/content", "www.gcores.com/users/:id"],
		target: "/users/:id/radios"
	}],
	view: 4
};
//#endregion
export { handler, route };
