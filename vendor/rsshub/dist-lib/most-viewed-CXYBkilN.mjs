import { t as commonHandler } from "./category-Bl5JUfRf.mjs";
//#region lib/routes/finology/most-viewed.ts
const route = {
	path: "/most-viewed",
	categories: ["finance"],
	example: "/finology/most-viewed",
	radar: [{
		source: ["insider.finology.in/most-viewed"],
		target: "/most-viewed"
	}],
	name: "Most Viewed",
	maintainers: ["Rjnishant530"],
	handler,
	url: "insider.finology.in/most-viewed"
};
async function handler() {
	return await commonHandler("https://insider.finology.in", "/most-viewed", {
		description: (topic) => `Check out the most talked-about articles among our readers! ${topic}`,
		date: false,
		selector: "div.card"
	});
}
//#endregion
export { route };
