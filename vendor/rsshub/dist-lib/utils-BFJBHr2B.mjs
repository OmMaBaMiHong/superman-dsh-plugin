import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/daily/utils.tsx
const baseUrl = "https://app.daily.dev";
const gqlUrl = "https://api.daily.dev/graphql";
const variables = {
	version: 54,
	loggedIn: false
};
const getBuildId = () => cache_default.tryGet("daily:buildId", async () => {
	return (await rofetch(`${baseUrl}/onboarding`)).match(/"buildId":"(.*?)"/)[1];
}, config.cache.routeExpire, false);
const getData = async (graphqlQuery, source = false) => {
	const response = await rofetch(gqlUrl, {
		method: "POST",
		body: graphqlQuery
	});
	return source ? response.data.source : response.data.page.edges;
};
const render = ({ image, content }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [image ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: image }), /* @__PURE__ */ jsx("br", {})] }) : null, content ? raw(content) : null] }));
const getList = (edges, innerSharedContent, dateSort) => edges.map(({ node }) => {
	let link;
	let title;
	if (innerSharedContent && node.type === "share") {
		link = node.sharedPost.permalink;
		title = node.sharedPost.title;
	} else {
		link = node.commentsPermalink ?? node.permalink;
		title = node.title;
	}
	return {
		id: node.id,
		title,
		link,
		guid: node.permalink,
		description: render({
			image: node.image,
			content: node.contentHtml?.replaceAll("\n", "<br>") ?? node.summary
		}),
		author: node.author?.name,
		itunes_item_image: node.image,
		pubDate: dateSort ? parseDate(node.createdAt) : "",
		upvotes: node.numUpvotes,
		comments: node.numComments,
		category: node.tags
	};
});
//#endregion
export { variables as a, getList as i, getBuildId as n, getData as r, baseUrl as t };
