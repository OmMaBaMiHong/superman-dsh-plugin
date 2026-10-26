import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/discuz/discuz.ts
function fixUrl(itemLink, baseUrl) {
	if (itemLink) {
		if (baseUrl && !/^https?:\/\//.test(baseUrl)) baseUrl = baseUrl.startsWith("//") ? "http:" + baseUrl : "http://" + baseUrl;
		itemLink = new URL(itemLink, baseUrl).href;
	}
	return itemLink;
}
async function fetchWithAntiBot(url, header) {
	let response = await rofetch.raw(url, {
		method: "get",
		responseType: "arrayBuffer",
		headers: header
	});
	let responseData = Buffer.from(response._data);
	if (iconv.decode(responseData, "utf-8").includes("document.location.reload()")) {
		const cookieStr = (response.headers.getSetCookie?.() ?? []).map((c) => c.split(";", 1)[0]).join("; ");
		if (cookieStr) {
			response = await rofetch.raw(url, {
				method: "get",
				responseType: "arrayBuffer",
				headers: {
					...header,
					Cookie: [header.Cookie, cookieStr].filter(Boolean).join("; ")
				}
			});
			responseData = Buffer.from(response._data);
		}
	}
	return {
		response,
		responseData
	};
}
async function loadContent(itemLink, charset, header) {
	const { responseData: rawData } = await fetchWithAntiBot(itemLink, header);
	const responseData = iconv.decode(rawData, charset ?? "utf-8");
	if (!responseData) return { description: "获取详细内容失败" };
	const $ = load(responseData);
	const post = $("div#postlist div[id^=post] td[id^=postmessage]").first();
	post.find("img").each((_, img) => {
		img = $(img);
		if (img.attr("src")?.endsWith("none.gif") && img.attr("file")) {
			img.attr("src", img.attr("file") || img.attr("zoomfile"));
			img.removeAttr("file");
			img.removeAttr("zoomfile");
		}
	});
	return { description: post.html() };
}
const route = {
	path: [
		"/:ver{[7x]}/:cid{[0-9]{2}}/:link{.+}",
		"/:ver{[7x]}/:link{.+}",
		"/:link{.+}"
	],
	name: "Unknown",
	maintainers: ["pseudoyu"],
	handler
};
async function handler(ctx) {
	let link = ctx.req.param("link");
	const ver = ctx.req.param("ver") ? ctx.req.param("ver").toUpperCase() : void 0;
	const cid = ctx.req.param("cid");
	link = link.replace(/:\/\//, ":/").replace(/:\//, "://");
	const cookie = cid === void 0 ? "" : config.discuz.cookies[cid];
	if (cookie === void 0) throw new ConfigNotFoundError("缺少对应论坛的cookie.");
	const header = { Cookie: cookie };
	const { response, responseData } = await fetchWithAntiBot(link, header);
	const contentType = response.headers["content-type"] || "";
	let $ = load(iconv.decode(responseData, "utf-8"));
	const charset = contentType.match(/charset=([^;]*)/)?.[1] ?? $("meta[charset]").attr("charset") ?? $("meta[http-equiv=\"Content-Type\"]").attr("content")?.split("charset=", 2)?.[1];
	if (charset?.toLowerCase() !== "utf-8") $ = load(iconv.decode(responseData, charset ?? "utf-8"));
	const version = ver ? `DISCUZ! ${ver}` : $("head > meta[name=generator]").attr("content");
	if (!version) throw new InvalidParameterError("无法检测 Discuz 版本，请在路由中指定版本参数，如 /discuz/x/ 或 /discuz/7/");
	let items;
	if (version.toUpperCase().startsWith("DISCUZ! 7")) {
		const list = $("tbody[id^=\"normalthread\"] > tr").slice(0, ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 5).toArray().map((item) => {
			item = $(item);
			const a = item.find("span[id^=thread] a");
			return {
				title: a.text().trim(),
				link: fixUrl(a.attr("href"), link),
				pubDate: item.find("td.author em").length ? parseDate(item.find("td.author em").text().trim()) : void 0,
				author: item.find("td.author cite a").text().trim()
			};
		});
		items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { description } = await loadContent(item.link, charset, header);
			item.description = description;
			return item;
		})));
	} else if (version.toUpperCase().startsWith("DISCUZ! X")) {
		const list = $("tbody[id^=\"normalthread\"] > tr").slice(0, ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 5).toArray().map((item) => {
			item = $(item);
			const a = item.find("a.xst");
			return {
				title: a.text(),
				link: fixUrl(a.attr("href"), link),
				pubDate: item.find("td.by:nth-child(3) em span").last().length ? parseDate(item.find("td.by:nth-child(3) em span").last().text().trim()) : void 0,
				author: item.find("td.by:nth-child(3) cite a").text().trim()
			};
		});
		items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { description } = await loadContent(item.link, charset, header);
			item.description = description;
			return item;
		})));
	} else throw new InvalidParameterError("不支持当前Discuz版本.");
	return {
		title: $("head > title").text(),
		description: $("head > meta[name=description]").attr("content"),
		link,
		item: items
	};
}
//#endregion
export { route };
