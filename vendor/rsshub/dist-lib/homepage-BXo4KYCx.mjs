import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/deepin/homepage.ts
const route = {
	path: "/homepage/:user_id",
	categories: ["bbs"],
	example: "/deepin/homepage/78326",
	parameters: { user_id: "user id" },
	name: "BBS Home Page",
	maintainers: ["tensor-tech"],
	radar: [{
		source: ["bbs.deepin.org/user/:user_id"],
		target: "/homepage/:user_id"
	}],
	handler
};
async function handler(ctx) {
	const { user_id } = ctx.req.param();
	const items = (await rofetch(`https://bbs.deepin.org/api/v1/user/thread?date_type=0&limit=10&offset=0&user_id=${user_id}`, { headers: { accept: "application/json" } })).data.map((item) => ({
		title: item.subject,
		link: `https://bbs.deepin.org/post/${item.id}`,
		description: item.post.message,
		pubDate: parseDate(item.created_at),
		author: item.user.nickname,
		category: item.forum.name
	}));
	return {
		title: `${items[0].author}/deepin论坛主页`,
		link: `https://bbs.deepin.org/user/${user_id}`,
		item: items
	};
}
//#endregion
export { route };
