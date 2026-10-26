import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as parseArticle, t as baseUrl } from "./utils-BpkPfGbN.mjs";
import { load } from "cheerio";
//#region lib/routes/woshipm/user-article.ts
const route = {
	path: "/user_article/:id",
	categories: ["new-media"],
	example: "/woshipm/user_article/324696",
	parameters: { id: "用户 id" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["woshipm.com/u/:id"] }],
	name: "用户文章",
	maintainers: ["LogicJake"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 12;
	const link = `${baseUrl}/u/${id}`;
	const data = (await got_default(link)).data;
	const $ = load(data);
	const name = $(".author--meta .name").text();
	const list = $(".post--card").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const postCardTitle = item.find("h2.post--card__title a");
		return {
			title: postCardTitle.attr("title"),
			link: postCardTitle.attr("href"),
			pubDate: parseDate(item.find("time").text(), "YYYY-MM-DD")
		};
	});
	const items = await Promise.all(list.map((item) => parseArticle(item)));
	return {
		title: `${name}的文章-人人都是产品经理`,
		description: $(".author--meta .description").text(),
		image: $(".author--meta .avatar").attr("src").split("!", 1)[0],
		link,
		item: items
	};
}
//#endregion
export { route };
