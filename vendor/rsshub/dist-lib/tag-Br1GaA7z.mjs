import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { a as getTagSuggestion, c as parseDescription, i as getTagId, n as findAccountById, s as icon, t as baseUrl } from "./utils-apTSgZpc.mjs";
//#region lib/routes/fansly/tag.ts
const route = {
	path: "/tag/:tag",
	categories: ["social-media"],
	example: "/fansly/tag/free",
	parameters: { tag: "Hashtag" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["fansly.com/explore/tag/:tag"] }],
	name: "Hashtag",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const tag = ctx.req.param("tag");
	const suggestion = await getTagSuggestion(await getTagId(tag));
	const items = suggestion.aggregationData?.posts.map((post) => {
		const account = findAccountById(post.accountId, suggestion.aggregationData.accounts);
		return {
			title: post.content.split("\n", 1)[0],
			description: parseDescription(post, suggestion.aggregationData),
			pubDate: parseDate(post.createdAt, "X"),
			link: `${baseUrl}/post/${post.id}`,
			author: `${account.displayName ?? account.username} (@${account.username})`
		};
	});
	return {
		title: `#${tag} - Fansly`,
		link: `${baseUrl}/explore/tag/${tag}`,
		image: icon,
		icon,
		logo: icon,
		language: "en",
		item: items
	};
}
//#endregion
export { route };
