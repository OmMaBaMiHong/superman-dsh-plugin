import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/hupu/all.tsx
const route = {
	path: "/all/:id?",
	categories: ["bbs"],
	example: "/hupu/all/topic-daily",
	parameters: { id: "编号，可在对应热帖版面 URL 中找到，默认为步行街每日话题" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["m.hupu.com/:category", "m.hupu.com/"],
		target: "/:category"
	}],
	name: "热帖",
	maintainers: ["nczitzk"],
	handler,
	description: `::: tip
更多热帖版面参见 [论坛](https://bbs.hupu.com)
:::`
};
async function handler(ctx) {
	const currentUrl = `https://bbs.hupu.com/${ctx.req.param("id") ?? "topic-daily"}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $("div.t-info > a, a.p-title").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `https://m.hupu.com/bbs${item.attr("href")}`,
			pubDate: timezone(parseDate(item.parent().parent().find(".post-time").text(), "MM-DD HH:mm"), 8)
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const content = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			const videos = [];
			content(".hupu-post-video").each((_, el) => {
				videos.push({
					source: content(el).attr("src"),
					poster: content(el).attr("poster")
				});
			});
			item.author = content(".bbs-user-wrapper-content-name-span").first().text();
			item.pubDate ??= timezone(parseRelativeDate(content(".second-line-user-info").first().text()), 8);
			const description = content(".bbs-content").first().html();
			item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [videos.length ? videos.map((video) => /* @__PURE__ */ jsx("video", {
				poster: video.poster,
				controls: true,
				children: /* @__PURE__ */ jsx("source", {
					src: video.source,
					type: "video/mp4"
				})
			})) : null, description ? raw(description) : null] }));
		} catch {}
		return item;
	})));
	return {
		title: `虎扑社区 - ${$(".middle-title, .bbs-sl-web-intro-detail-title").text()}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
