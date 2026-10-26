import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as baseUrl, o as renderPost, r as getUserInfo, t as apiBase } from "./utils-Ce3bDHtv.mjs";
//#region lib/routes/otobanana/timeline.ts
const route = {
	path: "/user/:id",
	categories: ["multimedia"],
	example: "/otobanana/user/cee16401-96b1-420f-8188-abd4d33093f1",
	parameters: { id: "User ID, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	radar: [{ source: ["otobanana.com/user/:id"] }],
	name: "Timeline タイムライン",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const userInfo = await getUserInfo(id);
	const { data: postData } = await got_default(`${apiBase}/users/${id}/posts/`);
	const posts = postData.results.map((item) => renderPost(item));
	ctx.set("json", {
		userInfo,
		postData
	});
	return {
		title: `${userInfo.name} (@${userInfo.username}) - タイムライン | OTOBANANA`,
		description: userInfo.bio.replaceAll("\n", " "),
		link: `${baseUrl}/user/${id}`,
		image: userInfo.avatar_url,
		icon: userInfo.avatar_url,
		logo: userInfo.avatar_url,
		language: "ja",
		author: userInfo.name,
		itunes_author: userInfo.name,
		item: posts
	};
}
//#endregion
export { route };
