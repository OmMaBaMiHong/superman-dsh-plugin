import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as filterEvents } from "./eventapi-DKSxUFTs.mjs";
//#region lib/routes/github/private-feed.ts
const route = {
	path: "/feed/:user/:types?",
	categories: ["programming"],
	example: "/github/feed/yihong0618/star,release,pr",
	view: 5,
	parameters: {
		user: "GitHub username",
		types: {
			description: "Event types to include, comma separated",
			default: "all",
			options: [
				{
					label: "All events",
					value: "all"
				},
				{
					label: "Create events",
					value: "create"
				},
				{
					label: "Delete events",
					value: "delete"
				},
				{
					label: "Fork events",
					value: "fork"
				},
				{
					label: "Issue comment events",
					value: "issuecomm"
				},
				{
					label: "Member events",
					value: "member"
				},
				{
					label: "Pull request events",
					value: "pr"
				},
				{
					label: "Pull request review comment events",
					value: "prcomm"
				},
				{
					label: "Public events",
					value: "public"
				},
				{
					label: "Push events",
					value: "push"
				},
				{
					label: "Release events",
					value: "release"
				},
				{
					label: "Watch events (stars)",
					value: "star"
				}
			]
		}
	},
	features: {
		requireConfig: [{
			name: "GITHUB_ACCESS_TOKEN",
			optional: true,
			description: "GitHub access token to access private events"
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["github.com/:user"],
		target: "/feed/:user"
	}],
	name: "User's Feed",
	maintainers: ["RtYkk"],
	handler
};
async function handler(ctx) {
	const user = ctx.req.param("user");
	const types = ctx.req.param("types") || "all";
	const isAuthenticated = config.github && config.github.access_token;
	const headers = {};
	if (isAuthenticated) headers.Authorization = `token ${config.github.access_token}`;
	const items = filterEvents(types, (await got_default({
		method: "get",
		url: `https://api.github.com/users/${user}/received_events`,
		headers,
		searchParams: { per_page: 100 }
	})).data);
	const typeFilter = types === "all" ? "All Events" : `Events: ${types}`;
	return {
		title: `${user}'s GitHub ${isAuthenticated ? "Private Feed" : "Public Feed"} - ${typeFilter}`,
		link: `https://github.com/${user}`,
		description: `GitHub events received by ${user}${types === "all" ? "" : ` (filtered: ${types})`}${isAuthenticated ? " - includes private events" : " - public events only"}`,
		item: items
	};
}
//#endregion
export { route };
