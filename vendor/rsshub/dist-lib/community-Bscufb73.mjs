import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as fixImage, r as fixVideo, t as baseUrl } from "./utils-BIsp_OQ5.mjs";
import { load } from "cheerio";
//#region lib/routes/pikabu/community.ts
const route = {
	path: "/:type/:name",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const { type, name, sort = "new" } = ctx.req.param();
	const { data: response } = await got_default(`${baseUrl}/ajax/${type}/${name}${sort === "default" || type === "tag" ? "" : `/${sort}`}`);
	const items = response.data.stories.map((story) => {
		const $ = load(story.html, null, false);
		const data = JSON.parse($("script[type=\"application/ld+json\"]").text());
		const content = $(".story__main");
		fixImage(content);
		content.find(".player").each((_, elem) => {
			elem = $(elem);
			fixVideo(elem);
		});
		return {
			title: data.name,
			description: content.find(".story__content-inner").html(),
			pubDate: parseDate(data.dateCreated),
			author: data.author.name,
			link: data.url
		};
	});
	return {
		title: response.data.title,
		link: `${baseUrl}/${type}/${name}`,
		language: "ru-RU",
		item: items
	};
}
//#endregion
export { route };
