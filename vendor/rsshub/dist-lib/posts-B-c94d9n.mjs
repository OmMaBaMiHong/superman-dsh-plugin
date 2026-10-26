import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/itch/posts.ts
const route = {
	path: "/posts/:topic/:id",
	categories: ["game"],
	example: "/itch/posts/9539/introduce-yourself",
	parameters: {
		topic: "Topic id, can be found in URL",
		id: "Topic name, can be found in URL"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["itch.io/t/:topic/:id"] }],
	name: "Posts",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const currentUrl = `https://itch.io/t/${ctx.req.param("topic")}/${ctx.req.param("id")}?before=999999999`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const items = $(".post_grid").toArray().map((item) => {
		item = $(item);
		const author = item.find(".post_author").text();
		const description = item.find(".post_body");
		return {
			author,
			description: description.html(),
			title: `${author}: ${description.text()}`,
			link: item.find(".post_date a").attr("href"),
			pubDate: parseDate(item.find(".post_date").attr("title"))
		};
	});
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
