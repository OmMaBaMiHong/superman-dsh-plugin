import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as gqlEndpoint, r as parseItem, t as baseUrl } from "./utils-ZGifyZNc.mjs";
//#region lib/routes/matters/author.ts
const handler = async (ctx) => {
	const { uid } = ctx.req.param();
	const user = (await rofetch(gqlEndpoint, {
		method: "POST",
		body: { query: `{
                user(input: {userName: "${uid}"}) {
                  displayName
                  avatar
                  info {
                    description
                  }
                  articles(input: {first: ${ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20}}) {
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
              }` }
	})).data.user;
	return {
		title: `Matters | ${user.displayName}`,
		link: `${baseUrl}/@${uid}`,
		description: user.info.description,
		image: user.avatar,
		item: user.articles.edges.map(({ node }) => parseItem(node))
	};
};
const route = {
	path: "/author/:uid",
	name: "Author",
	example: "/matters/author/robertu",
	parameters: { uid: "Author id, can be found at author's homepage url" },
	maintainers: ["Cerebrater", "xosdy"],
	handler,
	radar: [{
		source: ["matters.town/:uid"],
		target: (params) => `/matters/author/${params.uid.slice(1)}`
	}]
};
//#endregion
export { route };
