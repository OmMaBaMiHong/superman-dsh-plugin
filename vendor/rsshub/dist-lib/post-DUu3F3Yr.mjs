import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { c as parseDescription, o as getTimelineByAccountId, r as getAccountByUsername, t as baseUrl } from "./utils-apTSgZpc.mjs";
//#region lib/routes/fansly/post.ts
const route = {
	path: "/user/:username",
	categories: ["social-media"],
	example: "/fansly/user/AeriGoMoo",
	parameters: { username: "User ID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["fansly.com/:username/posts", "fansly.com/:username/media"] }],
	name: "User Timeline",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const account = await getAccountByUsername(ctx.req.param("username"));
	const timeline = await getTimelineByAccountId(account.id);
	const items = timeline.posts.map((post) => ({
		title: post.content.split("\n", 1)[0],
		description: parseDescription(post, timeline),
		pubDate: parseDate(post.createdAt, "X"),
		link: `${baseUrl}/post/${post.id}`,
		author: `${account.displayName ?? account.username} (@${account.username})`
	}));
	return {
		title: `${account.displayName ?? account.username} (@${account.username}) - Fansly`,
		link: `${baseUrl}/${account.username}`,
		description: account.about.replaceAll("\n", " "),
		image: account.banner.locations[0].location,
		icon: account.avatar.locations[0].location,
		logo: account.avatar.locations[0].location,
		language: "en",
		allowEmpty: true,
		item: items
	};
}
//#endregion
export { route };
