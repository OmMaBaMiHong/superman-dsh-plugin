import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as parseContent, t as baseUrl } from "./utils-aEKVKIyH.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/t66y/post.ts
function parseItems(tid, $) {
	return $(".tr1:nth-child(1)").toArray().map((item) => {
		const $item = $(item);
		const content = parseContent($item.html());
		const footer = $item.next();
		const pid = footer.find(".tipad a[title]").attr("id")?.slice(2);
		return {
			title: content?.split("<br>", 1)[0],
			description: content,
			author: $item.find("b").contents().filter((_, ele) => ele.type === "text").text().trim(),
			pubDate: parseDate(String(footer.find("span[data-timestamp]").data("timestamp")), "X"),
			link: `${baseUrl}/read.php?tid=${tid}${pid ? `&pid=${pid}` : ""}`
		};
	});
}
const route = {
	path: "/post/:tid",
	categories: ["multimedia"],
	example: "/t66y/post/3286088",
	parameters: { tid: "帖子 id, 可在帖子 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "帖子跟踪",
	maintainers: ["cnzgray"],
	handler,
	description: `::: tip
帖子 id 查找办法:

打开想跟踪的帖子，比如：\`https://t66y.com/htm_data/20/1811/3286088.html\` 其中 \`3286088\` 就是帖子 id。
:::`
};
async function handler(ctx) {
	const tid = ctx.req.param("tid");
	const { data: response } = await got_default(`${baseUrl}/read.php?tid=${tid}`);
	let $ = cheerio.load(response);
	const redirect = $("a:last-child").attr("href");
	if (!redirect) throw new Error("Cannot get the redirect link");
	const { data: redirectedResponse, url: link } = await got_default(new URL(redirect, baseUrl).href);
	$ = cheerio.load(redirectedResponse);
	const firstPage = parseItems(tid, $);
	const pageSize = $(".w70 input").eq(0).attr("value")?.split("/", 2)[1];
	let pageUrls = [];
	if (pageSize) {
		const length = Number.parseInt(pageSize);
		pageUrls = Array.from({ length }, (_, i) => `${baseUrl}/read.php?tid=${tid}&page=${i + 1}`).slice(1);
	}
	const nextPages = pageSize ? await Promise.all(pageUrls.map((url) => cache_default.tryGet(url, async () => {
		const { data: res } = await got_default(url);
		const $ = cheerio.load(res);
		return parseItems(tid, $);
	}))) : [];
	const items = [...firstPage, ...nextPages.flat()];
	return {
		title: $("head title").text(),
		link,
		item: items
	};
}
//#endregion
export { route };
