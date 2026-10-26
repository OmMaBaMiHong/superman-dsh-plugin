import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/dev.to/top.ts
const route = {
	path: "/top/:period",
	categories: ["programming"],
	example: "/dev.to/top/week",
	parameters: { period: "Period (week, month, year, infinity)" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["dev.to/top/:period"] }],
	name: "Top Posts",
	maintainers: ["dwemerx", "Rjnishant530"],
	handler,
	url: "dev.to/top"
};
async function handler(ctx) {
	const period = ctx.req.param("period");
	const baseUrl = "https://dev.to";
	const link = `${baseUrl}/top/${period}`;
	const date = /* @__PURE__ */ new Date();
	switch (period) {
		case "week":
			date.setDate(date.getDate() - 7);
			break;
		case "month":
			date.setMonth(date.getMonth() - 1);
			break;
		case "year":
			date.setFullYear(date.getFullYear() - 1);
			break;
		default:
			date.setFullYear(date.getFullYear() - 5);
			break;
	}
	const publishedDate = date.toISOString();
	const data = (await got_default({
		method: "get",
		url: `https://dev.to/search/feed_content?per_page=15&sort_by=public_reactions_count&sort_direction=desc&approved=&class_name=Article&published_at%5Bgte%5D=${encodeURIComponent(publishedDate)}`
	})).data;
	const items = await Promise.all(data.result.map((item) => {
		const articleUrl = `${baseUrl}${item.path}`;
		return cache_default.tryGet(articleUrl, async () => {
			const $ = load((await got_default(articleUrl)).data);
			const coverImage = $(".crayons-article__cover img").attr("src");
			const content = $(".crayons-article__body").html() || "";
			return {
				title: item.title,
				author: [{
					name: item.user.name,
					url: `${baseUrl}/${item.user.username}`,
					avatar: item.user.profile_image_90
				}],
				link: articleUrl,
				pubDate: parseDate(item.published_at_int * 1e3),
				description: content,
				category: item.tag_list,
				image: coverImage
			};
		});
	}));
	return {
		title: `dev.to top (${period})`,
		link,
		description: "Top dev.to posts",
		language: "en-us",
		item: items,
		icon: "https://media2.dev.to/dynamic/image/width=32,height=,fit=scale-down,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F8j7kvp660rqzt99zui8e.png"
	};
}
//#endregion
export { route };
