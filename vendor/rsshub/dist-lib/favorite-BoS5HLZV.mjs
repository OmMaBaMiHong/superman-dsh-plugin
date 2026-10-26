import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parseToken } from "./cookies-CBhJvxcZ.mjs";
import queryString from "query-string";
//#region lib/routes/xueqiu/favorite.ts
const route = {
	path: "/favorite/:id",
	categories: ["finance"],
	example: "/xueqiu/favorite/8152922548",
	parameters: { id: "用户 id, 可在用户主页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["xueqiu.com/u/:id"] }],
	name: "用户收藏动态",
	maintainers: ["imlonghao"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const link = `https://xueqiu.com/u/${id}`;
	const token = await parseToken(link);
	const data = (await got_default({
		method: "get",
		url: "https://xueqiu.com/favorites.json",
		searchParams: queryString.stringify({ userid: id }),
		headers: {
			Cookie: token,
			Referer: link
		}
	})).data.list;
	const { user: { screen_name } } = await rofetch("https://xueqiu.com/statuses/original/show.json", {
		query: { user_id: id },
		headers: {
			Cookie: token,
			Referer: link
		}
	});
	return {
		title: `${screen_name} 的雪球收藏动态`,
		link,
		description: `${screen_name} 的雪球收藏动态`,
		item: data.map((item) => ({
			title: item.title,
			description: item.description,
			pubDate: parseDate(item.created_at),
			link: `https://xueqiu.com${item.target}`
		})),
		allowEmpty: true
	};
}
//#endregion
export { route };
