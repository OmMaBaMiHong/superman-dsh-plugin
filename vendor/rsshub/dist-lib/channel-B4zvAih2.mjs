import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseItems } from "./utils-Dsf3eq_6.mjs";
import { load } from "cheerio";
//#region lib/routes/javtiful/channel.ts
const route = {
	path: "/channel/:id",
	name: "Channel",
	maintainers: ["huanfe1"],
	example: "/javtiful/channel/madonna",
	parameters: { id: "Channel name" },
	handler,
	categories: ["multimedia"],
	radar: [{
		source: ["javtiful.com/channel/:id", "javtiful.com/channel/:id/*"],
		target: "/channel/:id"
	}],
	features: { nsfw: true }
};
async function handler(ctx) {
	const { id } = ctx.req.param();
	const $ = load(await rofetch(`https://javtiful.com/channel/${id}`));
	const items = $("section .card:not(:has(.bg-danger))").toArray().map((item) => parseItems($(item)));
	return {
		title: $(".channel-item__name_details a").text(),
		link: `https://javtiful.com/channel/${id}`,
		allowEmpty: true,
		item: items,
		image: $(".content-section-title img").attr("src"),
		language: $("html").attr("lang")
	};
}
//#endregion
export { route };
