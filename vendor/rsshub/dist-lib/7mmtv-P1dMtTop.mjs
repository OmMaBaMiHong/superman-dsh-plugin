import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/7mmtv/index.tsx
const route = {
	path: "/:language?/:category?/:type?",
	categories: ["multimedia"],
	example: "/7mmtv/zh/censored_list/all",
	parameters: {
		language: "Language, see below, `en` as English by default",
		category: "Category, see below, `censored_list` as Censored by default",
		type: "Server, see below, all server by default"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "Category",
	maintainers: ["nczitzk"],
	handler,
	description: `**Language**

| English | 日本語 | 한국의 | 中文 |
| ------- | ------ | ------ | ---- |
| en      | ja     | ko     | zh   |

**Category**

| Chinese subtitles AV | Censored       | Amateur          | Uncensored       | Asian self-timer | H comics     |
| -------------------- | -------------- | ---------------- | ---------------- | ---------------- | ------------ |
| chinese\\_list        | censored\\_list | amateurjav\\_list | uncensored\\_list | amateur\\_list    | hcomic\\_list |

| Chinese subtitles AV random | Censored random  | Amateur random     | Uncensored random  | Asian self-timer random | H comics random |
| --------------------------- | ---------------- | ------------------ | ------------------ | ----------------------- | --------------- |
| chinese\\_random             | censored\\_random | amateurjav\\_random | uncensored\\_random | amateur\\_random         | hcomic\\_random  |

**Server**

| All Server | fembed(Full DL) | streamsb(Full DL) | doodstream | streamtape(Full DL) | avgle | embedgram | videovard(Full DL) |
| ---------- | --------------- | ----------------- | ---------- | ------------------- | ----- | --------- | ------------------ |
| all        | 21              | 30                | 28         | 29                  | 17    | 34        | 33                 |`
};
async function handler(ctx) {
	const currentUrl = `https://7mmtv.sx/${ctx.req.param("language") ?? "en"}/${ctx.req.param("category") ?? "censored_list"}/${ctx.req.param("type") ?? "all"}/1.html`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".video").toArray().map((item) => {
		item = $(item);
		const title = item.find(".video-title a");
		return {
			title: title.text(),
			author: item.find(".video-channel").text(),
			pubDate: parseDate(item.find(".small").text()),
			link: title.attr("href"),
			poster: item.find("img").attr("data-src"),
			video: item.find("video").attr("data-src")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		const cover = content(".content_main_cover img").attr("src");
		const images = content(".owl-lazy").toArray().map((i) => content(i).attr("data-src"));
		const description = content(".video-introduction-images-text").html();
		const poster = item.poster ?? "";
		const video = item.video;
		const videoMarkup = video ? `<video mute loop="loop" autoplay="autoplay" poster="${poster}"><source src="${video}"></video>` : "";
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
			cover ? /* @__PURE__ */ jsx("img", { src: cover }) : null,
			video ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("br", {}),
				raw(videoMarkup),
				/* @__PURE__ */ jsx("br", {})
			] }) : null,
			description ? raw(description) : null,
			images.map((image) => image ? /* @__PURE__ */ jsx("img", { src: image }) : null)
		] }));
		item.category = content(".categories a").toArray().map((a) => content(a).text());
		delete item.poster;
		delete item.video;
		return item;
	})));
	return {
		title: $("title").text().replace(/ - Watch JAV Online/, ""),
		link: currentUrl,
		item: items,
		description: $("meta[name=\"description\"]").attr("content")
	};
}
//#endregion
export { route };
