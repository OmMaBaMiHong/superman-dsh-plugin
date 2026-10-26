import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/dora-world/article.ts
const baseUrl = "https://www.dora-world.com";
const route = {
	path: "/article/:topic/:topicId?",
	categories: ["anime"],
	view: 0,
	example: "/dora-world/article/contents",
	parameters: {
		topic: "Topic name, can be found in URL. For example: the topic name of [https://www.dora-world.com/movie](https://www.dora-world.com/movie) is `movie`",
		topicId: "Topic id, can be found in URL. For example: the topic id of [https://www.dora-world.com/contents?t=197](https://www.dora-world.com/contents?t=197) is `197`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.dora-world.com/:topic"] }],
	name: "Article",
	maintainers: ["AChangAZha"],
	handler
};
async function handler(ctx) {
	const { topic, topicId = "" } = ctx.req.param();
	const topicIdParam = topicId === "" ? "" : `?t=${topicId}`;
	const link = `${baseUrl}/${topic}${topicIdParam}`;
	const { data: html } = await got_default(baseUrl);
	const $ = load(html);
	const nextBuildId = JSON.parse($("script#__NEXT_DATA__").text()).buildId;
	const { data: response } = await got_default(`${baseUrl}/_next/data/${nextBuildId}/${topic}.json${topicIdParam}`);
	const title = `${response.pageProps.label_name} - ドラえもんチャンネル`;
	const list = response.pageProps.contents.map((item) => ({
		title: item.title,
		link: item.page_url.startsWith("http") ? item.page_url : `${baseUrl}${item.page_url}`,
		description: item.page_url.startsWith("/contents/") ? "" : `<p>${item.title}</p><img src="${item.image_url}" alt="">`,
		pubDate: timezone(parseDate(item.publish_at), 9),
		category: item.tags.map((tag) => tag.name),
		guid: item.id
	}));
	return {
		title,
		link,
		language: "ja",
		image: "https://dora-world.com/assets/images/DORAch_web-touch-icon.png",
		item: await Promise.all(list.map(async (item) => await cache_default.tryGet(item.link, async () => {
			if (item.description === "") item.description = await getContent(nextBuildId, item.guid);
			return item;
		})))
	};
}
async function getContent(nextBuildId, contentId) {
	const { data: response } = await got_default(`${baseUrl}/_next/data/${nextBuildId}/contents/${contentId}.json`);
	const content = load(response.pageProps.content.content)(".main_unit");
	content.find(".tag").remove();
	content.find("div[style=\"display:none\"]").remove();
	return content.html()?.replaceAll(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, "$1（$2）")?.replaceAll(/[^\t\n\r\u{0020}-\u{D7FF}\u{E000}-\u{FDCF}\u{FDE0}-\u{FFFD}]/gu, "") ?? "";
}
//#endregion
export { route };
