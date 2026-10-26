import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as gqlEndpoint, r as parseItem, t as baseUrl } from "./utils-ZGifyZNc.mjs";
//#region lib/routes/matters/latest.ts
const handler = async (ctx) => {
	const { type = "latest" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20;
	const options = {
		latest: {
			title: "最新",
			apiType: "newest"
		},
		heat: {
			title: "熱議",
			apiType: "hottest"
		},
		essence: {
			title: "精華",
			apiType: "icymi"
		}
	};
	const item = (await rofetch(gqlEndpoint, {
		method: "POST",
		body: { query: `{
                viewer {
                  recommendation {
                    feed: ${options[type].apiType}(input: {first: ${limit}}) {
                      edges {
                        node {
                          shortHash
                          title
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
	})).data.viewer.recommendation.feed.edges.map(({ node }) => parseItem(node));
	return {
		title: `Matters | ${options[type].title}`,
		link: baseUrl,
		item
	};
};
const route = {
	path: "/latest/:type?",
	name: "Latest, heat, essence",
	example: "/matters/latest/heat",
	parameters: { uid: "Defaults to latest, see table below" },
	maintainers: [
		"xyqfer",
		"Cerebrater",
		"xosdy"
	],
	handler,
	radar: [{ source: ["matters.town"] }],
	description: `| 最新   | 热门 | 精华    |
| ------ | ---- | ------- |
| latest | heat | essence |`
};
//#endregion
export { route };
