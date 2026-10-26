import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/digg/community.tsx
const route = {
	path: "/community/:community",
	categories: ["social-media"],
	example: "/digg/community/askdigg",
	parameters: { community: "Community slug, can be found in the URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["digg.com/:community"] }],
	name: "Community Posts",
	maintainers: ["TonyRL"],
	handler,
	url: "digg.com/"
};
const baseUrl = "https://digg.com";
const graphqlUrl = "https://apineapple-prod.digg.com/graphql";
const DiggDescription = ({ node }) => {
	if (!node) return null;
	const children = Array.isArray(node.content) ? node.content : [];
	switch (node.type) {
		case "bulletList": return /* @__PURE__ */ jsx("ul", { children: children.map((element, index) => /* @__PURE__ */ jsx(DiggDescription, { node: element }, index)) });
		case "listItem": return /* @__PURE__ */ jsx("li", { children: children.map((element, index) => /* @__PURE__ */ jsx(DiggDescription, { node: element }, index)) });
		case "diggImagesBlock":
			if (node.attrs && Array.isArray(node.attrs.images)) return /* @__PURE__ */ jsx("div", { children: node.attrs.images.map((img, index) => /* @__PURE__ */ jsx("img", {
				src: img.url,
				alt: "",
				width: img.width,
				height: img.height
			}, index)) });
			return null;
		case "diggLinkBlock": return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("a", {
			href: node.attrs.url,
			children: [
				node.attrs.title || node.attrs.url,
				/* @__PURE__ */ jsx("br", {}),
				node.attrs.description
			]
		}), node.attrs.tldr] });
		case "diggTextBlock":
		case "doc": return /* @__PURE__ */ jsx(Fragment, { children: children.map((element, index) => /* @__PURE__ */ jsx(DiggDescription, { node: element }, index)) });
		case "diggTitleBlock": return null;
		case "hardBreak": return /* @__PURE__ */ jsx("br", {});
		case "mention": return /* @__PURE__ */ jsxs("a", {
			href: `${baseUrl}/${node.attrs.label}`,
			children: ["/", node.attrs.label]
		});
		case "paragraph":
			if (children.length === 0) return null;
			return /* @__PURE__ */ jsxs("p", { children: [children.map((element, index) => /* @__PURE__ */ jsx(DiggDescription, { node: element }, index)), /* @__PURE__ */ jsx("br", {})] });
		case "text": return node.text || "";
		default: throw new Error(`Unknown node type: ${node.type}`);
	}
};
async function handler(ctx) {
	const { community } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? 30);
	const communityData = await cache_default.tryGet(`digg:community:${community}`, async () => {
		const { data: { community: communityData } } = await rofetch(graphqlUrl, {
			method: "POST",
			body: {
				query: `
                    query CommunityQuery($id: ID, $slug: String) {
                        community(where: { _id_EQ: $id, slug_EQ: $slug }) {
                            ...CommunityFragment
                            topContributors {
                                account {
                                    _id
                                    avatarUrl
                                    avatarImage {
                                        ...ImageFragment
                                    }
                                    username
                                }
                                score
                            }
                            topGemFinders {
                                account {
                                    _id
                                    avatarUrl
                                    avatarImage {
                                        ...ImageFragment
                                    }
                                    username
                                }
                                score
                            }
                        }
                    }
                    fragment AuthorFragment on Account {
                        _id
                        username
                        avatarUrl
                        avatarImage {
                            ...ImageFragment
                        }
                        badges {
                            name
                            iconUrl
                        }
                        blockStatus
                        roles {
                            name
                            iconUrl
                        }
                    }
                    fragment CommunityFragment on Community {
                        _id
                        name
                        slug
                        description
                        iconUrl
                        guidelinesPM
                        descriptionPM
                        iconImage {
                            ...ImageFragment
                        }
                        bannerUrl
                        bannerDesktopImage {
                            ...ImageFragment
                        }
                        bannerMobileImage {
                            ...ImageFragment
                        }
                        founder {
                            ...AuthorFragment
                            bio
                        }
                        manager {
                            ...AuthorFragment
                        }
                        memberCount
                        postCount
                        isJoinedByAccount
                        isPinnedByAccount
                        isJoinedByDefault
                        createdDate
                        editedDate
                        deletedDate
                    }
                    fragment ImageFragment on Image {
                        alt
                        height
                        width
                        url
                        blurhash
                    }
                `,
				variables: { slug: community }
			}
		});
		return communityData;
	});
	const { data: { posts } } = await rofetch(graphqlUrl, {
		method: "POST",
		body: {
			query: `
                query PostsQuery($first: Int, $after: String, $where: PostWhere, $sort: PostSort) {
                    posts(first: $first, after: $after, where: $where, sort: $sort) {
                        edges {
                            node {
                                ...PostsNodeFragment
                            }
                        }
                        pageInfo {
                            ...PageInfoFragment
                        }
                    }
                }
                fragment AuthorFragment on Account {
                    _id
                    username
                    avatarUrl
                    avatarImage {
                        ...ImageFragment
                    }
                    badges {
                        name
                        iconUrl
                    }
                    blockStatus
                    roles {
                        name
                        iconUrl
                    }
                }
                fragment CommunityFragment on Community {
                    _id
                    name
                    slug
                    description
                    iconUrl
                    guidelinesPM
                    descriptionPM
                    iconImage {
                        ...ImageFragment
                    }
                    bannerUrl
                    bannerDesktopImage {
                        ...ImageFragment
                    }
                    bannerMobileImage {
                        ...ImageFragment
                    }
                    founder {
                        ...AuthorFragment
                        bio
                    }
                    manager {
                        ...AuthorFragment
                    }
                    memberCount
                    postCount
                    isJoinedByAccount
                    isPinnedByAccount
                    isJoinedByDefault
                    createdDate
                    editedDate
                    deletedDate
                }
                fragment ImageFragment on Image {
                    alt
                    height
                    width
                    url
                    blurhash
                }
                fragment ModerationReasonFragment on ModerationRemovalReason {
                    id
                    key
                    description
                    message
                    type
                    createdDate
                    editedDate
                    deletedDate
                }
                fragment PageInfoFragment on PageInfo {
                    endCursor
                    hasNextPage
                    hasPreviousPage
                    startCursor
                }
                fragment PostsNodeFragment on Post {
                    _id
                    title
                    isSavedByAccount
                    moderationStatus
                    isDuggByAccount
                    voteDirectionByAccount
                    upvoteCount
                    downvoteCount
                    score
                    reportByAccount
                    slug
                    type
                    externalContent {
                        url
                        headline
                        subHeadline
                        imageUrl
                        iconUrl
                    }
                    commentCount
                    shareCount
                    textPreview
                    contextCards {
                        tldr {
                            text
                        }
                    }
                    community {
                        ...CommunityFragment
                    }
                    attachments {
                        __typename
                        ... on Image {
                            ...ImageFragment
                        }
                    }
                    author {
                        ...AuthorFragment
                    }
                    createdDate
                    editedDate
                    deletedDate
                    nsfw
                    text
                    pm
                    moderatedDate
                    moderationReason {
                        ...ModerationReasonFragment
                    }
                }
            `,
			variables: {
				first: limit,
				where: { community: { slug_EQ: community } },
				sort: "RECENT"
			}
		}
	});
	const items = posts.edges.map(({ node }) => ({
		title: node.title,
		description: renderToString(/* @__PURE__ */ jsx(DiggDescription, { node: node.pm })),
		link: `${baseUrl}/${node._id.replaceAll("-", "/")}/${node.slug}`,
		pubDate: parseDate(node.createdDate),
		author: node.author.username
	}));
	return {
		title: `${communityData.name} Community | Digg | Digg`,
		description: communityData.description,
		image: communityData.iconUrl,
		link: `${baseUrl}/${community}`,
		item: items
	};
}
//#endregion
export { route };
