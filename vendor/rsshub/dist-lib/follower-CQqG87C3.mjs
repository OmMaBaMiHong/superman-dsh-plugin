import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
//#region lib/routes/github/follower.ts
const route = {
	path: "/user/followers/:user",
	categories: ["programming"],
	example: "/github/user/followers/HenryQW",
	parameters: { user: "GitHub username" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["github.com/:user"] }],
	name: "User Followers",
	maintainers: ["HenryQW"],
	handler
};
async function handler(ctx) {
	if (!config.github || !config.github.access_token) throw new ConfigNotFoundError("GitHub follower RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const user = ctx.req.param("user");
	const host = `https://github.com/${user}`;
	const data = (await got_default({
		method: "post",
		url: "https://api.github.com/graphql",
		headers: { Authorization: `bearer ${config.github.access_token}` },
		json: { query: `
            {
                user(login: "${user}") {
                  followers(first: 10) {
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
	})).data.data.user.followers.edges;
	return {
		allowEmpty: true,
		title: `${user}'s followers`,
		link: host,
		item: data.map((follower) => ({
			title: `${follower.node.login} started following ${user}`,
			author: follower.node.login,
			description: `<a href="https://github.com/${follower.node.login}">${follower.node.login}</a> <br> <img sytle="width:50px;" src='${follower.node.avatarUrl}'>`,
			link: `https://github.com/${follower.node.login}`
		}))
	};
}
//#endregion
export { route };
