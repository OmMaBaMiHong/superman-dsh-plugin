import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/aqara/community.ts
const route = {
	path: "/community/:id?/:keyword?",
	categories: ["other"],
	example: "/aqara/community",
	parameters: {
		id: "分类 id，可在对应分类页 URL 中找到，默认为全部",
		keyword: "关键字，默认为空"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "社区",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "";
	const keyword = ctx.req.param("keyword") ?? "";
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 100;
	const rootUrl = "https://community.aqara.com";
	const apiUrl = `${rootUrl}/api/v2/feeds?limit=${limit}&platedetail_id=${id}&keyword=${keyword}&all=1`;
	return {
		title: "Aqara社区",
		link: `${rootUrl}/pc/#/post${id ? `?id=${id}` : ""}`,
		item: (await got_default({
			method: "get",
			url: apiUrl
		})).data.map((item) => ({
			title: item.feed_title,
			link: `${rootUrl}/pc/#/post/postDetail/${item.id}`,
			description: item.feed_content,
			pubDate: parseDate(item.created_at),
			author: item.user.nickname
		})),
		allowEmpty: true
	};
}
//#endregion
export { route };
