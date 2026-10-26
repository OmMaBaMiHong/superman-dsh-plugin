import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/github/trending.tsx
const route = {
	path: "/trending/:since/:language/:spoken_language?",
	categories: ["programming"],
	example: "/github/trending/daily/javascript/en",
	view: 5,
	parameters: {
		since: {
			description: "time range",
			options: [
				{
					value: "daily",
					label: "Today"
				},
				{
					value: "weekly",
					label: "This week"
				},
				{
					value: "monthly",
					label: "This month"
				}
			]
		},
		language: {
			description: "the feed language, available in [Trending page](https://github.com/trending/javascript?since=monthly) 's URL, don't filter option is `any`",
			default: "any"
		},
		spoken_language: { description: "natural language, available in [Trending page](https://github.com/trending/javascript?since=monthly) 's URL" }
	},
	features: {
		requireConfig: [{
			name: "GITHUB_ACCESS_TOKEN",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["github.com/trending"],
		target: "/trending/:since"
	}],
	name: "Trending",
	maintainers: ["DIYgod", "jameschensmith"],
	handler,
	url: "github.com/trending"
};
async function handler(ctx) {
	if (!config.github || !config.github.access_token) throw new ConfigNotFoundError("GitHub trending RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const since = ctx.req.param("since");
	const language = ctx.req.param("language") === "any" ? "" : ctx.req.param("language");
	const spoken_language = ctx.req.param("spoken_language") ?? "";
	const trendingUrl = `https://github.com/trending/${encodeURIComponent(language)}?since=${since}&spoken_language_code=${spoken_language}`;
	const { data: trendingPage } = await got_default({
		method: "get",
		url: trendingUrl,
		headers: { Referer: trendingUrl }
	});
	const $ = load(trendingPage);
	const trendingRepos = $("article").toArray().map((item) => {
		const [owner, name] = $(item).find("h2").text().split("/");
		return {
			name: name.trim(),
			owner: owner.trim()
		};
	});
	const { data: repoData } = await got_default({
		method: "post",
		url: "https://api.github.com/graphql",
		headers: { Authorization: `bearer ${config.github.access_token}` },
		json: { query: `
            query {
            ${trendingRepos.map((repo, index) => `
                _${index}: repository(owner: "${repo.owner}", name: "${repo.name}") {
                    ...RepositoryFragment
                }
            `).join("\n")}
            }

            fragment RepositoryFragment on Repository {
                description
                forkCount
                nameWithOwner
                openGraphImageUrl
                primaryLanguage {
                    name
                }
                stargazerCount
            }
            ` }
	});
	const repos = Object.values(repoData.data).map((repo) => {
		return {
			...trendingRepos.find((r) => `${r.owner}/${r.name}` === repo.nameWithOwner),
			...repo
		};
	});
	return {
		title: $("title").text(),
		link: trendingUrl,
		item: repos.map((r) => ({
			title: r.nameWithOwner,
			author: r.owner,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("img", { src: r.openGraphImageUrl }),
				/* @__PURE__ */ jsx("br", {}),
				r.description ? raw(r.description) : null,
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsx("br", {}),
				"Language: ",
				raw(r.primaryLanguage?.name || "Unknown"),
				/* @__PURE__ */ jsx("br", {}),
				"Stars: ",
				raw(String(r.stargazerCount)),
				/* @__PURE__ */ jsx("br", {}),
				"Forks: ",
				raw(String(r.forkCount))
			] })),
			link: `https://github.com/${r.nameWithOwner}`
		}))
	};
}
//#endregion
export { route };
