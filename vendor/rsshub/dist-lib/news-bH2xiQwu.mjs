import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/fisher-spb/news.tsx
const route = {
	path: "/news",
	categories: ["other"],
	example: "/fisher-spb/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["fisher.spb.ru/news"] }],
	name: "News",
	maintainers: ["denis-ya"],
	handler,
	url: "fisher.spb.ru/news"
};
async function handler() {
	const renderVideo = (link) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("iframe", {
		type: "text/html",
		width: "640",
		height: "360",
		src: `https://youtube.com/embed/${link}`,
		frameborder: "0",
		allowfullscreen: true
	}), /* @__PURE__ */ jsx("br", {})] }));
	const renderImage = (href) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", {
		style: "max-width: 650px; height: auto; object-fit: contain; flex: 0 0 auto;",
		src: href
	}), /* @__PURE__ */ jsx("br", {})] }));
	const rootUrl = "https://fisher.spb.ru/news/";
	const $ = load((await got_default({
		method: "get",
		url: rootUrl,
		responseType: "buffer"
	})).data);
	const descBuilder = (element) => {
		const content = load(`<p>${$(".news-message-text", element).html()}</p>`).root();
		$(".news-message-media a", element).each((_, elem) => {
			if ($(elem).hasClass("news-message-youtube")) content.append(renderVideo($(elem).attr("data-youtube")));
			else content.append(renderImage($(elem).attr("href")));
		});
		return content;
	};
	const items = $(".news-message").toArray().map((elem) => ({
		pubDate: parseDate($(".news-message-date", elem).text().trim(), "DD.MM.YYYY HH:mm"),
		title: $(".news-message-location", elem).text().trim(),
		description: descBuilder(elem).html(),
		author: $(".news-message-user", elem).text().trim(),
		guid: $(elem).attr("id"),
		link: rootUrl + $(".news-message-comments-number > a", elem).attr("href")
	}));
	return {
		title: $("head > title").text().trim(),
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
