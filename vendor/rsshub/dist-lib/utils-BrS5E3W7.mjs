import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import dayjs from "dayjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import { JSDOM } from "jsdom";
import "dayjs/locale/zh-cn.js";
//#region lib/routes/nintendo/templates/eshop-cn.tsx
const renderEshopCnDescription = ({ item, software, releaseDatetime }) => {
	const normalPlayers = software.normalPlayersNum ? software.normalPlayersNum.max === software.normalPlayersNum.min ? software.normalPlayersNum.max : `${software.normalPlayersNum.min}-${software.normalPlayersNum.max}` : void 0;
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		software.coverImage ? /* @__PURE__ */ jsx("img", { src: `https:${software.coverImage}` }) : item.description ? /* @__PURE__ */ jsx(Fragment, { children: raw(item.description) }) : null,
		/* @__PURE__ */ jsx("h1", { children: software.descriptionTitle }),
		software.descriptionContent ? /* @__PURE__ */ jsxs(Fragment, { children: [
			raw(software.descriptionContent.replaceAll("\n", "<br>")),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("br", {})
		] }) : null,
		/* @__PURE__ */ jsxs("table", { children: [
			software.price ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "建议零售价" }), /* @__PURE__ */ jsxs("td", { children: [
				software.price,
				" ",
				software.currency
			] })] }) : null,
			software.sizeNum ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "游戏大小" }), /* @__PURE__ */ jsxs("td", { children: [
				software.sizeNum,
				" ",
				software.sizeUnit
			] })] }) : null,
			software.playMode ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "游戏模式" }), /* @__PURE__ */ jsx("td", { children: software.playMode.join(", ") })] }) : null,
			normalPlayers ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "游戏人数" }), /* @__PURE__ */ jsx("td", { children: normalPlayers })] }) : null,
			software.handleSupport ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "手柄支持" }), /* @__PURE__ */ jsx("td", { children: software.handleSupport })] }) : null,
			software.platform ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "平台" }), /* @__PURE__ */ jsx("td", { children: software.platform })] }) : null,
			software.publisher ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "发行商" }), /* @__PURE__ */ jsx("td", { children: software.publisher })] }) : null,
			software.genre ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "类型" }), /* @__PURE__ */ jsx("td", { children: software.genre.join("/") })] }) : null,
			releaseDatetime ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "发售日" }), /* @__PURE__ */ jsx("td", { children: releaseDatetime })] }) : null,
			software.supportLanguages ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "支持语言" }), /* @__PURE__ */ jsx("td", { children: software.supportLanguages.join("/") })] }) : null,
			software.ageAppropriateInfo ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "适龄信息" }), /* @__PURE__ */ jsx("td", { children: software.ageAppropriateInfo.text ? raw(software.ageAppropriateInfo.text.replaceAll("\n", "<br>")) : null })] }) : null
		] }),
		/* @__PURE__ */ jsx("br", {}),
		software.images?.length ? software.images.slice(1).map((image, index) => /* @__PURE__ */ jsx("img", { src: `https:${image}` }, `${image}-${index}`)) : null
	] }));
};
//#endregion
//#region lib/routes/nintendo/utils.ts
dayjs.extend(localizedFormat);
function nuxtReader(data) {
	let nuxt;
	try {
		nuxt = new JSDOM(data, { runScripts: "dangerously" }).window.__NUXT__.data[0];
	} catch {
		throw new Error("Nuxt 框架信息提取失败，请报告这个问题");
	}
	return nuxt;
}
function generateImageLink(link) {
	return `<img src="${link}"><br/>`;
}
async function loadContent(link) {
	const data = (await got_default(link)).data;
	return { content: load(data)(".description").html() };
}
async function loadNews(link) {
	const data = (await got_default(link)).data;
	const $ = load(data);
	let description = $(".detail-body-container").html();
	const date = $(".topics-articleHead__date").text();
	description = description.replaceAll("src=\"/topics/", "src=\"https://www.nintendo.com.hk/topics/");
	return {
		content: description,
		pubDate: parseDate(date, "YYYY.M.D")
	};
}
const ProcessItem = (list, caches) => Promise.all(list.map(async (item) => {
	const other = await caches.tryGet(item.link, () => loadContent(item.link));
	return {
		...item,
		...other
	};
}));
const ProcessNews = (list, caches) => Promise.all(list.map(async (item) => {
	const other = await caches.tryGet(item.url, () => loadNews("https://www.nintendo.com.hk" + item.url));
	return {
		...item,
		...other
	};
}));
const ProcessItemChina = (list, cache) => Promise.all(list.map(async (item) => {
	if (!item.link.startsWith("https://www.nintendoswitch.com.cn/software/")) return item;
	const software = (await cache.tryGet(item.link, async () => nuxtReader((await got_default(item.link)).data))).data;
	return {
		...item,
		category: [
			...software.supportLanguages,
			...software.genre,
			...software.playMode
		],
		description: renderEshopCnDescription({
			item,
			software,
			releaseDatetime: dayjs(software.releaseDatetime).locale("zh-cn").format("lll")
		})
	};
}));
const ProcessNewsChina = (list, cache) => Promise.all(list.map(async (item) => {
	const n = await cache.tryGet(item.link, async () => nuxtReader((await got_default(item.link)).data));
	return {
		...item,
		description: item.description + n.newsData.content,
		category: n.newsData.category,
		pubDate: parseDate(n.newsData.releaseTime, "x")
	};
}));
var utils_default = {
	ProcessItem,
	ProcessNews,
	ProcessNewsChina,
	ProcessItemChina,
	nuxtReader,
	generateImageLink
};
//#endregion
export { utils_default as t };
