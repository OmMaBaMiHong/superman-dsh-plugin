import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/github/contributors.ts
const route = {
	path: "/contributors/:user/:repo/:order?/:anon?",
	categories: ["programming"],
	example: "/github/contributors/DIYgod/RSSHub",
	parameters: {
		user: "User name",
		repo: "Repo name",
		order: "Sort order by commit numbers, desc and asc (descending by default)",
		anon: "Show anonymous users. Defaults to no, use any values for yes."
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["github.com/:user/:repo/graphs/contributors", "github.com/:user/:repo"],
		target: "/contributors/:user/:repo"
	}],
	name: "Repo Contributors",
	maintainers: ["zoenglinghou"],
	handler
};
async function handler(ctx) {
	const { user, repo, order, anon } = ctx.req.param();
	const host = `https://github.com/${user}/${repo}`;
	const url = `https://api.github.com/repos/${user}/${repo}/contributors?` + (anon ? "anon=1" : "");
	const headers = {};
	if (config.github && config.github.access_token) headers.Authorization = `token ${config.github.access_token}`;
	const response = await got_default({
		method: "get",
		url,
		headers
	});
	let data = response.data;
	try {
		const last_page_link = response.headers.link.split(",").find((elem) => elem.includes("\"last\""));
		const url_base = last_page_link.match(/<(.*)page=\d*/)[1];
		const page_count = Number(last_page_link.match(/page=(\d*)/)[1]);
		const generate_array = (n) => Array.from({ length: n - 1 }, (_, index) => index + 2);
		const tasks = generate_array(page_count).map(async (page) => {
			const response = await got_default({
				method: "get",
				url: `${url_base}page=${page}`,
				headers
			});
			data = [...data, ...response.data];
		});
		await Promise.all(tasks);
	} catch (error) {
		if (!(error instanceof TypeError)) throw error;
	}
	data.sort((a, b) => a.contributions - b.contributions);
	if (order !== "asc") data.reverse();
	const items = data.map((item) => item.type === "Anonymous" ? {
		title: `Contributor: ${item.name}`,
		description: `<p>Anonymous contributor</p><p>Name: ${item.name}</p><p>E-mail: ${item.email}</p><p>Contributions: ${item.contributions}</p>`,
		guid: `anon-${item.name}`
	} : {
		title: `Contributor: ${item.login}`,
		description: `<img src="${item.avatar_url}"></img><p><a href="${item.html_url}">${item.login}</a></p><p>Contributions: ${item.contributions}</p>`,
		link: item.html_url,
		guid: item.id
	});
	return {
		title: `${user}/${repo} Contributors`,
		link: `${host}/graphs/contributors`,
		description: `New contributors for ${user}/${repo}`,
		item: items
	};
}
//#endregion
export { route };
