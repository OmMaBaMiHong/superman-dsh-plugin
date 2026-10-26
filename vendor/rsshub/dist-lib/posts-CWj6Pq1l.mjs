import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/deadline/posts.tsx
const renderDescription = (embedded, desc) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [embedded?.["wp:featuredmedia"]?.length ? embedded["wp:featuredmedia"].map((media) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
	src: media.source_url,
	alt: media.alt_text
}), /* @__PURE__ */ jsx("figcaption", { children: media.media_details?.image_meta.caption })] }), /* @__PURE__ */ jsx("br", {})] })) : null, desc ? /* @__PURE__ */ jsx(Fragment, { children: raw(desc) }) : null] }));
const route = {
	path: "/",
	radar: [{
		source: ["deadline.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["TonyRL"],
	handler,
	url: "deadline.com/"
};
async function handler(ctx) {
	const baseUrl = "https://deadline.com";
	const items = (await got_default(`${baseUrl}/wp-json/wp/v2/posts`, { searchParams: {
		per_page: ctx.req.query("limit") ?? 30,
		_embed: true
	} })).data.map((item) => {
		const embedded = item._embedded;
		const $ = load(item.content.rendered, null, false);
		$(".c-lazy-image__img").each((_, img) => {
			img = $(img);
			if (img.attr("data-lazy-src")) {
				img.attr("src", img.attr("data-lazy-src").split("?", 1)[0]);
				img.removeAttr("data-lazy-src");
				img.removeAttr("data-lazy-srcset");
			}
		});
		$("[class^=\"lrv-a-crop-\"]").contents().unwrap();
		const description = renderDescription(embedded, $.html());
		return {
			title: item.title.rendered,
			link: item.link,
			guid: item.guid.rendered,
			description,
			pubDate: parseDate(item.date_gmt),
			author: embedded.author[0].name,
			category: [.../* @__PURE__ */ new Set([...embedded["wp:term"][0].map((i) => i.name), ...embedded["wp:term"][1].map((i) => i.name)])]
		};
	});
	return {
		title: "Deadline – Hollywood Entertainment Breaking News",
		description: "Deadline.com is always the first to break up-to-the-minute entertainment, Hollywood and media news, with an unfiltered, no-holds-barred analysis of events.",
		link: baseUrl,
		language: "en-US",
		image: `${baseUrl}/wp-content/themes/pmc-deadline-2019/assets/app/icons/apple-touch-icon.png`,
		item: items
	};
}
//#endregion
export { route };
