import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/runyeah/posts.ts
const route = {
	path: "/",
	example: "/runyeah",
	radar: [{ source: ["runyeah.world/"] }],
	categories: ["sport"],
	name: "最新文章",
	maintainers: ["TonyRL"],
	handler,
	url: "runyeah.world/"
};
async function handler(ctx) {
	const baseUrl = "https://runyeah.world";
	const { data: response } = await got_default(`${baseUrl}/wp-json/wp/v2/posts`, { searchParams: {
		_embed: true,
		per_page: ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 30
	} });
	let data = response;
	if (typeof response !== "object") data = JSON.parse(response.match(/\[(.*)\]/)[0]);
	return {
		title: "最新文章 - 跑野大爆炸",
		link: baseUrl,
		item: data.map((item) => ({
			title: item.title.rendered,
			description: item.content.rendered,
			pubDate: parseDate(item.date_gmt),
			updated: parseDate(item.modified_gmt),
			author: item._embedded.author.map((a) => a.name).join(", "),
			category: item._embedded["wp:term"][0].map((c) => c.name),
			link: item.link
		}))
	};
}
//#endregion
export { route };
