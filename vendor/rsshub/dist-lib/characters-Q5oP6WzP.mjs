import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import markdownit from "markdown-it";
//#region lib/routes/chub/characters.ts
const md = markdownit({
	breaks: true,
	html: true,
	linkify: true,
	typographer: true
});
const route = {
	path: "/characters",
	categories: ["new-media"],
	example: "/chub/characters",
	name: "Characters",
	maintainers: ["flameleaf"],
	handler,
	features: { nsfw: true }
};
function convertUndefinedToString(value) {
	return value === void 0 ? "" : value.toString();
}
async function handler() {
	const hostURL = "https://www.chub.ai/characters";
	const { data } = await rofetch("https://api.chub.ai/search", {
		headers: { Accept: "application/json" },
		query: {
			search: "",
			first: 200,
			page: 1,
			sort: "last_activity_at",
			asc: "false",
			include_forks: "false",
			nsfw: "true",
			nsfl: "true",
			nsfw_only: "false",
			require_images: "false",
			require_example_dialogues: "false",
			require_alternate_greetings: "false",
			require_custom_prompt: "false",
			exclude_mine: "false",
			min_tokens: 50,
			require_expressions: "false",
			require_lore: "false",
			mine_first: "false",
			require_lore_embedded: "false",
			require_lore_linked: "false",
			inclusive_or: "false",
			recommended_verified: "false"
		}
	});
	return {
		allowEmpty: true,
		title: "Chub",
		link: hostURL,
		item: data.nodes.map((item) => ({
			title: item.name,
			description: `<div><img src="${item.avatar_url}" /></div><div>${item.tagline}</div><div>${md.render(convertUndefinedToString(item.description))}</div>`,
			pubDate: parseDate(item.createdAt),
			updated: parseDate(item.lastActivityAt),
			link: `${hostURL}/${item.fullPath}`,
			author: String(item.fullPath.split("/", 1)),
			enclosure_url: item.max_res_url,
			enclosure_type: "image/png",
			category: item.topics
		}))
	};
}
//#endregion
export { route };
