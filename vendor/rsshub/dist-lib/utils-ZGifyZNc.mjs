import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/matters/utils.ts
const baseUrl = "https://matters.town";
const gqlEndpoint = "https://server.matters.town/graphql";
const parseItem = (node) => ({
	title: node.title,
	description: node.content,
	link: `${baseUrl}/a/${node.shortHash}`,
	author: node.author.displayName,
	pubDate: parseDate(node.createdAt),
	category: node.tags.map((tag) => tag.content)
});
//#endregion
export { gqlEndpoint as n, parseItem as r, baseUrl as t };
