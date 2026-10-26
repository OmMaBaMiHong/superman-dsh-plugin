import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/binance/announcement.ts
const TYPE_CATALOG_ID_MAP = {
	"new-cryptocurrency-listing": 48,
	"latest-binance-news": 49,
	"latest-activities": 93,
	"new-fiat-listings": 50,
	"api-updates": 51,
	"crypto-airdrop": 128,
	"wallet-maintenance-updates": 157,
	delisting: 161
};
const LANGUAGE_ALIASES = {
	"en-US": "en",
	zh: "zh-CN"
};
const normalizeLanguage = (lang) => lang ? LANGUAGE_ALIASES[lang] ?? lang : "zh-CN";
const isLanguageCode = (lang) => {
	const normalized = normalizeLanguage(lang);
	return normalized === "en" || normalized === "zh-CN";
};
const handler = async (ctx) => {
	const baseUrl = "https://www.binance.com";
	const rawType = ctx.req.param("type");
	const rawLang = ctx.req.param("lang");
	const limit = Number(ctx.req.query("limit") ?? "20");
	const pageSize = Number.isNaN(limit) || limit <= 0 ? 20 : limit;
	let type = rawType;
	let language = normalizeLanguage(rawLang);
	if (!rawLang && rawType && isLanguageCode(rawType)) {
		language = normalizeLanguage(rawType);
		type = void 0;
	}
	if (type === "all") type = void 0;
	let catalogId;
	if (type) {
		const mappedCatalogId = TYPE_CATALOG_ID_MAP[type];
		if (!mappedCatalogId) throw new Error(`${type} is not supported`);
		catalogId = mappedCatalogId;
	}
	const pageUrl = `${baseUrl}/${language}/messages/v2/group/announcement`;
	const listUrl = new URL(`${baseUrl}/bapi/apex/v1/public/apex/cms/article/list/query`);
	listUrl.searchParams.set("type", "1");
	listUrl.searchParams.set("pageNo", "1");
	listUrl.searchParams.set("pageSize", String(pageSize));
	if (catalogId) listUrl.searchParams.set("catalogId", String(catalogId));
	const headers = {
		Referer: pageUrl,
		"Accept-Language": language,
		"User-Agent": config.trueUA,
		lang: language
	};
	const catalogs = (await rofetch(listUrl.href, { headers })).data?.catalogs ?? [];
	const item = catalogs.flatMap((catalog) => catalog.articles.map((article) => ({
		title: article.title,
		link: `${baseUrl}/${language}/support/announcement/${article.code}`,
		pubDate: parseDate(article.releaseDate),
		category: catalog.catalogName ? [catalog.catalogName] : void 0,
		releaseDate: article.releaseDate
	}))).toSorted((a, b) => b.releaseDate - a.releaseDate).slice(0, pageSize).map(({ releaseDate: _releaseDate, ...rest }) => rest);
	const catalogName = catalogId ? catalogs.find((catalog) => catalog.catalogId === catalogId)?.catalogName : void 0;
	return {
		title: catalogName ? `Binance Announcement - ${catalogName}` : "Binance Announcement",
		link: pageUrl,
		description: "Announcement list from Binance message center.",
		item
	};
};
const route = {
	path: "/announcement/:type?/:lang?",
	categories: ["finance"],
	view: 0,
	example: "/binance/announcement/new-cryptocurrency-listing",
	radar: [{
		source: ["www.binance.com/:lang/messages/v2/group/announcement"],
		target: "/binance/announcement/all/:lang"
	}],
	parameters: {
		type: {
			description: "Announcement type. Omit for all categories.",
			default: "all",
			options: [
				{
					value: "all",
					label: "All"
				},
				{
					value: "new-cryptocurrency-listing",
					label: "New Cryptocurrency Listing"
				},
				{
					value: "latest-binance-news",
					label: "Latest Binance News"
				},
				{
					value: "latest-activities",
					label: "Latest Activities"
				},
				{
					value: "new-fiat-listings",
					label: "New Fiat Listings"
				},
				{
					value: "api-updates",
					label: "API Updates"
				},
				{
					value: "crypto-airdrop",
					label: "Crypto Airdrop"
				},
				{
					value: "wallet-maintenance-updates",
					label: "Wallet Maintenance Updates"
				},
				{
					value: "delisting",
					label: "Delisting"
				}
			]
		},
		lang: {
			description: "Language code for the messages page.",
			default: "zh-CN",
			options: [{
				value: "zh-CN",
				label: "Simplified Chinese"
			}, {
				value: "en",
				label: "English"
			}]
		}
	},
	name: "Announcement",
	description: "Announcement list from Binance message center with language and type selection.",
	maintainers: ["enpitsulin", "DIYgod"],
	handler
};
//#endregion
export { route };
