import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/fantube/utils.ts
const baseUrl = "https://www.fantube.tokyo";
const getCreatorFragment = (username) => cache_default.tryGet(`fantube:creator:${username}`, async () => {
	const $ = load(await rofetch(`${baseUrl}/r18/creator/${username}`, { headers: { cookie: "fantube-ageVerified=1;" } }));
	const selfPushString = JSON.parse($("script:contains(\"creatorFragment\")").text().match(/^self\.__next_f\.push\((.+?)\)$/)?.[1] || "{}");
	return JSON.parse(selfPushString[1].slice(2)).find((d) => d?.hasOwnProperty("children")).children.find((child) => Object.values(child).includes("div")).find((c) => c?.hasOwnProperty("children")).children.find((c) => c?.hasOwnProperty("creatorFragment")).creatorFragment;
});
const getCreatorPostReelList = (identifier, limit) => cache_default.tryGet(`fantube:creatorPostReelList:${identifier}:${limit}`, async () => {
	return (await rofetch("https://api.prd.fantube.tokyo/graphql", {
		headers: { Referer: baseUrl },
		body: JSON.stringify({
			query: `
                    query CreatorPostReelList($identifier: String!, $first: Int, $after: String, $last: Int, $before: String) {
                        posts(
                            where: { status: { equals: PUBLISHED }, creator: { is: { identifier: { equals: $identifier } } } }
                            orderBy: [{ pinnedAt: { nulls: last, sort: desc } }, { order: asc }, { createdAt: desc }, { id: desc }]
                            first: $first
                            after: $after
                            last: $last
                            before: $before
                        ) {
                            nodes {
                                ...PostSwiper_Post
                            }
                            pageInfo {
                                hasNextPage
                                endCursor
                                hasPreviousPage
                                startCursor
                            }
                        }
                    }

                    fragment PostSwiper_Post on Post {
                        id
                        title
                        isFavorite
                        favoritesCount
                        ...PostSwiperSlide_Post
                    }

                    fragment PostSwiperSlide_Post on Post {
                        id
                        type
                        title
                        price
                        creator {
                            displayName
                        }
                        ...PostVideoElement_Post
                        ...PostImageElement_Post
                    }

                    fragment PostVideoElement_Post on Post {
                        id
                        title
                        contentData {
                            ... on PostVideoType {
                                __typename
                                videoUrl
                                isSample
                                noSample
                                durationSeconds
                            }
                        }
                        isFavorite
                        sampleVideoId
                        thumbnailUrl
                        creator {
                            displayName
                        }
                        ...PostInfo_Post
                        ...VideoControlIcons_Post
                        ...PurchaseWrapper_Post
                    }

                    fragment PostInfo_Post on Post {
                        title
                        description
                        publishStartAt
                        price
                        isBuyEnabled
                        ...Profile_Post
                    }

                    fragment Profile_Post on Post {
                        id
                        creator {
                            id
                            isSelf
                            identifier
                            displayName
                            avatarImageUrl
                            following
                        }
                    }

                    fragment VideoControlIcons_Post on Post {
                        id
                        isMine
                        pinnedAt
                        favoritesCount
                        ...PostComment_Post
                    }

                    fragment PostComment_Post on Post {
                        id
                        isMine
                        canComment
                        comments(where: { OR: [{ parentPostComment: { is: { isDeleted: { equals: false } } } }, { parentPostCommentId: { equals: null } }], isDeleted: { equals: false } }) {
                            totalCount
                        }
                        ...PostCommentReplyDrawer_Post
                    }

                    fragment PostCommentReplyDrawer_Post on Post {
                        id
                        isMine
                        canComment
                    }

                    fragment PurchaseWrapper_Post on Post {
                        id
                        title
                        price
                        creator {
                            displayName
                        }
                        ...PostPurchaseDialog_Post
                        ...PostPurchaseSingleDialog_Post
                    }

                    fragment PostPurchaseDialog_Post on Post {
                        id
                        isBuyEnabled
                        price
                        thumbnailUrl
                        title
                        planPosts(orderBy: [{ plan: { deleteRequestAt: { sort: desc, nulls: first } } }, { plan: { isRecommended: desc } }, { plan: { price: asc } }]) {
                            nodes {
                                plan {
                                    id
                                    title
                                    price
                                    ...PlanSwiper_Plan
                                }
                            }
                        }
                        creator {
                            displayName
                        }
                        ...PostPurchaseSingleDialog_Post
                    }

                    fragment PlanSwiper_Plan on Plan {
                        id
                        ...PlanSwiperItem_Plan
                    }

                    fragment PlanSwiperItem_Plan on Plan {
                        id
                        title
                        price
                        isArchive
                        isRecommended
                        deleteRequestAt
                        isSubscribing
                        subscriptionCloseAt
                        capacity
                        subscribersCount
                        planPosts(where: { post: { is: { status: { equals: PUBLISHED } } } }, first: 7, orderBy: [{ createdAt: desc }]) {
                            nodes {
                                post {
                                    id
                                    thumbnailUrl
                                    title
                                }
                            }
                            totalCount
                        }
                        ...PlanUnavailableNote_Plan
                    }

                    fragment PlanUnavailableNote_Plan on Plan {
                        capacity
                        subscribersCount
                        subscriptionCloseAt
                        deleteRequestAt
                    }

                    fragment PostPurchaseSingleDialog_Post on Post {
                        id
                        price
                        thumbnailUrl
                        title
                        isBuyEnabled
                    }

                    fragment PostImageElement_Post on Post {
                        id
                        title
                        contentData {
                            __typename
                            ... on PostImageType {
                                encrypted
                                imageUrls
                                count
                            }
                        }
                        isFavorite
                        creator {
                            displayName
                        }
                        ...PostInfo_Post
                        ...ImageControlIcons_Post
                        ...PurchaseWrapper_Post
                    }

                    fragment ImageControlIcons_Post on Post {
                        id
                        isMine
                        pinnedAt
                        favoritesCount
                        ...PostComment_Post
                    }
                `,
			variables: {
				identifier,
				first: limit,
				after: ""
			},
			operationName: "CreatorPostReelList"
		}),
		method: "POST"
	})).data.posts.nodes;
});
//#endregion
//#region lib/routes/fantube/creator.tsx
const route = {
	path: "/r18/creator/:identifier",
	categories: ["multimedia"],
	example: "/fantube/r18/creator/miyuu",
	parameters: { identifier: "User handle" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.fantube.tokyo/r18/creator/:identifier"] }],
	name: "User Posts",
	maintainers: ["TonyRL"],
	handler
};
const renderDescription = ({ description, thumbnailUrl, sampleVideoId, imageUrls }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	thumbnailUrl ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: thumbnailUrl }), /* @__PURE__ */ jsx("br", {})] }) : null,
	imageUrls?.map((img, index) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: img }, `${img}-${index}`), /* @__PURE__ */ jsx("br", {})] })),
	sampleVideoId ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
		style: "position: relative; padding-top: 56.25%",
		children: /* @__PURE__ */ jsx("iframe", {
			src: `https://customer-7d4xajfg7g3ps2lm.cloudflarestream.com/${sampleVideoId}/iframe`,
			style: "border: none; position: absolute; top: 0; height: 100%; width: 100%",
			allow: "accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;",
			allowfullscreen: "true"
		})
	}), /* @__PURE__ */ jsx("br", {})] }) : null,
	description ? raw(description.replaceAll("\n", "<br>")) : null
] }));
async function handler(ctx) {
	const { identifier } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") || 18);
	const creatorInfo = await getCreatorFragment(identifier);
	const items = (await getCreatorPostReelList(identifier, limit)).map((p) => ({
		title: p.title.replaceAll("\n", " ").trim(),
		description: renderDescription({
			description: p.description,
			thumbnailUrl: p.thumbnailUrl,
			sampleVideoId: p.sampleVideoId,
			imageUrls: p.contentData?.imageUrls || []
		}),
		link: `${baseUrl}/r18/post/${p.id}?creator=${identifier}`,
		author: p.creator.displayName,
		pubDate: parseDate(p.publishStartAt),
		image: p.thumbnailUrl
	}));
	return {
		title: `${creatorInfo.displayName}のプロフィール｜クリエイターページ｜FANTUBE(ファンチューブ)`,
		link: `${baseUrl}/r18/creator/${identifier}`,
		description: creatorInfo.description,
		image: creatorInfo.avatarImageUrl,
		icon: creatorInfo.avatarImageUrl,
		logo: creatorInfo.avatarImageUrl,
		language: "ja",
		item: items
	};
}
//#endregion
export { route };
