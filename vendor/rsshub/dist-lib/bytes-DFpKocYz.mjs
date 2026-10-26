import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/bytes/bytes.ts
const currentURL = "https://bytes.dev/archives";
const route = {
	path: "/",
	radar: [{
		source: ["bytes.dev/archives", "bytes.dev/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["meixger"],
	handler,
	url: "bytes.dev/archives"
};
async function handler() {
	const text = load((await got_default(currentURL)).data)("script#__NEXT_DATA__").text();
	const json = JSON.parse(text);
	const items = [json.props.pageProps.featuredPost, ...json.props.pageProps.posts].map((item) => ({
		title: `Issue ${item.slug}`,
		pubDate: parseDate(item.date),
		description: item.title,
		link: `/archives/${item.slug}`
	}));
	return {
		title: "bytes.dev",
		description: "Your weekly dose of JS",
		link: currentURL,
		item: items
	};
}
//#endregion
export { route };
