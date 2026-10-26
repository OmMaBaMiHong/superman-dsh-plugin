import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import dayjs from "dayjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/appstorrent/programs.tsx
const route = {
	path: "/programs",
	categories: ["program-update"],
	example: "/appstorrent/programs",
	name: "Programs",
	maintainers: ["xzzpig"],
	handler,
	url: "appstorrent.ru/programs/"
};
async function handler(ctx) {
	const limit = ctx?.req.query("limit") ? Number.parseInt(ctx?.req.query("limit") ?? "20") : 20;
	const baseUrl = "https://appstorrent.ru";
	const currentUrl = `${baseUrl}/programs/`;
	const gotOptions = { http2: true };
	const $ = load((await got_default(currentUrl, gotOptions)).data);
	const list = $("article.soft-item:not(.locked)").slice(0, limit).toArray().map((item) => {
		const $item = $(item);
		return {
			title: $item.find(".subtitle").text().trim(),
			link: $item.find(".subtitle a").attr("href"),
			category: [$item.find(".info .category").text().trim()],
			version: $item.find(".version").text(),
			architecture: $item.find(".architecture").text().trim(),
			size: $item.find(".size").text().trim()
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link, gotOptions)).data);
		const pubDate = parseDate($(".tech-info .date-news a").attr("href")?.replace("https://appstorrent.ru/", "") ?? "");
		return {
			title: item.title,
			link: item.link,
			category: item.category,
			pubDate,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsxs("p", { children: [
					/* @__PURE__ */ jsx("img", { src: baseUrl + $(".main-title img").attr("src")?.trim() }),
					/* @__PURE__ */ jsx("h1", { children: item.title }),
					/* @__PURE__ */ jsx("br", {}),
					/* @__PURE__ */ jsx("b", { children: "Public Date" }),
					": ",
					dayjs(pubDate).format("YYYY-MM-DD"),
					/* @__PURE__ */ jsx("br", {}),
					/* @__PURE__ */ jsx("b", { children: "Version" }),
					": ",
					item.version,
					/* @__PURE__ */ jsx("br", {}),
					/* @__PURE__ */ jsx("b", { children: "Architecture" }),
					": ",
					item.architecture,
					/* @__PURE__ */ jsx("br", {}),
					/* @__PURE__ */ jsx("b", { children: "Compactibility" }),
					": ",
					$("div.right > div.info > div.right-container > div:nth-child(5) > div > span:nth-child(2) > a").text(),
					/* @__PURE__ */ jsx("br", {}),
					/* @__PURE__ */ jsx("b", { children: "Size" }),
					": ",
					item.size,
					/* @__PURE__ */ jsx("br", {}),
					/* @__PURE__ */ jsx("b", { children: "Activation" }),
					": ",
					$("div.right > div.info > div.right-container > div:nth-child(4) > div > span:nth-child(2) > a").text(),
					/* @__PURE__ */ jsx("br", {})
				] }),
				/* @__PURE__ */ jsx("b", { children: "Description" }),
				":",
				/* @__PURE__ */ jsx("p", { children: $(".content .body-content").first().text() }),
				/* @__PURE__ */ jsx("b", { children: "Change Log" }),
				":",
				/* @__PURE__ */ jsx("p", { children: $(".content .body-content").last().text() }),
				/* @__PURE__ */ jsx("b", { children: "Screenshots" }),
				$(".screenshots img").toArray().map((img) => $(img).attr("src")).map((src) => baseUrl + src).map((src) => /* @__PURE__ */ jsx("img", { src }))
			] }))
		};
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		allowEmpty: true,
		item: items
	};
}
//#endregion
export { route };
