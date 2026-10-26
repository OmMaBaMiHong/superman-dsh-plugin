import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/devolverdigital/blog.ts
const route = {
	path: "/blog",
	categories: ["game"],
	example: "/devolverdigital/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["devolverdigital.com/blog"] }],
	name: "Official Blogs",
	maintainers: ["XXY233"],
	handler,
	url: "devolverdigital.com/blog"
};
async function handler() {
	return {
		title: "DevolverDigital Blog",
		language: "en-us",
		link: "https://www.devolverdigital.com/blog",
		item: await fetchPage()
	};
}
async function fetchPage() {
	const $ = load(await rofetch("https://www.devolverdigital.com/blog"), { scriptingEnabled: false });
	const $titleDivs = $("div.w-full.flex.justify-center.py-4.bg-red-400.undefined");
	const $contentDivs = $("div.bg-gray-800.flex.justify-center.font-sm.py-4");
	return $titleDivs.toArray().map((titleDiv, index) => {
		const content = $contentDivs[index];
		const postAuthor = parsePostAuthor($, titleDiv);
		const postDate = parsePostDate($, titleDiv);
		const postTitle = $(titleDiv).find("h1").text();
		const postLink = $(content).find("div.ml-auto.flex.items-center a").attr("href");
		parsePostImages($, content);
		return {
			title: postTitle,
			link: postLink,
			author: postAuthor,
			pubDate: postDate,
			description: $.html($(content).find("div.cms-content"))
		};
	});
}
function parsePostAuthor($, titleDiv) {
	return $(titleDiv).find("div.font-xs.leading-none.mb-1").text().replace("By ", "") || "Devolver Digital";
}
function parsePostDate($, titleDiv) {
	const cleanedDateStr = $(titleDiv).find("div.font-2xs.leading-none.mb-1").text().replace(/(\d+)(st|nd|rd|th)/, "$1");
	return new Date(cleanedDateStr);
}
function parsePostImages($, content) {
	$(content).find("img").each((index, img) => {
		const $img = $(img);
		const src = $img.attr("src") || "";
		if (src.startsWith("/_next/image")) {
			const actualSrc = ($img.attr("srcset") || "").split(",").pop()?.split(" ", 1)[0] || src;
			$img.attr("src", actualSrc);
		}
		$img.removeAttr("loading").removeAttr("decoding").removeAttr("data-nimg").removeAttr("style").removeAttr("sizes").removeAttr("srcset").removeAttr("referrerpolicy");
	});
}
//#endregion
export { route };
