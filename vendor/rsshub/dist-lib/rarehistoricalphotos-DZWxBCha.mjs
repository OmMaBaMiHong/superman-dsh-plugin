import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/rarehistoricalphotos/index.ts
const baseUrl = "https://rarehistoricalphotos.com";
const route = {
	path: "/",
	radar: [{
		source: ["rarehistoricalphotos.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["TonyRL"],
	handler,
	url: "rarehistoricalphotos.com/"
};
async function handler(ctx) {
	const { data } = await got_default(`${baseUrl}/wp-json/wp/v2/posts`, { searchParams: { per_page: ctx.req.query("limit") ? Number(ctx.req.query("limit")) : void 0 } });
	const items = data.map((item) => ({
		title: item.title.rendered,
		description: item.content.rendered,
		link: item.link,
		pubDate: parseDate(item.date_gmt)
	}));
	return {
		title: "Rare Historical Photos",
		description: "And the story behind them...",
		link: baseUrl,
		image: "https://rarehistoricalphotos.com/wp-content/uploads/2022/04/cropped-rarehistoricalphotos-32x32.png",
		language: "en-US",
		item: items
	};
}
//#endregion
export { route };
