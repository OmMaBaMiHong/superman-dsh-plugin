import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/civitai/user.ts
const route = {
	path: "/user/:username/articles",
	categories: ["program-update"],
	example: "/civitai/user/Chenkin/articles",
	parameters: { username: "Username" },
	radar: [{ source: ["civitai.com/user/:username", "civitai.com/user/:username/articles"] }],
	name: "User Article",
	maintainers: ["TonyRL"],
	handler,
	features: { nsfw: true }
};
async function handler(ctx) {
	const { username } = ctx.req.param();
	const userProfile = await cache_default.tryGet(`civitai:userProfile:${username}`, async () => {
		return (await rofetch("https://civitai.com/api/trpc/userProfile.get", { query: { input: JSON.stringify({ json: { username } }) } })).result.data.json;
	});
	const article = await rofetch("https://civitai.com/api/trpc/article.getInfinite", { query: { input: JSON.stringify({
		json: {
			period: "AllTime",
			periodMode: "published",
			sort: "Newest",
			username,
			includeDrafts: false,
			pending: true,
			browsingLevel: 1,
			excludedTagIds: [
				415792,
				426772,
				5188,
				5249,
				130818,
				130820,
				133182
			],
			cursor: null
		},
		meta: { values: { cursor: ["undefined"] } }
	}) } });
	if (!article.result.data.json.items.length) throw new Error("This user has no articles.");
	const list = article.result.data.json.items.map((item) => ({
		title: item.title,
		link: `https://civitai.com/articles/${item.id}`,
		id: item.id,
		pubDate: parseDate(item.publishedAt),
		updated: parseDate(item.publishedAt),
		author: item.user?.username,
		category: item.tags.map((tag) => tag.name),
		image: `https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${item.coverImage.url}/${item.coverImage.name}`
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = (await rofetch("https://civitai.com/api/trpc/article.getById", { query: { input: JSON.stringify({ json: { id: item.id } }) } })).result.data.json.content;
		return item;
	})));
	return {
		title: `${username} Creator Profile | Civitai`,
		description: userProfile.profile.message.replaceAll("\n", " ") || userProfile.profile.bio,
		link: `https://civitai.com/user/${username}/articles`,
		image: userProfile.image,
		item: items
	};
}
//#endregion
export { route };
