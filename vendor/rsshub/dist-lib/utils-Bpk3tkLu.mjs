import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/chikubi/utils.ts
const CONTENT_TYPES = {
	doujin: {
		title: ".doujin-title",
		description: [
			".doujin-detail",
			".section",
			".area-buy > a.btn"
		]
	},
	video: {
		title: ".video-title",
		description: [
			".video-data",
			".section",
			".lp-samplearea a.btn"
		]
	},
	article: {
		title: ".article_title",
		description: [".article_icatch", ".article_contents"]
	}
};
function getContentType(link) {
	for (const [type, patterns] of Object.entries({
		doujin: [
			"/cg/",
			"/comic/",
			"/voice/"
		],
		video: ["/nipple-video/"],
		article: ["/post-"]
	})) if (patterns.some((pattern) => link.includes(pattern))) return type;
	throw new Error(`Unknown content type for link: ${link}`);
}
async function processItems(list) {
	return (await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		const contentType = getContentType(item.link);
		const selectors = CONTENT_TYPES[contentType];
		const title = $(selectors.title).text().trim() || item.title;
		const description = processDescription(selectors.description.map((selector) => $(selector).prop("outerHTML")).join(""));
		const pubDateStr = $("meta[property=\"article:published_time\"]").attr("content");
		const pubDate = pubDateStr ? parseDate(pubDateStr) : void 0;
		return {
			title,
			description,
			link: item.link,
			pubDate
		};
	})))).filter((item) => item !== null);
}
function processDescription(description) {
	const $ = load(description);
	return $("body").children().toArray().map((el) => $(el).clone().wrap("<div>").parent().html()).join("");
}
const WP_REST_API_URL = "https://chikubi.jp/wp-json/wp/v2";
async function getPosts(ids) {
	const url = `${WP_REST_API_URL}/posts${ids?.length ? `?include=${ids.join(",")}` : ""}`;
	const cachedData = await cache_default.tryGet(url, async () => {
		const response = await got_default(url);
		const data = JSON.parse(response.body);
		if (!Array.isArray(data)) throw new TypeError("No posts found for the given IDs");
		return data.map(({ title, link, date, content }) => ({
			title: title.rendered,
			link,
			pubDate: parseDate(date),
			description: processDescription(content.rendered)
		}));
	});
	return (Array.isArray(cachedData) ? cachedData : []).filter((item) => item !== null);
}
const API_TYPES = {
	tag: "tags",
	category: "categories"
};
async function getBySlug(type, slug) {
	const { body } = await got_default(`${WP_REST_API_URL}/${API_TYPES[type]}?slug=${encodeURIComponent(slug)}`);
	const data = JSON.parse(body);
	if (data?.[0]) {
		const { id, name } = data[0];
		return {
			id,
			name
		};
	}
	throw new Error(`No ${type} found for slug: ${slug}`);
}
async function getPostsBy(type, id) {
	const url = `${WP_REST_API_URL}/posts?${API_TYPES[type]}=${id}`;
	const cachedData = await cache_default.tryGet(url, async () => {
		const { body } = await got_default(url);
		const data = JSON.parse(body);
		if (Array.isArray(data) && data.length > 0) return data.map(({ title, link, date, content }) => ({
			title: title.rendered,
			link,
			pubDate: parseDate(date),
			description: processDescription(content.rendered)
		}));
		return [];
	});
	return (Array.isArray(cachedData) ? cachedData : []).filter((item) => item !== null);
}
//#endregion
export { processItems as i, getPosts as n, getPostsBy as r, getBySlug as t };
