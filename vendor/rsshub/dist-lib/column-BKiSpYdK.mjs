import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { CookieJar } from "tough-cookie";
import { JSDOM } from "jsdom";
//#region lib/routes/xueqiu/column.ts
const cookieJar = new CookieJar();
const baseUrl = "https://xueqiu.com";
const route = {
	path: "/column/:id",
	categories: ["finance"],
	example: "/xueqiu/column/9962554712",
	parameters: { id: "用户 id, 可在用户主页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["xueqiu.com/:id/column"] }],
	name: "用户专栏",
	maintainers: ["TonyRL", "pseudoyu"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const pageUrl = `${baseUrl}/${id}/column`;
	await got_default(baseUrl, { cookieJar });
	const { window } = new JSDOM((await got_default(pageUrl, { cookieJar })).data, { runScripts: "dangerously" });
	const SNOWMAN_TARGET = window.SNOWMAN_TARGET;
	const { data } = await got_default(`${baseUrl}/statuses/original/timeline.json`, {
		cookieJar,
		searchParams: {
			user_id: id,
			page: 1
		}
	});
	if (!data.list) throw new Error("Error occurred, please refresh the page or try again after logging back into your account");
	const items = data.list.map((item) => ({
		title: item.title,
		description: item.description,
		pubDate: parseDate(item.created_at, "x"),
		link: `${baseUrl}${item.target}`,
		author: SNOWMAN_TARGET.screen_name
	}));
	return {
		title: `${SNOWMAN_TARGET.screen_name} - 雪球`,
		link: pageUrl,
		description: SNOWMAN_TARGET.description,
		item: items
	};
}
//#endregion
export { route };
