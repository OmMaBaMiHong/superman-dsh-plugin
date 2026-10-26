import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/parliament.uk/petitions.tsx
const handler = async (ctx) => {
	const { state = "all" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "50");
	const rootUrl = "https://petition.parliament.uk";
	const targetUrl = new URL(`petitions?state=${state}`, rootUrl).href;
	const jsonUrl = new URL("petitions.json", rootUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").prop("lang") ?? "en";
	const items = (await rofetch(jsonUrl, { query: {
		page: 1,
		state
	} })).data.slice(0, limit).map((item) => {
		const attributes = item.attributes;
		const title = attributes.action;
		const description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [attributes.background ? /* @__PURE__ */ jsx("blockquote", { children: attributes.background }) : null, attributes.additional_details ? /* @__PURE__ */ jsx("p", { children: attributes.additional_details }) : null] }));
		const guid = `parliament.uk-petition-${item.id}`;
		const author = attributes.creator_name;
		const extraLinks = attributes.departments?.map((link) => ({
			url: link.url,
			type: "related",
			content_html: link.name
		}));
		return {
			title,
			description,
			pubDate: parseDate(attributes.created_at),
			link: new URL(`petitions/${item.id}`, rootUrl).href,
			category: [.../* @__PURE__ */ new Set([...attributes.topics ?? [], ...attributes.departments?.map((d) => d.name) ?? []])].filter(Boolean),
			author,
			guid,
			id: guid,
			content: {
				html: description,
				text: attributes.background
			},
			updated: parseDate(attributes.updated_at),
			language,
			_extra: { links: extraLinks?.length ? extraLinks : void 0 }
		};
	});
	const feedImage = $("meta[property=\"og:image\"]").prop("content");
	return {
		title: $("h1.page-title").text(),
		description: $("meta[property=\"twitter:description\"]").prop("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: feedImage,
		author: $("meta[name=\"msapplication-tooltip\"]").prop("content"),
		language,
		id: $("meta[property=\"og:url\"]").prop("content")
	};
};
const route = {
	path: "/petitions/:state?",
	name: "Petitions",
	url: "petition.parliament.uk",
	maintainers: ["nczitzk"],
	handler,
	example: "/parliament.uk/petitions/all",
	parameters: { state: "State, `all` by default, see below" },
	description: `::: tip
If you subscribe to [Recent petitions](https://petition.parliament.uk/petitions?state=recent)，where the URL is \`https://petition.parliament.uk/petitions?state=recent\`, use the value of \`state\` as the parameter to fill in. Therefore, the route will be [\`/parliament.uk/petitions/recent\`](https://rsshub.app/parliament.uk/petitions/recent).
:::

<details>
<summary>More states</summary>

| Name                            | ID                 |
| ------------------------------- | ------------------ |
| All petitions                   | all                |
| Open petitions                  | open               |
| Recent petitions                | recent             |
| Closed petitions                | closed             |
| Rejected petitions              | rejected           |
| Awaiting government response    | awaiting\\_response |
| Government responses            | with\\_response     |
| Awaiting a debate in Parliament | awaiting\\_debate   |
| Debated in Parliament           | debated            |
| Not debated in Parliament       | not\\_debated       |

</details>`,
	categories: ["government"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{
			source: ["petition.parliament.uk/petitions"],
			target: (_, url) => {
				const state = new URL(url).searchParams.get("state");
				return `/parliament.uk/petitions${state ? `/${state}` : ""}`;
			}
		},
		{
			title: "All petitions",
			source: ["petition.parliament.uk/petitions"],
			target: "/petitions/all"
		},
		{
			title: "Open petitions",
			source: ["petition.parliament.uk/petitions"],
			target: "/petitions/open"
		},
		{
			title: "Recent petitions",
			source: ["petition.parliament.uk/petitions"],
			target: "/petitions/recent"
		},
		{
			title: "Closed petitions",
			source: ["petition.parliament.uk/petitions"],
			target: "/petitions/closed"
		},
		{
			title: "Rejected petitions",
			source: ["petition.parliament.uk/petitions"],
			target: "/petitions/rejected"
		},
		{
			title: "Awaiting government response",
			source: ["petition.parliament.uk/petitions"],
			target: "/petitions/awaiting_response"
		},
		{
			title: "Government responses",
			source: ["petition.parliament.uk/petitions"],
			target: "/petitions/with_response"
		},
		{
			title: "Awaiting a debate in Parliament",
			source: ["petition.parliament.uk/petitions"],
			target: "/petitions/awaiting_debate"
		},
		{
			title: "Debated in Parliament",
			source: ["petition.parliament.uk/petitions"],
			target: "/petitions/debated"
		},
		{
			title: "Not debated in Parliament",
			source: ["petition.parliament.uk/petitions"],
			target: "/petitions/not_debated"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
