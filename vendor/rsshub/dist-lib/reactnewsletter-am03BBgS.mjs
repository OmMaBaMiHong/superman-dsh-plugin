import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/reactnewsletter/reactnewsletter.ts
const currentURL = "https://reactnewsletter.com/issues";
const route = {
	path: "/",
	radar: [{
		source: ["bytes.dev/issues", "bytes.dev/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["meixger"],
	handler,
	url: "bytes.dev/issues"
};
async function handler() {
	const text = load((await got_default(currentURL)).data)("script#__NEXT_DATA__").text();
	const items = JSON.parse(text).props.pageProps.issues.map((item) => ({
		title: item.title,
		pubDate: parseDate(item.date),
		description: item.summary,
		link: `/issues/${item.slug}`
	}));
	return {
		title: "reactnewsletter.dev",
		description: "Stay up to date on the latest React news, tutorials, resources, and more. Delivered every Tuesday, for free.",
		link: currentURL,
		item: items
	};
}
//#endregion
export { route };
