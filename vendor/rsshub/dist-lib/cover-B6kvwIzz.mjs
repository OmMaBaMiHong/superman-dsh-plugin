import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as baseUrl } from "./utils-BRhLlhu12.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/science/cover.tsx
const route = {
	path: "/cover",
	categories: ["journal"],
	example: "/science/cover",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["science.org/"] }],
	name: "Cover Story",
	maintainers: ["y9c", "TonyRL"],
	handler,
	url: "science.org/",
	description: `Subscribe to the cover images of Science journals, and get the latest publication updates in time.

Including 'Science', 'Science Advances', 'Science Immunology', 'Science Robotics', 'Science Signaling' and 'Science Translational Medicine'.`
};
async function handler() {
	const pageURL = `${baseUrl}/journals`;
	const { data: pageResponse } = await got_default(pageURL, { headers: { cookie: "cookiePolicy=iaccept;" } });
	const $ = load(pageResponse);
	const items = $(".browse-journals .browse-journals__item").not(".partner-journals").toArray().map((item) => {
		item = $(item);
		const name = item.find(".row h2").first().text().trim();
		const volume = item.find(".row li").eq(0).text().trim().match(/Volume (\d+)/)[1];
		const issue = item.find(".row li").eq(1).text().trim().match(/Issue (\d+)/)[1];
		const date = item.find(".row li").eq(2).text().trim();
		const coverUrl = `${baseUrl}${item.find(".cover-image__popup-moving-cover").attr("data-cover-src")}`;
		const content = $(".cover-image__popup-view__caption-wrapper").html();
		const link = $(".browse-journals__item__links a").eq(0).attr("href").replace("/current", "");
		return {
			title: `${name} | Volume ${volume} Issue ${issue}`,
			description: renderDescription(coverUrl, content),
			link: `${baseUrl}/${link}/${volume}/${issue}`,
			pubDate: parseDate(date)
		};
	});
	return {
		title: $("head title").text(),
		description: $("meta[property=\"og:description\"]").attr("content"),
		image: `${baseUrl}/apple-touch-icon.png`,
		link: pageURL,
		language: "en-US",
		item: items
	};
}
const renderDescription = (coverUrl, content) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: coverUrl }), content ? raw(content) : null] }));
//#endregion
export { route };
