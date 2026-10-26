import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { i as getList, n as getBuildId, r as getData, t as baseUrl } from "./utils-BFJBHr2B.mjs";
//#region lib/routes/daily/user.ts
const userPostQuery = `
    query AuthorFeed($loggedIn: Boolean! = false, $userId: ID!, $after: String, $first: Int, $supportedTypes: [String!] = ["article", "share", "freeform", "video:youtube", "collection"]) {
        page: authorFeed(author: $userId, after: $after, first: $first, ranking: TIME, supportedTypes: $supportedTypes) {
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
                contentHtml
                ...UserPost @include(if: $loggedIn)
            }
        }
    }
    fragment FeedPost on Post {
        ...SharedPostInfo
        sharedPost {
            ...SharedPostInfo
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
    fragment SharedPostInfo on Post {
        id
        title
        titleHtml
        image
        readTime
        permalink
        commentsPermalink
        summary
        createdAt
        private
        upvoted
        commented
        bookmarked
        views
        numUpvotes
        numComments
        videoId
        scout {
            ...UserShortInfo
        }
        author {
            ...UserShortInfo
        }
        type
        tags
        source {
            ...SourceBaseInfo
        }
        downvoted
        flags {
            promoteToPublic
        }
        userState {
            vote
            flags {
                feedbackDismiss
            }
        }
        slug
    }
    fragment SourceBaseInfo on Source {
        id
        active
        handle
        name
        permalink
        public
        type
        description
        image
        membersCount
        privilegedMembers {
            user {
                id
            }
            role
        }
        currentMember {
            ...CurrentMember
        }
        memberPostingRole
        memberInviteRole
    }
    fragment CurrentMember on SourceMember {
        user {
            id
        }
        permissions
        role
        referralToken
        flags {
            hideFeedPosts
            collapsePinnedPosts
        }
    }
    fragment UserShortInfo on User {
        id
        name
        image
        permalink
        username
        bio
        createdAt
        reputation
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
	path: "/user/:userId/:innerSharedContent?",
	example: "/daily/user/kramer",
	radar: [{ source: ["app.daily.dev/:userId/posts", "app.daily.dev/:userId"] }],
	parameters: { innerSharedContent: {
		description: "Where to Fetch inner Shared Posts instead of original",
		default: "false",
		options: [{
			value: "false",
			label: "False"
		}, {
			value: "true",
			label: "True"
		}]
	} },
	name: "User Posts",
	maintainers: ["TonyRL"],
	handler,
	url: "app.daily.dev"
};
async function handler(ctx) {
	const userId = ctx.req.param("userId");
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 7;
	const innerSharedContent = ctx.req.param("innerSharedContent") ? JSON.parse(ctx.req.param("innerSharedContent")) : false;
	const buildId = await getBuildId();
	const user = (await cache_default.tryGet(`daily:user:${userId}`, async () => {
		return (await rofetch(`${baseUrl}/_next/data/${buildId}/en/${userId}.json`, { query: { userId } })).pageProps;
	})).user;
	const items = await cache_default.tryGet(`daily:user:${userId}:posts`, async () => {
		return getList(await getData({
			query: userPostQuery,
			variables: {
				userId: user.id,
				first: limit,
				loggedIn: false
			}
		}), innerSharedContent, true);
	}, config.cache.routeExpire, false);
	return {
		title: `${user.name} | daily.dev`,
		description: user.bio,
		link: `${baseUrl}/${userId}/posts`,
		item: items,
		image: user.image,
		logo: user.image,
		icon: user.image,
		language: "en-us"
	};
}
//#endregion
export { route };
