import "./types-DNj6Etbg.mjs";
import { a as variables, i as getList, r as getData, t as baseUrl } from "./utils-BFJBHr2B.mjs";
//#region lib/routes/daily/discussed.ts
const query = `
    query MostDiscussedFeed($first: Int, $supportedTypes: [String!] = ["article", "share", "freeform"]) {
        page: mostDiscussedFeed(first: $first, supportedTypes: $supportedTypes) {
            ...FeedPostConnection
        }
    }

    fragment FeedPostConnection on PostConnection {
        edges {
            node {
                ...FeedPost
                contentHtml
            }
        }
    }

    fragment FeedPost on Post {
        ...SharedPostInfo
    }

    fragment SharedPostInfo on Post {
        id
        title
        image
        readTime
        permalink
        commentsPermalink
        summary
        createdAt
        numUpvotes
        numComments
        author {
            ...UserShortInfo
        }
        tags
    }

    fragment UserShortInfo on User {
        id
        name
        image
        permalink
        username
        bio
    }
`;
const route = {
	path: "/discussed/:period?/:innerSharedContent?/:dateSort?",
	example: "/daily/discussed/30",
	view: 0,
	radar: [{ source: ["app.daily.dev/discussed"] }],
	name: "Most Discussed",
	maintainers: ["Rjnishant530"],
	handler,
	url: "app.daily.dev/discussed",
	parameters: {
		innerSharedContent: {
			description: "Where to Fetch inner Shared Posts instead of original",
			default: "false",
			options: [{
				value: "false",
				label: "False"
			}, {
				value: "true",
				label: "True"
			}]
		},
		dateSort: {
			description: "Sort posts by publication date instead of popularity",
			default: "true",
			options: [{
				value: "false",
				label: "False"
			}, {
				value: "true",
				label: "True"
			}]
		},
		period: {
			description: "Period of Lookup",
			default: "7",
			options: [
				{
					value: "7",
					label: "Last Week"
				},
				{
					value: "30",
					label: "Last Month"
				},
				{
					value: "365",
					label: "Last Year"
				}
			]
		}
	}
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20;
	const innerSharedContent = ctx.req.param("innerSharedContent") ? JSON.parse(ctx.req.param("innerSharedContent")) : false;
	const dateSort = ctx.req.param("dateSort") ? JSON.parse(ctx.req.param("dateSort")) : true;
	const period = ctx.req.param("period") ? Number(ctx.req.param("period")) : 7;
	return {
		title: "Real-time discussions in the developer community | daily.dev",
		link: `${baseUrl}/posts/discussed`,
		item: getList(await getData({
			query,
			variables: {
				...variables,
				first: limit,
				period
			}
		}), innerSharedContent, dateSort),
		description: "Stay on top of real-time developer discussions on daily.dev. Join conversations happening now and engage with the most active community members.",
		logo: `${baseUrl}/favicon-32x32.png`,
		icon: `${baseUrl}/favicon-32x32.png`,
		language: "en-us"
	};
}
//#endregion
export { route };
