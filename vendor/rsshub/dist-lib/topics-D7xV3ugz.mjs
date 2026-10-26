import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/academia/topics.ts
const route = {
	path: "/topic/:interest",
	example: "/academia/topic/Urban_History",
	parameters: { interest: "interest" },
	radar: [{
		source: ["academia.edu/Documents/in/:interest"],
		target: "/topic/:interest"
	}],
	name: "interest",
	maintainers: ["K33k0", "cscnk52"],
	categories: ["journal"],
	handler,
	url: "academia.edu"
};
async function handler(ctx) {
	const interest = ctx.req.param("interest");
	const $ = load(await rofetch(`https://www.academia.edu/Documents/in/${interest}`));
	const list = $(".works > .div").toArray().map((item) => ({
		title: $(item).find(".title").text(),
		link: $(item).find(".title > a").attr("href"),
		author: $(item).find(".authors").text().replace("by", "").trim(),
		description: $(item).find(".summarized").text()
	}));
	return {
		title: `academia.edu | ${interest} documents`,
		link: `https://academia.edu/Documents/in/${interest}`,
		item: list
	};
}
//#endregion
export { route };
