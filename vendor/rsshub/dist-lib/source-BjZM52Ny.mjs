import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { i as getList, n as getBuildId, r as getData, t as baseUrl } from "./utils-BFJBHr2B.mjs";
//#region lib/routes/daily/source.ts
const sourceFeedQuery = `
    query SourceFeed($source: ID!, $loggedIn: Boolean! = false, $first: Int, $after: String, $ranking: Ranking, $supportedTypes: [String!]) {
        page: sourceFeed(source: $source, first: $first, after: $after, ranking: $ranking, supportedTypes: $supportedTypes) {
            ...FeedPostConnection
        }
    }

    fragment FeedPostConnection on PostConnection {
        pageInfo {
            hasNextPage
            endCursor
        }
        edges {
            node {
                ...FeedPost
                pinnedAt
                contentHtml
                ...UserPost @include(if: $loggedIn)
            }
        }
    }

    fragment FeedPost on Post {
        ...FeedPostInfo
        sharedPost {
            id
            title
            image
            readTime
            permalink
            commentsPermalink
            createdAt
            type
            tags
            source {
                id
                handle
                permalink
                image
            }
            slug
        }
        trending
        feedMeta
        collectionSources {
            handle
            image
        }
        numCollectionSources
        updatedAt
        slug
    }

    fragment FeedPostInfo on Post {
        id
        title
        image
        readTime
        permalink
        commentsPermalink
        createdAt
        commented
        bookmarked
        views
        numUpvotes
        numComments
        summary
        bookmark {
            remindAt
        }
        author {
            id
            name
            image
            username
            permalink
        }
        type
        tags
        source {
            id
            handle
            name
            permalink
            image
            type
        }
        userState {
            vote
            flags {
                feedbackDismiss
            }
        }
        slug
    }

    fragment UserPost on Post {
        read
        upvoted
        commented
        bookmarked
        downvoted
    }
`;
const route = {
	path: "/source/:sourceId/:innerSharedContent?",
	example: "/daily/source/hn",
	parameters: {
		sourceId: "The source id",
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
		}
	},
	radar: [{ source: ["app.daily.dev/sources/:sourceId"] }],
	name: "Source Posts",
	maintainers: ["TonyRL"],
	handler,
	url: "app.daily.dev"
};
async function handler(ctx) {
	const sourceId = ctx.req.param("sourceId");
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 10;
	const innerSharedContent = ctx.req.param("innerSharedContent") ? JSON.parse(ctx.req.param("innerSharedContent")) : false;
	const link = `${baseUrl}/sources/${sourceId}`;
	const buildId = await getBuildId();
	const userData = await cache_default.tryGet(`daily:source:${sourceId}`, async () => {
		return (await rofetch(`${baseUrl}/_next/data/${buildId}/en/sources/${sourceId}.json`)).pageProps.source;
	});
	const items = await cache_default.tryGet(`daily:source:${sourceId}:posts`, async () => {
		return getList(await getData({
			query: sourceFeedQuery,
			variables: {
				source: sourceId,
				supportedTypes: [
					"article",
					"video:youtube",
					"collection"
				],
				period: 30,
				first: limit,
				after: "",
				loggedIn: false
			}
		}), innerSharedContent, true);
	}, config.cache.routeExpire, false);
	return {
		title: `${userData.name} posts on daily.dev`,
		description: userData.description,
		link,
		item: items,
		image: userData.image,
		logo: userData.image,
		icon: userData.image,
		language: "en-us"
	};
}
//#endregion
export { route };
