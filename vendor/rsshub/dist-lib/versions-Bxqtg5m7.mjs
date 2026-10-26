import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import markdownit from "markdown-it";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/modrinth/versions.tsx
const ofetch = rofetch.create({ headers: { "user-agent": config.trueUA } });
const md = markdownit({ html: true });
const renderVersion = (version) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsxs("p", { children: [
		version.name,
		" - ",
		version.version_number
	] }),
	/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "Loaders: " }), version.loaders?.map((loader) => `${loader} `)] }),
	/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "Game Versions: " }), version.game_versions?.map((gameVersion) => `${gameVersion} `)] }),
	version.changelog ? raw(version.changelog) : null,
	/* @__PURE__ */ jsx("p", { children: "Files:" }),
	version.files?.map((file) => /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("a", {
		href: file.url,
		children: file.filename
	}) }))
] }));
const route = {
	path: "/project/:id/versions/:routeParams?",
	categories: ["game"],
	example: "/modrinth/project/sodium/versions",
	parameters: {
		id: "Id or slug of the Modrinth project",
		routeParams: "Extra route params. See the table below for options"
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
		source: [
			"modrinth.com/mod/:id/*",
			"modrinth.com/plugin/:id/*",
			"modrinth.com/datapack/:id/*",
			"modrinth.com/shader/:id/*",
			"modrinth.com/resourcepack/:id/*",
			"modrinth.com/modpack/:id/*",
			"modrinth.com/mod/:id",
			"modrinth.com/plugin/:id",
			"modrinth.com/datapack/:id",
			"modrinth.com/shader/:id",
			"modrinth.com/resourcepack/:id",
			"modrinth.com/modpack/:id"
		],
		target: "/project/:id/versions"
	}],
	name: "Project versions",
	maintainers: ["SettingDust"],
	handler,
	description: `| Name           | Example                                      |
| -------------- | -------------------------------------------- |
| loaders        | loaders=fabric\\&loaders=quilt\\&loaders=forge |
| game\\_versions | game\\_versions=1.20.1\\&game\\_versions=1.20.2 |
| featured       | featured=true                                |`
};
async function handler(ctx) {
	const { id, routeParams } = ctx.req.param();
	/**
	* /@type {{
	*   loaders: string | string[] | undefined
	*   game_versions: string | string[] | undefined
	*   featured: string | undefined
	* }}
	*/
	const parsedQuery = new URLSearchParams(routeParams);
	try {
		const project = await ofetch(`https://api.modrinth.com/v2/project/${id}`);
		const versions = await ofetch(`https://api.modrinth.com/v2/project/${id}/version`, { query: {
			loaders: parsedQuery.has("loaders") ? JSON.stringify(parsedQuery.getAll("loaders")) : "",
			game_versions: parsedQuery.has("game_versions") ? JSON.stringify(parsedQuery.getAll("game_versions")) : ""
		} });
		const authorIds = [...new Set(versions.map((it) => it.author_id))];
		const authors = await ofetch("https://api.modrinth.com/v2/users", { query: { ids: JSON.stringify(authorIds) } });
		const groupedAuthors = {};
		for (const author of authors) groupedAuthors[author.id] = author;
		return {
			title: `${project.title} Modrinth versions`,
			description: project.description,
			link: `https://modrinth.com/project/${id}`,
			item: versions.map((it) => ({
				title: `${it.name} for ${it.loaders.join("/")} on ${[.../* @__PURE__ */ new Set([it.game_versions[0], it.game_versions.at(-1)])].join("-")}`,
				link: `https://modrinth.com/project/${id}/version/${it.version_number}`,
				pubDate: parseDate(it.date_published),
				description: renderVersion({
					...it,
					changelog: md.render(it.changelog)
				}),
				guid: it.id,
				author: groupedAuthors[it.author_id].username
			}))
		};
	} catch (error) {
		if (error?.response?.statusCode === 404) throw new Error(`${error.message}: Project ${id} not found`, { cause: error });
		throw error;
	}
}
//#endregion
export { route };
