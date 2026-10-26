import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/dealstreetasia/home.ts
const route = {
	path: "/home",
	categories: ["traditional-media"],
	example: "/dealstreetasia/home",
	radar: [{ source: ["dealstreetasia.com/"] }],
	name: "Home",
	maintainers: ["jack2game"],
	handler,
	url: "dealstreetasia.com/"
};
async function handler() {
	return await fetchPage();
}
async function fetchPage() {
	const $ = load(await rofetch(`https://dealstreetasia.com/`));
	const pageProps = JSON.parse($("#__NEXT_DATA__").text()).props.pageProps;
	return {
		title: "Deal Street Asia",
		language: "en",
		item: [
			...pageProps.topStories,
			...pageProps.privateEquity,
			...pageProps.ventureCapital,
			...pageProps.unicorns,
			...pageProps.interviews,
			...pageProps.deals,
			...pageProps.analysis,
			...pageProps.ipos,
			...pageProps.opinion,
			...pageProps.policyAndRegulations,
			...pageProps.people,
			...pageProps.earningsAndResults,
			...pageProps.theLpView,
			...pageProps.dvNewsletters,
			...pageProps.reports
		].map((item) => ({
			title: item.post_title || item.title || "No Title",
			link: item.post_url || item.link || "",
			description: item.post_excerpt || item.excerpt || "",
			pubDate: item.post_date ? new Date(item.post_date).toUTCString() : item.date ? new Date(item.date).toUTCString() : "",
			category: item.category_link ? item.category_link.replaceAll(/(<([^>]+)>)/g, "") : "",
			image: item.image_url ? item.image_url.replace(/\?.*$/, "") : ""
		})),
		link: "https://dealstreetasia.com/"
	};
}
//#endregion
export { route };
