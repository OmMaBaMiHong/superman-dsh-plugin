import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { FetchError } from "ofetch";
import dayjs from "dayjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
//#region lib/routes/washingtonpost/app.tsx
const route = {
	path: "/app/:category{.+}?",
	categories: ["traditional-media"],
	example: "/washingtonpost/app/national",
	parameters: { category: "Category from the path of the URL of the corresponding site, see below" },
	features: {
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "App",
	maintainers: ["quiniapiezoelectricity"],
	radar: [{
		source: ["www.washingtonpost.com/:category"],
		target: "/app/:category"
	}],
	handler,
	description: `::: tip
For example, the category for <https://www.washingtonpost.com/national/investigations> would be /national/investigations.
:::`
};
function handleDuplicates(array) {
	const objects = {};
	for (const obj of array) {
		const existing = objects[obj.id];
		objects[obj.id] = existing ? Object.assign(existing, obj) : obj;
	}
	return Object.values(objects);
}
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "";
	const headers = {
		Accept: "*/*",
		Connection: "keep-alive",
		"User-Agent": "Classic/6.70.0"
	};
	dayjs.extend(utc);
	dayjs.extend(timezone);
	dayjs.extend(advancedFormat);
	const url = `https://jsonapp1.washingtonpost.com/fusion_prod/v2/${category}`;
	const response = await got_default.get(url, { headers });
	const title = response.data.tracking.page_title.includes("Washington Post") ? response.data.tracking.page_title : `The Washington Post - ${response.data.tracking.page_title}`;
	const link = "https://washingtonpost.com" + response.data.tracking.page_path;
	const feed = handleDuplicates(response.data.regions[0].items.filter((item) => item.items).flatMap((main) => main.items[0].items.filter((item) => item.is_from_feed === true).map((item) => {
		const object = {
			id: item.id,
			title: item.headline.text,
			link: item.link.url,
			pubDate: item.link.display_date,
			updated: item.link.last_modified
		};
		if (item.blurbs?.items[0]?.text) object.description = item.blurbs?.items[0]?.text;
		return object;
	})));
	return {
		title,
		link,
		item: await Promise.all(feed.map((item) => cache_default.tryGet(item.link, async () => {
			let response;
			try {
				response = await got_default(`https://rainbowapi-a.wpdigital.net/rainbow-data-service/rainbow/content-by-url.json?followLinks=false&url=${item.link}`, { headers });
			} catch (error) {
				if (error instanceof FetchError && error.statusCode === 415) return item;
				throw error;
			}
			item.title = response.data.title ?? item.title;
			item.author = response.data.items.filter((entry) => entry.type === "byline")?.flatMap((entry) => entry.authors.map((author) => author.name))?.join(", ") ?? "";
			item.description = renderDescription(response.data.items);
			return item;
		})))
	};
}
const renderDescription = (content) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: content?.map((entry, index) => {
	if (!entry) return null;
	if (entry.type === "title" && entry.subtype !== "h1") return /* @__PURE__ */ jsx(entry.subtype || "h2", { children: entry.mime === "text/html" ? raw(entry.content) : entry.content }, `title-${index}`);
	if (entry.type === "sanitized_html") {
		if (entry.subtype === "paragraph") return /* @__PURE__ */ jsxs("p", { children: [entry.mime === "text/html" ? raw(entry.content) : entry.content, entry.oembed ? raw(entry.oembed) : null] }, `paragraph-${index}`);
		if (entry.subtype === "subhead") return /* @__PURE__ */ jsxs(`h${entry.subhead_level || 4}`, { children: [entry.mime === "text/html" ? raw(entry.content) : entry.content, entry.oembed ? raw(entry.oembed) : null] }, `subhead-${index}`);
	} else if (entry.type === "deck") return /* @__PURE__ */ jsx("blockquote", { children: /* @__PURE__ */ jsx("p", { children: entry.mime === "text/html" ? raw(entry.content) : entry.content }) }, `deck-${index}`);
	if (entry.type === "image") return /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
		src: entry.imageURL,
		alt: entry.blurb
	}), /* @__PURE__ */ jsx("figcaption", { children: entry.fullcaption })] }, `image-${index}`);
	if (entry.type === "video") {
		if (entry.content?.html) return /* @__PURE__ */ jsx("span", { children: raw(entry.content.html) }, `video-html-${index}`);
		if (entry.mediaURL) return /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("video", {
			controls: true,
			poster: entry.imageURL,
			children: /* @__PURE__ */ jsx("source", { src: entry.mediaURL })
		}), entry.fullcaption ? /* @__PURE__ */ jsx("figcaption", { children: entry.fullcaption }) : null] }, `video-${index}`);
	} else if (entry.type === "list") return /* @__PURE__ */ jsx(entry.subtype === "ordered" ? "ol" : "ul", { children: (entry.content ?? []).map((listItem, itemIndex) => /* @__PURE__ */ jsx("li", { children: entry.mime === "text/html" ? raw(listItem) : listItem }, `list-${index}-${itemIndex}`)) }, `list-${index}`);
	if (entry.type === "divider") return /* @__PURE__ */ jsxs("span", { children: [
		/* @__PURE__ */ jsx("br", {}),
		/* @__PURE__ */ jsx("hr", {}),
		/* @__PURE__ */ jsx("br", {})
	] }, `divider-${index}`);
	if (entry.type === "byline" && (entry.subtype === "live-update" || entry.subtype === "live-reporter-insight")) return /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("i", { children: entry.mime === "text/html" ? raw(entry.content) : entry.content }) }, `byline-${index}`);
	if (entry.type === "date" && entry.subtype === "live-update") return entry.content ? /* @__PURE__ */ jsx("span", { children: dayjs.tz(entry.content, "America/New_York").locale("en").format("dddd, MMMM D, YYYY h:mm A z") }, `date-${index}`) : null;
	return null;
}) }));
//#endregion
export { route };
