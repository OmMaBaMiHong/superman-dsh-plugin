import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import queryString from "query-string";
//#region lib/routes/github/file.ts
const route = {
	path: "/file/:user/:repo/:branch/:filepath{.+}",
	example: "/github/file/DIYgod/RSSHub/master/README.md",
	parameters: {
		user: "GitHub user or org name",
		repo: "repository name",
		branch: "branch name",
		filepath: "path of target file"
	},
	radar: [{
		source: ["github.com/:user/:repo/blob/:branch/*filepath"],
		target: "/file/:user/:repo/:branch/:filepath"
	}],
	name: "File Commits",
	maintainers: ["zengxs"],
	handler
};
async function handler(ctx) {
	const user = ctx.req.param("user");
	const repo = ctx.req.param("repo");
	const branch = ctx.req.param("branch");
	const filepath = ctx.req.param("filepath");
	const fileUrl = `https://github.com/${user}/${repo}/commits/${branch}/${filepath}`;
	const headers = {};
	if (config.github && config.github.access_token) headers.Authorization = `token ${config.github.access_token}`;
	const list = (await got_default.get(`https://api.github.com/repos/${user}/${repo}/commits`, {
		searchParams: queryString.stringify({
			sha: branch,
			path: filepath
		}),
		headers
	})).data;
	const count = [];
	for (let i = 0; i < Math.min(list.length, 10); i++) count.push(i);
	const resultItems = count.map((i) => {
		const each = list[i];
		return {
			title: each.commit.message.split("\n", 1)[0],
			description: `<pre>${each.commit.message}</pre>`,
			link: each.html_url,
			author: each.commit.author.name,
			pubDate: new Date(each.commit.committer.date).toUTCString()
		};
	});
	return {
		title: `GitHub File - ${user}/${repo}/${branch}/${filepath}`,
		link: fileUrl,
		item: resultItems
	};
}
//#endregion
export { route };
