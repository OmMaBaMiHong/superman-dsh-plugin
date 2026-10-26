import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/dockerhub/repositories.ts
const route = {
	name: "Owner Repositories",
	description: "List of repositories for an image owner",
	maintainers: ["CaoMeiYouRen"],
	path: "/repositories/:owner",
	categories: ["program-update"],
	view: 5,
	example: "/dockerhub/repositories/diygod",
	parameters: { owner: "Image owner" },
	handler
};
async function handler(ctx) {
	const owner = ctx.req.param("owner").toLowerCase();
	const limit = Number.parseInt(ctx.req.query("limit") || "10");
	const link = `https://hub.docker.com/r/${owner}`;
	const item = (await got_default(`https://hub.docker.com/v2/repositories/${owner}`, { searchParams: { page_size: limit } })).data.results.map((repo) => ({
		title: repo.name,
		description: `${repo.description}<br>status: ${repo.status_description}<br>stars: ${repo.star_count}<br>pulls: ${repo.pull_count}`,
		link: `https://hub.docker.com/r/${owner}/${repo.name}`,
		author: owner,
		pubDate: parseDate(repo.last_updated),
		guid: `${owner}/${repo.name}`
	}));
	return {
		title: `${owner} repositories`,
		description: `List of repositories for ${owner}`,
		link,
		item
	};
}
//#endregion
export { route };
