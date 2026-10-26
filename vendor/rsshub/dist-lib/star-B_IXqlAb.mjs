import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
//#region lib/routes/github/star.ts
const route = {
	path: "/stars/:user/:repo",
	categories: ["programming"],
	example: "/github/stars/DIYgod/RSSHub",
	view: 5,
	parameters: {
		user: "GitHub username",
		repo: "GitHub repo name"
	},
	features: { requireConfig: [{
		name: "GITHUB_ACCESS_TOKEN",
		description: "GitHub Access Token"
	}] },
	radar: [{ source: ["github.com/:user/:repo/stargazers", "github.com/:user/:repo"] }],
	name: "Repo Stars",
	maintainers: ["HenryQW"],
	handler
};
async function handler(ctx) {
	if (!config.github || !config.github.access_token) throw new ConfigNotFoundError("GitHub star RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const user = ctx.req.param("user");
	const repo = ctx.req.param("repo");
	const host = `https://github.com/${user}/${repo}/stargazers`;
	const data = (await got_default({
		method: "post",
		url: "https://api.github.com/graphql",
		headers: { Authorization: `bearer ${config.github.access_token}` },
		json: { query: `
            {
                repository(owner: "${user}", name: "${repo}") {
                  stargazers(last: 10) {
                    edges {
                      node {
                        login
                        avatarUrl
                      }
                    }
                  }
                }
              }
            ` }
	})).data.data.repository.stargazers.edges.toReversed();
	return {
		allowEmpty: true,
		title: `${user}/${repo}’s stargazers`,
		link: host,
		item: data.map((follower) => ({
			title: `${follower.node.login} starred ${user}/${repo}`,
			author: follower.node.login,
			description: `<a href="https://github.com/${follower.node.login}">${follower.node.login}</a> <br> <img sytle="width:50px;" src='${follower.node.avatarUrl}'>`,
			link: `https://github.com/${follower.node.login}`
		}))
	};
}
//#endregion
export { route };
