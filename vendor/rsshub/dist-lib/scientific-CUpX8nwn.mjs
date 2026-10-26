import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as parseList, t as parseItem } from "./utils-BE0LVhAw.mjs";
//#region lib/routes/guokr/scientific.ts
const route = {
	path: "/scientific",
	categories: ["new-media"],
	example: "/guokr/scientific",
	radar: [{ source: ["guokr.com/scientific", "guokr.com/"] }],
	name: "科学人",
	maintainers: ["alphardex", "nczitzk"],
	handler,
	url: "guokr.com/scientific"
};
async function handler() {
	const { data: response } = await got_default("https://www.guokr.com/beta/proxy/science_api/articles", { searchParams: {
		retrieve_type: "by_category",
		page: 1
	} });
	const result = parseList(response);
	return {
		title: "果壳网 科学人",
		link: "https://www.guokr.com/scientific",
		description: "果壳网 科学人",
		item: await Promise.all(result.map((item) => parseItem(item)))
	};
}
//#endregion
export { route };
