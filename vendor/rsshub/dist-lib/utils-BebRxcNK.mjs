import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/javlibrary/utils.tsx
const rootUrl = "https://www.javlibrary.com";
const defaultGenre = "amjq";
const defaultMaker = "arlq";
const renderDescription = ({ cover, info, comment, videos, thumbs }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("img", { src: cover }),
	info ? /* @__PURE__ */ jsx(Fragment, { children: raw(info) }) : null,
	comment ? /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("br", {}),
		raw(comment),
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	videos?.length ? videos.map((video) => /* @__PURE__ */ jsx("video", {
		controls: true,
		children: /* @__PURE__ */ jsx("source", {
			src: video,
			type: "video/mp4"
		})
	})) : null,
	thumbs?.length ? thumbs.map((thumb) => /* @__PURE__ */ jsx("img", { src: thumb })) : null
] }));
const ProcessItems = async (language, currentUrl) => {
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	$(".toolbar, .info, .videoinfo").remove();
	let items = $(".videotextlist, #video_comments").find("a").toArray().filter((i) => $(i).parent().hasClass("video") || $(i).parent().get(0).tagName === "strong").map((item) => {
		item = $(item);
		const table = item.parentsUntil("table");
		const link = `${rootUrl}/${language}/${item.attr("href").replace(/^\.\//, "")}`;
		return {
			link,
			url: link.replace(/video.*\.php/, ""),
			title: item.text(),
			description: table.find("textarea").text(),
			pubDate: parseDate(table.find(".date").text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.url, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.url
		});
		const content = load(detailResponse.data);
		content(".icn_edit, .btn_videoplayer, a[rel=\"bookmark\"]").remove();
		content("span").each((_, el) => {
			if (content(el).attr("class")?.startsWith("icn_")) content(el).remove();
		});
		item.author = content(".star").toArray().map((star) => content(star).text()).filter((star) => star !== "").join(",");
		item.category = content("a[rel]").toArray().map((tag) => content(tag).text()).filter((tag) => tag !== "");
		item.description = renderDescription({
			cover: content("#video_jacket_img").attr("src"),
			info: content("#video_info").html().replaceAll("span><span", "span>,&nbsp;<span"),
			comment: item.description?.replaceAll("[img]", "<img src=\"")?.replaceAll("[/img]", "\"/>"),
			thumbs: content(".previewthumbs img").toArray().map((img) => content(img).attr("src").replaceAll("-", "jp-")),
			videos: [...new Set(detailResponse.data.match(/(http[^"[\]]+\.mp4)/g))]
		});
		item.pubDate = item.pubDate.toString() === "Invalid Date" ? parseDate(content("#video_date").find(".text").text()) : item.pubDate;
		delete item.url;
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items,
		allowEmpty: true
	};
};
//#endregion
export { rootUrl as i, defaultGenre as n, defaultMaker as r, ProcessItems as t };
