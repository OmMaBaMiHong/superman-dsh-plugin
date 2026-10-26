import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/dealstreetasia/section.ts
const route = {
	path: "/section/:section",
	categories: ["traditional-media"],
	example: "/dealstreetasia/section/private-equity",
	parameters: { section: "target section" },
	radar: [{ source: ["dealstreetasia.com/"] }],
	name: "Section",
	maintainers: ["jack2game"],
	handler,
	url: "dealstreetasia.com/"
};
async function handler(ctx) {
	return await fetchPage(ctx.req.param("section"));
}
async function fetchPage(section) {
	const $ = load(await rofetch(`https://dealstreetasia.com/section/${section}/`));
	const jsonData = JSON.parse($("#__NEXT_DATA__").text());
	const headingText = jsonData.props.pageProps.sectionData.name;
	const feedItems = jsonData.props.pageProps.sectionData.stories.nodes.map((item) => ({
		title: item.title || "No Title",
		link: item.uri ? `https://www.dealstreetasia.com${item.uri}` : "",
		description: item.excerpt || "",
		pubDate: item.post_date ? new Date(item.post_date).toUTCString() : "",
		category: item.sections.nodes.map((section) => section.name),
		image: item.featuredImage?.node?.mediaItemUrl.replace(/\?.*$/, "")
	}));
	return {
		title: "Deal Street Asia - " + headingText,
		language: "en",
		item: feedItems,
		link: "https://dealstreetasia.com/section/" + section + "/"
	};
}
//#endregion
export { route };
