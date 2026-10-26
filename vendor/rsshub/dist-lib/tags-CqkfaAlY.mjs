import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as gqlEndpoint, r as parseItem, t as baseUrl } from "./utils-ZGifyZNc.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/matters/tags.ts
const getTagId = (tid) => cache_default.tryGet(`matters:tags:${tid}`, async () => {
	const response = await rofetch(`${baseUrl}/tags/${tid}`);
	const $ = cheerio.load(response);
	const nextData = JSON.parse($("script#__NEXT_DATA__").text());
	return (Object.entries(nextData.props.apolloState.data.ROOT_QUERY).find(([key]) => key.startsWith("node"))?.pop())?.id.split(":", 2)[1];
});
const handler = async (ctx) => {
	const { tid } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20;
	const node = (await rofetch(gqlEndpoint, {
		method: "POST",
		body: { query: `{
                node(input: {id: "${await getTagId(tid)}"}) {
                  ... on Tag {
                    content
                    description
                    articles(input: {first: ${limit}}) {
                      edges {
                        node {
                          title
                          shortHash
                          content
                          createdAt
                          author {
                            displayName
                          }
                          tags {
                            content
                          }
                        }
                      }
                    }
                  }
                }
              }` }
	})).data.node;
	return {
		title: `Matters | ${node.content}`,
		link: `${baseUrl}/tags/${tid}`,
		description: node.description,
		item: node.articles.edges.map(({ node }) => parseItem(node))
	};
};
const route = {
	path: "/tags/:tid",
	name: "Tags",
	example: "/matters/tags/972-哲學",
	parameters: { tid: "Tag id, can be found in the url of the tag page" },
	maintainers: ["Cerebrater"],
	handler,
	radar: [{ source: ["matters.town/tags/:tid"] }]
};
//#endregion
export { route };
