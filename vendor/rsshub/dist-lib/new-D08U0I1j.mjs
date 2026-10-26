import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import * as cheerio from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/missav/new.tsx
const urlPath = "dm514/new";
const route = {
	path: "/new",
	categories: ["multimedia"],
	example: "/missav/new",
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: [
		`missav.ws/${urlPath}`,
		"missav.ws/new",
		"missav.ws/"
	] }, { source: [
		`missav.ai/${urlPath}`,
		"missav.ai/new",
		"missav.ai/"
	] }],
	name: "最近更新",
	maintainers: ["TonyRL"],
	handler,
	url: "missav.ws/dm397/new"
};
async function handler() {
	const baseUrl = "https://missav.ws";
	const url = `${baseUrl}/${urlPath}`;
	const context = await outPlaywright();
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		const request = route.request();
		request.resourceType() === "document" || request.resourceType() === "script" || request.resourceType() === "xhr" ? route.continue() : route.abort();
	});
	await page.goto(url, { waitUntil: "domcontentloaded" });
	const response = await page.evaluate(() => document.documentElement.innerHTML);
	await context.close();
	const $ = cheerio.load(response);
	const items = $(".grid .group").toArray().map((item) => {
		const $item = $(item);
		const title = $item.find(".text-secondary");
		const poster = new URL($item.find("img").data("src"));
		poster.searchParams.set("class", "normal");
		const video = $item.find("video").data("src");
		return {
			title: title.text().trim(),
			link: title.attr("href"),
			description: renderToString(/* @__PURE__ */ jsx("video", {
				controls: true,
				preload: "metadata",
				poster: poster.href,
				children: /* @__PURE__ */ jsx("source", {
					src: video,
					type: video.split(".").pop()
				})
			}))
		};
	});
	return {
		title: $("head title").text(),
		description: $("head meta[name=\"description\"]").attr("content"),
		link: baseUrl,
		item: items
	};
}
//#endregion
export { route };
