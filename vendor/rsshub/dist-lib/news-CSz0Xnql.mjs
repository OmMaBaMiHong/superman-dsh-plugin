import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/nhk/news.tsx
const baseUrl = "https://www3.nhk.or.jp";
const apiUrl = "https://api.nhkworld.jp";
const route = {
	path: "/news/:lang?",
	categories: ["traditional-media"],
	view: 0,
	example: "/nhk/news/en",
	parameters: { lang: {
		description: "Language, see below",
		options: [
			{
				value: "ar",
				label: "العربية"
			},
			{
				value: "bn",
				label: "বাংলা"
			},
			{
				value: "my",
				label: "မြန်မာဘာသာစကား"
			},
			{
				value: "zh",
				label: "中文（简体）"
			},
			{
				value: "zt",
				label: "中文（繁體）"
			},
			{
				value: "en",
				label: "English"
			},
			{
				value: "fr",
				label: "Français"
			},
			{
				value: "hi",
				label: "हिन्दी"
			},
			{
				value: "id",
				label: "Bahasa Indonesia"
			},
			{
				value: "ko",
				label: "코리언"
			},
			{
				value: "fa",
				label: "فارسی"
			},
			{
				value: "pt",
				label: "Português"
			},
			{
				value: "ru",
				label: "Русский"
			},
			{
				value: "es",
				label: "Español"
			},
			{
				value: "sw",
				label: "Kiswahili"
			},
			{
				value: "th",
				label: "ภาษาไทย"
			},
			{
				value: "tr",
				label: "Türkçe"
			},
			{
				value: "uk",
				label: "Українська"
			},
			{
				value: "ur",
				label: "اردو"
			},
			{
				value: "vi",
				label: "Tiếng Việt"
			}
		],
		default: "en"
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www3.nhk.or.jp/nhkworld/:lang/news/list/", "www3.nhk.or.jp/nhkworld/:lang/news/"],
		target: "/news/:lang"
	}],
	name: "WORLD-JAPAN - Top Stories",
	maintainers: [
		"TonyRL",
		"pseudoyu",
		"cscnk52"
	],
	handler
};
async function handler(ctx) {
	const { lang = "en" } = ctx.req.param();
	const data = await rofetch(`${apiUrl}/nwapi/rdnewsweb/v7b/${lang}/outline/list.json`);
	const meta = await rofetch(`${baseUrl}/nhkworld/common/assets/news/config/${lang}.json`);
	let items = data.data.map((item) => ({
		title: item.title,
		description: item.description,
		link: `${baseUrl}${item.page_url}`,
		pubDate: parseDate(item.public_at, "x"),
		updated: parseDate(item.updated_at, "x"),
		category: item.categories.name,
		id: item.id
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data } = await rofetch(`${apiUrl}/nwapi/rdnewsweb/v6b/${lang}/detail/${item.id}.json`);
		const img = data.thumbnails;
		const imageSrc = img?.large || img?.middle || img?.small || img?.min;
		const description = data.detail.replaceAll("\n", "<br>");
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [imageSrc ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", {
			src: imageSrc,
			alt: img?.alt
		}), /* @__PURE__ */ jsx("br", {})] }) : null, description ? raw(description) : null] }));
		delete item.id;
		return item;
	})));
	return {
		title: `${Object.values(meta.config.navigation.header).find((h) => h.keyname === "topstories")?.name} | NHK WORLD-JAPAN News`,
		link: `${baseUrl}/nhkworld/${lang}/news/list/`,
		item: items
	};
}
//#endregion
export { route };
