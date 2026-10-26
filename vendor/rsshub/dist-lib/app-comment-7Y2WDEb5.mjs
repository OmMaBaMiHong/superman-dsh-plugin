import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { c as userUrl, t as appsUrl } from "./utils-DDi1zjra.mjs";
import { t as renderComment } from "./comment-BzgybzNW.mjs";
import { load } from "cheerio";
//#region lib/routes/qoo-app/user/app-comment.ts
const route = {
	path: "/user/:lang?/appComment/:uid",
	categories: ["anime"],
	example: "/qoo-app/user/en/appComment/35399143",
	parameters: {
		lang: "Language, see the table above, empty means `中文`",
		uid: "User ID, can be found in URL"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "User Game Comments",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { uid, lang = "" } = ctx.req.param();
	const link = `${userUrl}${lang ? `/${lang}` : ""}/${uid}`;
	const { data: response } = await got_default(link);
	const { data } = await got_default(`${userUrl}/getUserAppCommentList`, { searchParams: { fid: uid } });
	const $ = load(response);
	const username = $(".person .name").text();
	const items = data.list.map((item) => ({
		title: `${username} ▶ ${item.app.name}`,
		link: `${appsUrl}/comment-detail/${item.comment.id}`,
		description: renderComment({
			rating: item.score,
			text: item.comment.content
		}),
		pubDate: timezone(parseDate(item.comment.created_at, "YYYY-MM-DD"), 8),
		author: username
	}));
	return {
		title: $("head title").text(),
		link,
		image: decodeURIComponent($(".person div.slot").attr("data-args")).replace("avatar=", "").split("?", 1)[0],
		language: $("html").attr("lang"),
		item: items
	};
}
//#endregion
export { route };
