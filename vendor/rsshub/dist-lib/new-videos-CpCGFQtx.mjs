import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import * as cheerio from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/spankbang/new-videos.tsx
const render = ({ preview, cover }) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: preview ? /* @__PURE__ */ jsx("video", {
	controls: true,
	preload: "metadata",
	poster: cover,
	children: /* @__PURE__ */ jsx("source", {
		src: preview,
		type: "video/mp4"
	})
}) : null }));
const handler = async () => {
	const baseUrl = "https://spankbang.com";
	const link = `${baseUrl}/new_videos/`;
	const context = await outPlaywright();
	const data = await cache_default.tryGet(link, async () => {
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			route.request().resourceType() === "document" ? route.continue() : route.abort();
		});
		logger.http(`Requesting ${link}`);
		await page.goto(link, { waitUntil: "domcontentloaded" });
		const response = await page.content();
		const $ = cheerio.load(response);
		const items = $(".video-item").toArray().map((item) => {
			const $item = $(item);
			const thumb = $item.find(".thumb");
			const cover = $item.find("img.cover");
			return {
				title: thumb.attr("title"),
				link: new URL(thumb.attr("href"), baseUrl).href,
				description: render({
					cover: cover.data("src"),
					preview: cover.data("preview")
				})
			};
		});
		return {
			title: $("head title").text(),
			description: $("head meta[name=\"description\"]").attr("content"),
			item: items
		};
	}, config.cache.routeExpire, false);
	await context.close();
	return {
		title: data.title,
		description: data.description,
		link,
		item: data.item
	};
};
const route = {
	path: "/new_videos",
	categories: ["multimedia"],
	example: "/spankbang/new_videos",
	name: "New Porn Videos",
	maintainers: ["TonyRL"],
	features: {
		antiCrawler: true,
		requirePuppeteer: true,
		nsfw: true
	},
	radar: [{ source: ["spankbang.com/new_videos/", "spankbang.com/"] }],
	handler
};
//#endregion
export { route };
