import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/jiaoliudao/index.ts
const route = {
	path: "/",
	radar: [{
		source: ["jiaoliudao.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["TonyRL"],
	handler,
	url: "jiaoliudao.com/"
};
async function handler(ctx) {
	const baseUrl = "https://www.jiaoliudao.com";
	const { data } = await got_default(`${baseUrl}/wp-json/wp/v2/posts`, { searchParams: { per_page: ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30 } });
	const items = data.map((item) => ({
		title: item.title.rendered,
		description: item.content.rendered,
		pubDate: parseDate(item.date_gmt),
		updated: parseDate(item.modified_gmt),
		link: item.link
	}));
	return {
		title: "交流岛资源网-专注网络资源收集",
		image: `${baseUrl}/favicon.ico`,
		link: baseUrl,
		item: items
	};
}
//#endregion
export { route };
