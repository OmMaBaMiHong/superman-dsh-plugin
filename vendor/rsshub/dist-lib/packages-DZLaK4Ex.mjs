import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/chocolatey/packages.ts
const handler = async (ctx) => {
	const { id } = ctx.req.param();
	const baseUrl = "https://community.chocolatey.org";
	const targetUrl = new URL(`packages/${id}`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	const title = $("meta[property=\"og:title\"]").attr("content");
	const description = $("div#description").html();
	const pubDateStr = $("h3.mt-0.mb-3").last().text();
	const categoryEls = $("a[data-package-tag]").toArray();
	const categories = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
	const authors = $("img[alt=\"gravatar\"]").toArray().map((authorEl) => {
		const $authorEl = $(authorEl).parent();
		return {
			name: $authorEl.find("span").text(),
			url: $authorEl.attr("href") ? new URL($authorEl.attr("href"), baseUrl).href : void 0,
			avatar: $authorEl.attr("src")
		};
	});
	const guid = `chocolatey-${title}`;
	const image = $("div.package-logo img").attr("src") ? new URL($("div.package-logo img").attr("src"), baseUrl).href : void 0;
	const upDatedStr = pubDateStr;
	const items = [{
		title,
		description,
		pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
		link: targetUrl,
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
		updated: upDatedStr ? parseDate(upDatedStr) : void 0,
		language
	}];
	return {
		title: $("title").first().text(),
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/packages/:id",
	name: "Package",
	url: "community.chocolatey.org",
	maintainers: ["nczitzk"],
	handler,
	example: "/chocolatey/packages/microsoft-edge",
	parameters: { id: { description: "Package ID" } },
	description: void 0,
	categories: ["program-update"],
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
		source: ["community.chocolatey.org/packages"],
		target: (params) => {
			const id = params.id;
			return `/chocolatey/package${id ? `/${id}` : ""}`;
		}
	}],
	view: 5,
	zh: {
		path: "/packages/:id",
		name: "程序包",
		url: "community.chocolatey.org",
		maintainers: ["nczitzk"],
		handler,
		example: "/chocolatey/package/microsoft-edge",
		parameters: { id: { description: "程序包 ID" } },
		description: void 0
	}
};
//#endregion
export { handler, route };
