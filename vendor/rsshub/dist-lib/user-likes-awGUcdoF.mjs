import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/huggingface/user-likes.ts
const getRepoLink = (repo) => {
	switch (repo.type) {
		case "dataset": return `https://huggingface.co/datasets/${repo.name}`;
		case "space": return `https://huggingface.co/spaces/${repo.name}`;
		case "paper": return `https://huggingface.co/papers/${repo.name}`;
		case "collection": return `https://huggingface.co/collections/${repo.name}`;
		default: return `https://huggingface.co/${repo.name}`;
	}
};
const route = {
	path: "/activity/:user/likes",
	categories: ["programming"],
	example: "/huggingface/activity/dotwee/likes",
	parameters: { user: "Hugging Face username" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["huggingface.co/:user/activity/likes"],
		target: "/activity/:user/likes"
	}],
	name: "User Likes Activity",
	maintainers: ["dotwee"],
	handler,
	url: "huggingface.co"
};
async function handler(ctx) {
	const { user } = ctx.req.param();
	const link = `https://huggingface.co/${user}/activity/likes`;
	const items = (await rofetch(`https://huggingface.co/api/users/${user}/likes`)).map((like) => {
		const repoType = like.repo.type || "model";
		return {
			title: `${user} liked ${like.repo.name}`,
			link: getRepoLink(like.repo),
			description: `${user} liked this ${repoType}.`,
			category: [repoType],
			pubDate: parseDate(like.createdAt)
		};
	});
	return {
		title: `${user} - Likes Activity`,
		link,
		item: items
	};
}
//#endregion
export { route };
