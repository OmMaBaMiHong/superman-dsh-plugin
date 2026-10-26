import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/github/gist.ts
const route = {
	path: "/gist/:gistId",
	categories: ["programming"],
	example: "/github/gist/d2c152bb7179d07015f336b1a0582679",
	parameters: { gistId: "Gist ID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: [
		"gist.github.com/:owner/:gistId/revisions",
		"gist.github.com/:owner/:gistId/stargazers",
		"gist.github.com/:owner/:gistId/forks",
		"gist.github.com/:owner/:gistId"
	] }],
	name: "Gist Commits",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const gistId = ctx.req.param("gistId");
	const headers = { Accept: "application/vnd.github.v3+json" };
	if (config.github && config.github.access_token) headers.Authorization = `Bearer ${config.github.access_token}`;
	const host = "https://gist.github.com";
	const { data: response } = await got_default(`https://api.github.com/gists/${gistId}`, { headers });
	const items = response.history.map((item, index) => ({
		title: `${item.user.login} ${index === response.history.length - 1 ? "created" : "revised"} this gist`,
		description: item.change_status.total ? `${item.change_status.additions} additions and ${item.change_status.deletions} deletions` : null,
		link: `${host}/${gistId}/${item.version}`,
		pubDate: parseDate(item.committed_at)
	}));
	return {
		allowEmpty: true,
		title: `${response.owner.login} / ${Object.values(response.files)[0].filename}`,
		description: response.description,
		image: response.owner.avatar_url,
		link: `${response.html_url}/revisions`,
		item: items
	};
}
//#endregion
export { route };
