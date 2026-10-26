import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { a as renderDescription, i as parseContent, n as imageBaseUrl, t as baseUrl } from "./util-n4gNRv9n.mjs";
import { load } from "cheerio";
//#region lib/routes/gcores/user-talks.ts
const handler = async (ctx) => {
	const { id } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL(`users/${id}/talks`, baseUrl).href;
	const apiUrl = new URL(`gapi/v1/users/${id}/talks`, baseUrl).href;
	const response = await rofetch(apiUrl, { query: {
		"page[limit]": Math.min(limit * 2, 100),
		sort: "-created-at",
		include: "user"
	} });
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	const included = response.included || [];
	let data = response.data.filter((item) => item.type !== "radios" && item.type !== "videos");
	data = data.slice(0, limit);
	const items = data.map((item) => {
		const attributes = item.attributes;
		const relationships = item.relationships;
		const title = attributes.title;
		const pubDate = attributes["created-at"] || attributes["published-at"];
		const authorObj = relationships?.user?.data;
		const authorIncluded = authorObj ? included.find((i) => i.type === authorObj.type && i.id === authorObj.id) : void 0;
		const authors = authorIncluded ? [{
			name: authorIncluded.attributes?.nickname,
			url: authorIncluded.id ? new URL(`users/${authorIncluded.id}`, baseUrl).href : void 0,
			avatar: authorIncluded.thumb ? new URL(authorIncluded.thumb, imageBaseUrl).href : void 0
		}] : void 0;
		const guid = `gcores-${item.type}-${item.id}`;
		const image = attributes.cover ?? attributes.thumb ? new URL(attributes.cover ?? attributes.thumb, imageBaseUrl).href : void 0;
		const description = renderDescription({
			images: attributes.cover ? [{
				src: new URL(attributes.cover, imageBaseUrl).href,
				alt: title
			}] : void 0,
			intro: attributes.desc || attributes.excerpt,
			description: attributes.content ? parseContent(JSON.parse(attributes.content)) : void 0
		});
		return {
			title: title ?? $(description).text(),
			pubDate: pubDate ? parseDate(pubDate) : void 0,
			link: new URL(`${item.type}/${item.id}`, baseUrl).href,
			author: authors,
			guid,
			id: guid,
			image,
			banner: image,
			updated: pubDate ? parseDate(pubDate) : void 0,
			language,
			description,
			content: {
				html: description,
				text: description
			}
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
	path: "/users/:id/talks",
	name: "用户动态",
	url: "www.gcores.com",
	maintainers: ["DzmingLi"],
	handler,
	example: "/gcores/users/31418/talks",
	parameters: { id: { description: "用户 ID，可在用户主页 URL 中找到" } },
	description: `::: tip
若订阅用户 [这样重这样轻](https://www.gcores.com/users/31418/talks) 的动态，网址为 \`https://www.gcores.com/users/31418/talks\`，请截取 \`https://www.gcores.com/users/\` 到 \`/talks\` 之间的部分 \`31418\` 作为 \`id\` 参数填入，此时目标路由为 [\`/gcores/users/31418/talks\`](https://rsshub.app/gcores/users/31418/talks)。
:::`,
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
	radar: [{
		source: ["www.gcores.com/users/:id/talks"],
		target: "/users/:id/talks"
	}],
	view: 1
};
//#endregion
export { handler, route };
