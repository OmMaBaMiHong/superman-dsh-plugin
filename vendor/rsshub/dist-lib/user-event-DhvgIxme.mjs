import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as filterEvents } from "./eventapi-DKSxUFTs.mjs";
//#region lib/routes/github/user-event.ts
const route = {
	path: "/user_event/:username/:types?",
	categories: ["programming"],
	example: "/github/user_event/mslxl",
	view: 5,
	parameters: {
		username: "Username",
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
					label: "Issue create events",
					value: "issue"
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
					label: "Pull request review events",
					value: "prrev"
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
				},
				{
					label: "Wiki item create or update events",
					value: "wiki"
				},
				{
					label: "Commit comment events",
					value: "cmcomm"
				},
				{
					label: "Discussion events",
					value: "discussion"
				}
			]
		}
	},
	features: {
		requireConfig: [{
			name: "GITHUB_ACCESS_TOKEN",
			optional: true,
			description: "GitHub access token to access private repository events"
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["github.com/:username"],
		target: "/user_event/:username"
	}],
	name: "User Event",
	maintainers: ["mslxl"],
	handler
};
async function handler(ctx) {
	const username = ctx.req.param("username");
	const types = ctx.req.param("types") || "all";
	const isAuthenticated = config.github && config.github.access_token;
	const headers = {};
	if (isAuthenticated) headers.Authorization = `token ${config.github.access_token}`;
	const items = filterEvents(types, (await got_default({
		method: "get",
		url: `https://api.github.com/users/${username}/events` + (isAuthenticated ? "" : "/public"),
		headers,
		searchParams: { per_page: 100 }
	})).data);
	return {
		title: `${username} GitHub User Feed - ${types === "all" ? "All Events" : `Events: ${types}`}`,
		link: `https://github.com/${username}`,
		description: `GitHub events received by ${username}${types === "all" ? "" : ` (filtered: ${types})`}${isAuthenticated ? " - includes private events" : " - public events only"}`,
		item: items
	};
}
//#endregion
export { route };
