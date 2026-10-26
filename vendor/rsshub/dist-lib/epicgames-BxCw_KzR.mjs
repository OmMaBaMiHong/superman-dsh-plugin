import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import dayjs from "dayjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/epicgames/index.tsx
const route = {
	path: "/freegames/:locale?/:country?",
	categories: ["game"],
	view: 5,
	example: "/epicgames/freegames/en-US/US",
	parameters: {
		locale: {
			description: "Locale",
			default: "en-US"
		},
		country: {
			description: "Country",
			default: "US"
		}
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["store.epicgames.com/:locale/free-games"],
		target: "/freegames/:locale"
	}],
	name: "Free games",
	maintainers: [
		"DIYgod",
		"NeverBehave",
		"Zyx-A",
		"junfengP",
		"nczitzk",
		"KotaHv"
	],
	handler
};
async function handler(ctx) {
	const locale = ctx.req.param("locale") ?? "en-US";
	const country = ctx.req.param("country") ?? "US";
	const rootUrl = "https://store.epicgames.com";
	const currentUrl = `${rootUrl}/${locale}/free-games?lang=${locale}`;
	const apiUrl = `https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions?locale=${locale}&country=${country}&allowCountries=${country}`;
	const contentBaseUrl = `https://store-content-ipv4.ak.epicgames.com/api/${locale}/content`;
	const response = await got_default({
		method: "get",
		url: apiUrl
	});
	const now = dayjs();
	const items = response.data.data.Catalog.searchStore.elements.filter((item) => item.promotions && item.promotions.promotionalOffers && item.promotions.promotionalOffers.length && item.promotions.promotionalOffers[0].promotionalOffers[0].discountSetting.discountType === "PERCENTAGE" && item.promotions.promotionalOffers[0].promotionalOffers[0].discountSetting.discountPercentage === 0 && dayjs(item.promotions.promotionalOffers[0].promotionalOffers[0].startDate) <= now && dayjs(item.promotions.promotionalOffers[0].promotionalOffers[0].endDate) > now).map(async (item) => {
		let link = `${rootUrl}/${locale}/p/`;
		let contentUrl = `${contentBaseUrl}/products/`;
		let isBundles = false;
		if (item.categories.some((category) => category.path === "bundles")) {
			link = `${rootUrl}/${locale}/bundles/`;
			isBundles = true;
			contentUrl = `${contentBaseUrl}/bundles/`;
		}
		let linkSlug = item.catalogNs.mappings && item.catalogNs.mappings.length > 0 ? item.catalogNs.mappings[0].pageSlug : item.offerMappings && item.offerMappings.length > 0 ? item.offerMappings[0].pageSlug : item.productSlug ?? item.urlSlug;
		if (item.offerType === "ADD_ON") linkSlug = item.offerMappings[0].pageSlug;
		link += linkSlug;
		contentUrl += linkSlug;
		let description = item.description;
		if (isBundles) description = (await got_default({
			method: "get",
			url: contentUrl
		})).data.data.about.shortDescription;
		let image = item.keyImages[0].url;
		item.keyImages.some((keyImage) => {
			if (keyImage.type === "DieselStoreFrontWide") {
				image = keyImage.url;
				return true;
			}
			return false;
		});
		const endDate = dayjs(item.promotions.promotionalOffers[0].promotionalOffers[0].endDate).toISOString();
		return {
			title: item.title,
			author: item.seller.name,
			link,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("p", { children: description }),
				/* @__PURE__ */ jsx("img", { src: image }),
				/* @__PURE__ */ jsx("p", { children: `Free Now to ${endDate}` })
			] })),
			pubDate: parseDate(item.promotions.promotionalOffers[0].promotionalOffers[0].startDate)
		};
	});
	return {
		title: "Epic Games Store - Free Games",
		link: currentUrl,
		item: await Promise.all(items)
	};
}
//#endregion
export { route };
