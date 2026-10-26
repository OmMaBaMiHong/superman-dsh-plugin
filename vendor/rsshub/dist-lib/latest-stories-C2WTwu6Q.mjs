import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/nationalgeographic/latest-stories.tsx
const findNatgeo = ($) => JSON.parse($("script").text().match(/\['__natgeo__'\]=(\{.*?\});/)[1]);
const renderStoriesDescription = ({ ldMda, description, body }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	ldMda?.image?.src ? /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
		src: ldMda.image.src,
		alt: ldMda.image.altText
	}), /* @__PURE__ */ jsx("figcaption", { children: ldMda.caption })] }) : null,
	description ? /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("b", { children: description }) }) : null,
	body?.length ? body.map((block) => {
		if (block.type === "p") return /* @__PURE__ */ jsx("p", { children: block.cntnt?.mrkup ? raw(block.cntnt.mrkup) : null });
		if (block.type !== "inline") return null;
		const content = block.cntnt;
		switch (content?.cmsType) {
			case "image": return content.image?.src ? /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
				src: content.image.src,
				alt: content.image.altText
			}), /* @__PURE__ */ jsx("figcaption", { children: content.caption ? raw(content.caption) : null })] }) : null;
			case "imagegroup": return content.images?.map((image) => image.image?.src ? /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
				src: image.image.src,
				alt: image.image.altText
			}), /* @__PURE__ */ jsx("figcaption", { children: image.caption ? raw(image.caption) : null })] }) : null);
			case "editorsNote": return content.note ? /* @__PURE__ */ jsx("p", { children: raw(content.note) }) : null;
			case "listicle": return content.text ? /* @__PURE__ */ jsx("p", { children: raw(content.text) }) : null;
			case "pullquote": return content.quote ? /* @__PURE__ */ jsx("backquote", { children: raw(content.quote) }) : null;
			case "source": return content.src ? /* @__PURE__ */ jsx("a", {
				href: content.src,
				children: content.src
			}) : null;
			case "video": return content.image?.src ? /* @__PURE__ */ jsxs("figure", { children: [
				/* @__PURE__ */ jsx("img", {
					src: content.image.src,
					alt: content.image.altText
				}),
				content.title ? /* @__PURE__ */ jsx("figcaption", { children: raw(content.title) }) : null,
				content.description ? /* @__PURE__ */ jsx("figcaption", { children: raw(content.description) }) : null
			] }) : null;
			default: return null;
		}
	}) : null
] }));
const route = {
	path: "/latest-stories",
	categories: ["travel"],
	example: "/nationalgeographic/latest-stories",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.nationalgeographic.com/pages/topic/latest-stories"] }],
	name: "Latest Stories",
	maintainers: ["miles170"],
	handler,
	url: "www.nationalgeographic.com/pages/topic/latest-stories"
};
async function handler() {
	const currentUrl = "https://www.nationalgeographic.com/pages/topic/latest-stories";
	const $ = load((await got_default(currentUrl)).data);
	const items = await Promise.all(findNatgeo($).page.content.hub.frms.flatMap((e) => e.mods).flatMap((m) => m.tiles?.filter((t) => t.ctas[0]?.text === "natgeo.ctaText.read")).filter(Boolean).map((i) => ({
		title: i.title,
		link: i.ctas[0].url,
		category: i.tags.map((t) => t.name)
	})).map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		const bodyTile = findNatgeo($).page.content.prismarticle.frms.find((f) => f.cmsType === "ArticleBodyFrame").mods.find((m) => m.edgs[0].cmsType === "ArticleBodyTile").edgs[0];
		item.author = bodyTile.cntrbGrp.flatMap((c) => c.contributors).map((c) => c.displayName).join(", ");
		item.description = renderStoriesDescription({
			ldMda: bodyTile.ldMda,
			description: bodyTile.dscrptn,
			body: bodyTile.bdy
		});
		item.pubDate = parseDate(bodyTile.pbDt);
		return item;
	})));
	return {
		title: $("meta[property=\"og:title\"]").attr("content"),
		link: currentUrl,
		item: items.filter((item) => item !== null)
	};
}
//#endregion
export { route };
