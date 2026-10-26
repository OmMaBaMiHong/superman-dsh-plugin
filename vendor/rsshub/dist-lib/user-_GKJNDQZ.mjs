import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { i as processList, n as apiUrl, r as baseUrl, t as ProcessFeed } from "./utils--9i5MPyI.mjs";
//#region lib/routes/vocus/user.ts
const route = {
	path: "/user/:id",
	categories: ["social-media"],
	example: "/vocus/user/tsetyan",
	parameters: { id: "用户 id，可在用户主页的 URL 找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "用户个人文章",
	maintainers: ["LogicJake"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const link = `${baseUrl}/user/@${id}`;
	const userData = await cache_default.tryGet(`vocus:user:${id}`, async () => {
		const { data: userData } = await got_default(`${apiUrl}/api/users/${id}`, { headers: { referer: link } });
		return {
			_id: userData._id,
			fullname: userData.fullname,
			avatarUrl: userData.avatarUrl,
			intro: userData.intro
		};
	});
	const { data: { articles } } = await got_default(`${apiUrl}/api/articles`, {
		headers: { referer: link },
		searchParams: { userId: userData._id }
	});
	const items = await ProcessFeed(processList(articles));
	return {
		title: `${userData.fullname}｜方格子 vocus`,
		link,
		description: userData.intro,
		image: userData.avatarUrl,
		item: items
	};
}
//#endregion
export { route };
