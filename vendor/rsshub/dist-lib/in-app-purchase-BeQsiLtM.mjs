import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/appstore/in-app-purchase.ts
const route = {
	path: "/iap/:country/:id",
	categories: ["program-update"],
	example: "/appstore/iap/us/id953286746",
	parameters: {
		country: "App Store Country, obtain from the app URL https://apps.apple.com/us/app/id953286746, in this case, `us`",
		id: "App Store app id, obtain from the app URL https://apps.apple.com/us/app/id953286746, in this case, `id953286746`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "In-App-Purchase Price Drop Alert",
	maintainers: ["HenryQW"],
	handler
};
async function handler(ctx) {
	const country = ctx.req.param("country");
	const id = ctx.req.param("id");
	const link = `https://apps.apple.com/${country}/app/${id}`;
	const lang = load(await rofetch(link))("html").attr("lang");
	const appData = (await rofetch(`https://apps.apple.com/api/apps/v1/catalog/${country}/apps/${id.replace("id", "")}`, {
		headers: {
			authorization: "Bearer",
			origin: "https://apps.apple.com"
		},
		query: {
			platform: "web",
			include: "merchandised-in-apps,top-in-apps,eula",
			l: lang
		}
	})).data[0];
	const attributes = appData.attributes;
	const platform = attributes.deviceFamilies.includes("mac") ? "macOS" : "iOS";
	let item = [];
	const iap = appData.relationships["top-in-apps"].data;
	if (iap) item = iap.map(({ attributes }) => ({
		title: `${attributes.name} is now ${attributes.offers[0].priceFormatted}`,
		link: attributes.url,
		guid: `${attributes.url}:${attributes.offerName}:${attributes.offers[0].priceString}`,
		description: attributes.artwork ? attributes.description.standard + `<br><img src=${attributes.artwork.url.replace("{w}x{h}{c}.{f}", "3000x3000bb.webp")}>` : attributes.description.standard
	}));
	return {
		title: `${country.toLowerCase() === "cn" ? "内购限免提醒" : "IAP price watcher"}: ${attributes.name} for ${platform}`,
		link,
		item
	};
}
//#endregion
export { route };
