import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/rfi/news.ts
const route = {
	path: "/:path{.+}?",
	radar: [{
		source: ["rfi.fr/*path"],
		target: "/:path"
	}],
	name: "Generic News",
	maintainers: ["nczitzk", "pseudoyu"],
	handler,
	url: "rfi.fr",
	example: "/rfi",
	description: `::: tip

- To subscribe to [English News](https://www.rfi.fr/en/), which URL is \`https://www.rfi.fr/en\`, you can get the route as [\`/rfi/en\`](https://rsshub.app/rfi/en).
- To subscribe to [English Europe News](https://www.rfi.fr/en/europe/), which URL is \`https://www.rfi.fr/en/europe\`, you can get the route as [\`/rfi/en/europe\`](https://rsshub.app/rfi/en/europe).
- To subscribe to topic [Paris Olympics 2024](https://www.rfi.fr/en/tag/paris-olympics-2024/), which URL is \`https://www.rfi.fr/en/tag/paris-olympics-2024\`, you can get the route as [\`/rfi/en/tag/paris-olympics-2024\`](https://rsshub.app/rfi/en/tag/paris-olympics-2024).

:::

::: warning
This route does not support podcasts, please use the Offical RSS feed instead.
:::`
};
async function handler(ctx) {
	const rootUrl = "https://www.rfi.fr/";
	const path = ctx.req.param("path") ?? "en";
	const currentUrl = `${rootUrl}${path.endsWith("/") ? path : `${path}/`}`;
	const $ = load((await got_default(currentUrl)).data);
	$("aside[data-org-type=\"aside-content--highlighted\"], aside[data-org-type=\"aside-content--sponsors\"]").remove();
	let items = $(".article__title a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: new URL(item.attr("href"), currentUrl).href
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		content(".m-interstitial, .m-em-quote svg, .o-self-promo").remove();
		let ldJson;
		for (const el of content("script[type=\"application/ld+json\"]").toArray()) try {
			const parsed = JSON.parse(content(el).text());
			ldJson = (Array.isArray(parsed) ? parsed : [parsed]).find((x) => x["@type"] === "NewsArticle");
			if (ldJson) break;
		} catch {}
		item.description = content(".t-content__chapo").prop("outerHTML") + content(".t-content__main-media").prop("outerHTML") + content(".t-content__body").html();
		item.pubDate = ldJson?.datePublished ? parseDate(ldJson.datePublished) : void 0;
		item.updated = ldJson?.dateModified ? parseDate(ldJson.dateModified) : void 0;
		item.author = ldJson?.author?.map((author) => author.name).join(", ");
		item.category = ldJson?.keywords;
		if (ldJson?.audio) {
			item.itunes_item_image = ldJson.audio.thumbnailUrl;
			const durationMatch = ldJson.audio.duration?.match(/P0DT(\d+)H(\d+)M(\d+)S/);
			if (durationMatch) {
				let seconds = 0;
				for (const part of durationMatch.slice(1)) seconds = seconds * 60 + Number.parseInt(part);
				item.itunes_duration = seconds;
			}
			item.enclosure_url = ldJson.audio.contentUrl;
			item.enclosure_type = "audio/mpeg";
		}
		return item;
	})));
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link: currentUrl,
		image: $("meta[property=\"og:image\"]").attr("content"),
		icon: new URL($("link[rel=\"apple-touch-icon\"]").attr("href"), currentUrl).href,
		logo: new URL($("link[rel=\"apple-touch-icon\"]").attr("href"), currentUrl).href,
		item: items,
		language: $("html").attr("lang")
	};
}
//#endregion
export { route };
