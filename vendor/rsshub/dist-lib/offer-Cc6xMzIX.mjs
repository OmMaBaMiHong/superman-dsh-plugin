import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/ikea/templates/offer.tsx
const IkeaOffer = ({ img, desc }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	img ? raw(img) : null,
	/* @__PURE__ */ jsx("br", {}),
	desc ? raw(desc) : null
] });
const renderOffer = (data) => renderToString(/* @__PURE__ */ jsx(IkeaOffer, { ...data }));
//#endregion
//#region lib/routes/ikea/gb/offer.ts
const route = {
	path: "/gb/offer",
	categories: ["shopping"],
	example: "/ikea/gb/offer",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["ikea.com/gb/en/offers", "ikea.com/"] }],
	name: "UK - Offers",
	maintainers: ["HenryQW"],
	handler,
	url: "ikea.com/gb/en/offers"
};
async function handler() {
	const link = "https://www.ikea.com/gb/en/offers/";
	const $ = load((await got_default(link)).data);
	const carousel = $(".pub__carousel-slide").toArray().map((e) => {
		e = $(e);
		const title = e.find("h3");
		const img = e.find(".pub__image").each((_, e) => {
			e.attribs.src = e.attribs.src.split("?", 1)[0];
			delete e.attribs.srcset;
		});
		const { searchParams, href } = new URL(e.find("pub-hide-empty-link a").attr("href"));
		searchParams.delete("itm_content");
		searchParams.delete("itm_element");
		searchParams.delete("itm_campaign");
		return {
			title: title.text(),
			description: renderOffer({
				img: img.parent().html(),
				desc: title.next().parent().html()
			}),
			link: href,
			guid: `${href}#${title.text()}`
		};
	});
	const banner = $("div[data-pub-type=\"banner\"]").toArray().map((e) => {
		e = $(e);
		const title = e.find("h2");
		const next = title.next();
		const img = e.find(".pub__image").each((_, e) => {
			e.attribs.src = e.attribs.src.split("?", 1)[0];
			delete e.attribs.srcset;
		});
		const { searchParams, href } = new URL(next.find("a").attr("href"));
		searchParams.delete("itm_content");
		searchParams.delete("itm_element");
		searchParams.delete("itm_campaign");
		return {
			title: title.text(),
			description: renderOffer({
				img: img.parent().html(),
				desc: title.parent().html()
			}),
			link: href,
			guid: `${href}#${title.text()}`
		};
	});
	return {
		title: "IKEA UK - Offers",
		link,
		description: "Offers by IKEA UK.",
		item: [...carousel, ...banner]
	};
}
//#endregion
export { route };
