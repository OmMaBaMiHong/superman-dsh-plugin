import "./types-DNj6Etbg.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/picnob/user.ts
const route = {
	path: "/user/:id/:type?",
	categories: ["social-media"],
	example: "/picnob/user/xlisa_olivex",
	parameters: {
		id: "Instagram id",
		type: "Type of profile page (profile or tagged)"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.picnob.com/profile/:id"],
		target: "/user/:id"
	}, {
		source: ["www.picnob.com/profile/:id/tagged"],
		target: "/user/:id/tagged"
	}],
	name: "User Profile - Picnob",
	maintainers: [
		"TonyRL",
		"micheal-death",
		"AiraNadih",
		"DIYgod",
		"hyoban",
		"Rongronggg9"
	],
	handler,
	view: 2
};
async function handler(ctx) {
	const baseUrl = "https://www.picnob.com";
	const id = ctx.req.param("id");
	const type = ctx.req.param("type") ?? "profile";
	const profileUrl = `${baseUrl}/profile/${id}/${type === "tagged" ? "tagged/" : ""}`;
	const context = await outPlaywright();
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		route.request().resourceType() === "document" ? route.continue() : route.abort();
	});
	await page.goto(profileUrl, { waitUntil: "domcontentloaded" });
	logger.http(`Requesting ${profileUrl}`);
	const $ = load(await page.content());
	const list = $(".post_box").toArray().map((item) => {
		const $item = $(item);
		const coverLink = $item.find(".cover_link").attr("href");
		const image = $item.find(".cover .cover_link img");
		const alt = image.attr("alt") || "";
		const sum = $item.find(".sum");
		const title = sum.text().split("\n", 1)[0] || alt;
		const content = sum.html()?.replaceAll("\n", "<br>") || alt;
		return {
			title,
			description: `<img src="${image.attr("data-src")}"><br>${content}`,
			link: `${baseUrl}${coverLink}`,
			guid: coverLink?.split("/", 3)?.[2],
			pubDate: parseRelativeDate($item.find(".time .txt").text()),
			slideOrVideo: $item.find(".corner").length
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		let media = "";
		if (item.slideOrVideo) {
			const page = await context.newPage();
			await page.route("**/*", (route) => {
				route.request().resourceType() === "document" ? route.continue() : route.abort();
			});
			await page.goto(item.link, { waitUntil: "domcontentloaded" });
			logger.http(`Requesting ${item.link}`);
			const $ = load(await page.content());
			media = $(".slide-item").length ? $(".slide-item div:first-of-type").toArray().map((item) => {
				const $item = $(item);
				if ($item.hasClass("video")) return $item.find("video").prop("outerHTML");
				$item.find("img").attr("src", $item.find("img").attr("data-src"));
				$item.find("img").removeAttr("data-src");
				return $item.html() || "";
			}).join("") : $(".view .video").html() || "";
			item.description = `${media}<br>${item.description}`;
		}
		return item;
	})));
	await context.close();
	return {
		title: `${$("h1.fullname").text()} (@${id}) ${type === "tagged" ? "tagged" : "public"} posts - Picnob`,
		description: $(".info .sum").text(),
		link: profileUrl,
		image: $(".ava .pic img").attr("src"),
		item: items
	};
}
//#endregion
export { route };
