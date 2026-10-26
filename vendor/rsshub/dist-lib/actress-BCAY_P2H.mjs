import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseItems } from "./utils-Dsf3eq_6.mjs";
import { load } from "cheerio";
//#region lib/routes/javtiful/actress.ts
const route = {
	path: "/actress/:id",
	name: "Actress",
	maintainers: ["huanfe1"],
	example: "/javtiful/actress/akari-tsumugi",
	parameters: { id: "Actress name" },
	handler,
	categories: ["multimedia"],
	radar: [{
		source: ["javtiful.com/actress/:id", "javtiful.com/actress/:id/*"],
		target: "/actress/:id"
	}],
	features: { nsfw: true }
};
async function handler(ctx) {
	const { id } = ctx.req.param();
	const $ = load(await rofetch(`https://javtiful.com/actress/${id}`));
	const items = $("section .card:not(:has(.bg-danger))").toArray().map((item) => parseItems($(item)));
	return {
		title: $(".channel-item__name_details a").text(),
		link: `https://javtiful.com/actress/${id}`,
		allowEmpty: true,
		item: items,
		image: $(".content-section-title img").attr("src"),
		language: $("html").attr("lang")
	};
}
//#endregion
export { route };
