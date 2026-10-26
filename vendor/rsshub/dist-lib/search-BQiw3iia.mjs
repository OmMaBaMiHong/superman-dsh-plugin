import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
import sanitizeHtml from "sanitize-html";
//#region lib/routes/kleinanzeigen/utils/get-product-page.ts
/**
* Parse item infos about a product page
* @param url url of the product page
* @returns
*/
const getProductPage = (url) => cache_default.tryGet(url, async () => {
	const $ = load(await rofetch(url));
	const product = $("#viewad-product");
	const sellerProfile = $("#viewad-profile-box");
	const title = product.find("#viewad-title").find(".is-hidden").remove().end().text().trim();
	const price = product.find(".boxedarticle--price").text().trim() + " " + product.find(".boxedarticle--details--shipping").text().trim();
	const address = product.find("[itemprop=\"address\"]").text().trim();
	const description = sanitizeHtml(product.find("[itemprop=\"description\"]").html() || "", { allowedTags: ["br"] });
	const imagesHtml = product.find("#viewad-image").toArray().map((img) => ({
		src: $(img).attr("src"),
		alt: $(img).attr("alt")
	})).filter((img) => img.src).map((img) => `<img src="${img.src}" alt="${img.alt}" />`).join("<br>");
	const category = [...$(".breadcrump .breadcrump-link").toArray().slice(1).map((x) => $(x).text().trim()), product.find(".addetailslist--detail").filter((i, el) => $(el).text().includes("Art")).find(".addetailslist--detail--value").text().trim()].join(" > ");
	return {
		title,
		link: url,
		description: `${price}<br>${address}<br><br>${description}<br>${imagesHtml}<br>`,
		author: [{
			name: sellerProfile.find(".userprofile-vip a").text().trim(),
			url: sellerProfile.find(".userprofile-vip a").attr("href")
		}],
		category: [category]
	};
});
//#endregion
//#region lib/routes/kleinanzeigen/utils/parse-listing-page.ts
/**
* parse listing page to get product infos
* @param $ CheerioAPI data
* @returns
*/
const parseListingPage = ($) => Promise.all($("li.ad-listitem.fully-clickable-card").not(".badge-topad").toArray().map((item) => {
	return getProductPage(`https://www.kleinanzeigen.de${$(item).find("article").first().attr("data-href")}`);
}));
//#endregion
//#region lib/routes/kleinanzeigen/utils/resolve-category.ts
const category2Id = {
	"Alle Kategorien": 0,
	"Auto, Rad & Boot": 289,
	Autos: 216,
	"Autoteile & Reifen": 223,
	"Boote & Bootszubehör": 211,
	"Fahrräder & Zubehör": 217,
	"Motorräder & Motorroller": 305,
	"Motorradteile & Zubehör": 306,
	"Nutzfahrzeuge & Anhänger": 276,
	"Reparaturen & Dienstleistungen": 280,
	"Wohnwagen & -mobile": 220,
	"Weiteres Auto, Rad & Boot": 241,
	Dienstleistungen: 297,
	Altenpflege: 236,
	"Babysitter/-in & Kinderbetreuung": 237,
	Elektronik: 161,
	"Haus & Garten": 80,
	"Künstler/-in & Musiker/-in": 191,
	"Reise & Event": 294,
	"Tierbetreuung & Training": 133,
	"Umzug & Transport": 238,
	"Weitere Dienstleistungen": 298,
	"Eintrittskarten & Tickets": 231,
	"Bahn & ÖPNV": 286,
	"Comedy & Kabarett": 254,
	Gutscheine: 287,
	Kinder: 252,
	Konzerte: 255,
	Sport: 257,
	"Theater & Musical": 251,
	"Weitere Eintrittskarten & Tickets": 256,
	"Audio & Hifi": 172,
	"Dienstleistungen Elektronik": 226,
	Foto: 245,
	"Handy & Telefon": 173,
	Haushaltsgeräte: 176,
	Konsolen: 279,
	Notebooks: 278,
	PCs: 228,
	"PC-Zubehör & Software": 225,
	"Tablets & Reader": 285,
	"TV & Video": 175,
	Videospiele: 227,
	Wearables: 405,
	"Wearables Zubehör": 406,
	"Weitere Elektronik": 168,
	"Familie, Kind & Baby": 17,
	"Baby- & Kinderkleidung": 22,
	"Baby- & Kinderschuhe": 19,
	"Baby-Ausstattung": 258,
	"Babyschalen & Kindersitze": 21,
	"Kinderwagen & Buggys": 25,
	Kinderzimmermöbel: 20,
	Spielzeug: 23,
	"Weiteres Familie, Kind & Baby": 18,
	"Freizeit, Hobby & Nachbarschaft": 185,
	"Esoterik & Spirituelles": 265,
	"Essen & Trinken": 248,
	Freizeitaktivitäten: 187,
	"Handarbeit, Basteln & Kunsthandwerk": 282,
	"Kunst & Antiquitäten": 240,
	Modellbau: 249,
	"Reise & Eventservices": 233,
	Sammeln: 234,
	"Sport & Camping": 230,
	Trödel: 250,
	"Verloren & Gefunden": 189,
	"Weiteres Freizeit, Hobby & Nachbarschaft": 242,
	Badezimmer: 91,
	Büro: 93,
	Dekoration: 246,
	"Dienstleistungen Haus & Garten": 239,
	"Gartenzubehör & Pflanzen": 89,
	Heimtextilien: 90,
	Heimwerken: 84,
	"Küche & Esszimmer": 86,
	"Lampen & Licht": 82,
	Schlafzimmer: 81,
	Wohnzimmer: 88,
	"Weiteres Haus & Garten": 87,
	Haustiere: 130,
	Fische: 138,
	Hunde: 134,
	Katzen: 136,
	Kleintiere: 132,
	Nutztiere: 135,
	Pferde: 139,
	"Vermisste Tiere": 283,
	Vögel: 243,
	Zubehör: 313,
	Immobilien: 195,
	"Auf Zeit & WG": 199,
	Container: 402,
	Eigentumswohnungen: 196,
	"Ferien- & Auslandsimmobilien": 275,
	"Garagen & Stellplätze": 197,
	Gewerbeimmobilien: 277,
	"Grundstücke & Gärten": 207,
	"Häuser zum Kauf": 208,
	"Häuser zur Miete": 205,
	Mietwohnungen: 203,
	Neubauprojekte: 403,
	"Weitere Immobilien": 198,
	Jobs: 102,
	Ausbildung: 118,
	"Bau, Handwerk & Produktion": 111,
	"Büroarbeit & Verwaltung": 114,
	"Gastronomie & Tourismus": 110,
	"Kundenservice & Call Center": 105,
	"Mini- & Nebenjobs": 107,
	Praktika: 125,
	"Sozialer Sektor & Pflege": 123,
	"Transport, Logistik & Verkehr": 247,
	"Vertrieb, Einkauf & Verkauf": 117,
	"Weitere Jobs": 109,
	"Mode & Beauty": 153,
	"Beauty & Gesundheit": 269,
	Damenbekleidung: 154,
	Damenschuhe: 159,
	Herrenbekleidung: 160,
	Herrenschuhe: 158,
	"Taschen & Accessoires": 156,
	"Uhren & Schmuck": 157,
	"Weiteres Mode & Beauty": 155,
	"Musik, Filme & Bücher": 73,
	"Bücher & Zeitschriften": 76,
	"Büro & Schreibwaren": 281,
	Comics: 284,
	"Fachbücher, Schule & Studium": 77,
	"Film & DVD": 79,
	"Musik & CDs": 78,
	Musikinstrumente: 74,
	"Weitere Musik, Filme & Bücher": 75,
	Nachbarschaftshilfe: 401,
	"Unterricht & Kurse": 235,
	Computerkurse: 260,
	"Kochen & Backen": 263,
	"Kunst & Gestaltung": 264,
	"Musik & Gesang": 262,
	Nachhilfe: 268,
	Sportkurse: 261,
	Sprachkurse: 271,
	Tanzkurse: 267,
	Weiterbildung: 266,
	"Weitere Unterricht & Kurse ": 270,
	"Verschenken & Tauschen": 272,
	Tauschen: 273,
	Verleihen: 274,
	Verschenken: 192
};
/**
* Resolve the Category string to categoryId
* @param category: string category string as entered into the Kleinanzeigen search
* @returns
*/
const resolveCategory = (category) => category2Id[category] || 0;
//#endregion
//#region lib/routes/kleinanzeigen/utils/resolve-location.ts
/**
* Resolve the Location string to locationId
* @param location location string as entered into the Kleinanzeigen search
* @returns
*/
const resolveLocation = async (location) => {
	const url = new URL("https://www.kleinanzeigen.de/s-ort-empfehlungen.json");
	url.searchParams.append("query", location);
	const urlString = url.href;
	const res = await cache_default.tryGet(urlString, async () => await rofetch(urlString));
	const locationEntry = Object.entries(res).findLast((x) => x[1] === location);
	if (!locationEntry) return null;
	return Number.parseInt(locationEntry[0].slice(1));
};
//#endregion
//#region lib/routes/kleinanzeigen/utils/search.ts
/**
* parse listing page to get product infos
* @param $ CheerioAPI data
* @returns
*/
const search = async (opts) => {
	const url = new URL("https://www.kleinanzeigen.de/s-suchanfrage.html");
	if (opts.categoryId) url.searchParams.append("categoryId", opts.categoryId.toString());
	else if (opts.category) {
		const locId = resolveCategory(opts.category);
		url.searchParams.append("categoryId", locId?.toString() || "");
	} else url.searchParams.append("categoryId", "");
	if (opts.locationId) url.searchParams.append("locationId", opts.locationId.toString());
	else if (opts.location) {
		const locId = await resolveLocation(opts.location);
		url.searchParams.append("locationId", locId?.toString() || "");
	} else url.searchParams.append("locationId", "");
	url.searchParams.append("keywords", opts.query || "");
	url.searchParams.append("locationStr", "");
	url.searchParams.append("radius", opts.radius?.toString() || "");
	url.searchParams.append("sortingField", opts.sortingField || "SORTING_DATE");
	url.searchParams.append("adType", "");
	url.searchParams.append("posterType", "");
	url.searchParams.append("maxPrice", opts.maxPrice?.toString() || "");
	url.searchParams.append("minPrice", opts.minPrice?.toString() || "");
	url.searchParams.append("buyNowEnabled", opts.minPrice ? "true" : "false");
	url.searchParams.append("shippingCarrier", opts.shippingCarrier || "");
	url.searchParams.append("shipping", "");
	const items = await parseListingPage(load(await rofetch(url.href)));
	return {
		title: `Kleinanzeigen Offers: ${opts.query || opts.category} ${opts.minPrice || opts.maxPrice ? `${opts.minPrice || 0}€ - ${opts.maxPrice}` : ""}`,
		link: url.href,
		language: "de",
		item: items
	};
};
//#endregion
//#region lib/routes/kleinanzeigen/search.ts
const route = {
	path: "/search/:routeParams",
	categories: ["shopping"],
	example: "/kleinanzeigen/search/category=PCs&location=Berlin&radius=20",
	parameters: { routeParams: "Extra parameters, see the table below" },
	description: `::: tip
Parameter

| Name            | Description                                                               | Default       |
| --------------- | ------------------------------------------------------------------------- | ------------- |
| query           | Search Query                                                              | undefined     |
| category        | Category (as named on Kleinanzeigen)                                      | undefined     |
| categoryId      | Category ID (advanced)                                                    | undefined     |
| location        | Location (as named on Kleinanzeigen)                                      | undefined     |
| locationId      | Location ID (advanced)                                                    | undefined     |
| radius          | Radius in KM around the Location                                          | 0             |
| sortingField    | Order of the Products (SORTING\\_DATE, PRICE\\_AMOUNT, PRICE\\_AMOUNT\\_DESC) | SORTING\\_DATE |
| minPrice        | minimal Price                                                             | undefined     |
| maxPrice        | maximal Price                                                             | undefined     |
| shippingCarrier | Shipping Carrier (e.g. DHL, HERMES)                                       | undefined     |

:::`,
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [],
	name: "Search",
	maintainers: ["LunyaaDev"],
	handler
};
function handler(ctx) {
	const { routeParams } = ctx.req.param();
	const params = new URLSearchParams(routeParams);
	return search({
		query: params.get("query") || void 0,
		category: params.get("category") || void 0,
		categoryId: params.get("categoryId") || void 0,
		location: params.get("location") || void 0,
		locationId: params.get("locationId") || void 0,
		radius: params.get("radius") || void 0,
		sortingField: params.get("sortingField") || void 0,
		minPrice: params.get("minPrice") || void 0,
		maxPrice: params.get("maxPrice") || void 0,
		shippingCarrier: params.get("shippingCarrier") || void 0
	});
}
//#endregion
export { route };
