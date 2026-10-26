import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/medium/graphql.ts
async function graphqlRequest(body, cookie) {
	const { data } = await got_default("https://medium.com/_/graphql", {
		method: "POST",
		headers: {
			accept: "*/*",
			"accept-language": "en-US,en;q=0.9,zh;q=0.8,zh-CN;q=0.7",
			"apollographql-client-name": "lite",
			"apollographql-client-version": "main-20240329-011934-2370d8b72b",
			"cache-control": "no-cache",
			"content-type": "application/json",
			"medium-frontend-app": "lite/main-20240329-011934-2370d8b72b",
			"medium-frontend-path": "/",
			"medium-frontend-route": "homepage",
			"ot-tracer-sampled": "true",
			"ot-tracer-spanid": "26b843316dc9494d",
			"ot-tracer-traceid": "c84ea9154765033",
			pragma: "no-cache",
			"sec-ch-ua": "\"Chromium\";v=\"123\", \"Not:A-Brand\";v=\"8\"",
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": "\"macOS\"",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"graphql-operation": body.operationName,
			cookie
		},
		body: JSON.stringify([body])
	});
	return data[0].data;
}
async function getFollowingFeedQuery(user, cookie, pagingLimit = 20) {
	return (await graphqlRequest(newFollowingFeedQuery(pagingLimit), cookie))?.followingFeed;
}
async function getWebInlineRecommendedFeedQuery(user, cookie, pagingLimit = 20) {
	return (await graphqlRequest(newWebInlineRecommendedFeedQuery(pagingLimit), cookie))?.webRecommendedFeed;
}
async function getWebInlineTopicFeedQuery(user, tagSlug, cookie, pagingLimit = 20) {
	return (await graphqlRequest(newWebInlineTopicFeedQuery(tagSlug, pagingLimit), cookie))?.personalisedTagFeed;
}
async function getUserCatalogMainContentQuery(user, catalogId, cookie, pagingLimit = 20) {
	return (await graphqlRequest(newUserCatalogMainContentQuery(catalogId, pagingLimit), cookie))?.catalogById;
}
function newFollowingFeedQuery(pagingLimit = 5) {
	return {
		operationName: "LegacyFollowingFeedQuery",
		variables: { paging: { limit: pagingLimit } },
		query: `
            query LegacyFollowingFeedQuery($paging: PagingOptions) {
                followingFeed(paging: $paging) {
                    items {
                        feedId
                        post {
                            mediumUrl
                            __typename
                        }
                        __typename
                    }
                    pagingInfo {
                        next {
                            to
                            from
                            limit
                            source
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
            }
        `
	};
}
function newWebInlineRecommendedFeedQuery(pagingLimit = 5) {
	return {
		operationName: "LegacyWebInlineRecommendedFeedQuery",
		variables: {
			forceRank: true,
			paging: { limit: pagingLimit }
		},
		query: `
            query LegacyWebInlineRecommendedFeedQuery($paging: PagingOptions, $forceRank: Boolean) {
                webRecommendedFeed(paging: $paging, forceRank: $forceRank) {
                    items {
                        feedId
                        post {
                            mediumUrl
                            __typename
                        }
                        __typename
                    }
                    pagingInfo {
                        next {
                            limit
                            to
                            source
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
            }
        `
	};
}
function newWebInlineTopicFeedQuery(tagSlug, pagingLimit = 5) {
	return {
		operationName: "LegacyWebInlineTopicFeedQuery",
		variables: {
			tagSlug,
			paging: { limit: pagingLimit },
			skipCache: true
		},
		query: `
            query LegacyWebInlineTopicFeedQuery($tagSlug: String!, $paging: PagingOptions!, $skipCache: Boolean) {
                personalisedTagFeed(tagSlug: $tagSlug, paging: $paging, skipCache: $skipCache) {
                    items {
                        feedId
                        post {
                            mediumUrl
                            __typename
                        }
                        __typename
                    }
                    pagingInfo {
                        next {
                            source
                            limit
                            from
                            to
                            __typename
                        }
                        __typename
                    }
                    __typename
                }
            }
        `
	};
}
function newUserCatalogMainContentQuery(catalogId, pagingLimit = 20) {
	return {
		operationName: "UserCatalogMainContentQuery",
		variables: {
			catalogId,
			pagingOptions: { limit: pagingLimit }
		},
		query: `
            query UserCatalogMainContentQuery($catalogId: ID!, $pagingOptions: CatalogPagingOptionsInput!) {
                catalogById(catalogId: $catalogId) {
                    __typename
                    ... on Catalog {
                        name
                        itemsConnection(pagingOptions: $pagingOptions) {
                            items {
                                entity {
                                    ... on Post {
                                        mediumUrl
                                    }
                                }
                                __typename
                            }
                            __typename
                        }
                    }
                }
            }
        `
	};
}
//#endregion
//#region lib/routes/medium/parse-article.ts
async function parse(url, cookie = "") {
	const { data } = await got_default(url, { headers: { cookie } });
	const $ = load(data);
	const publishedTime = $("meta[property=\"article:published_time\"]").attr("content");
	const author = $("meta[name=\"author\"]").attr("content");
	const article = $("body article");
	article.find("header").remove();
	const title = article.find("h1").first();
	const titleText = title.text();
	title.remove();
	const subtitle = article.find(".pw-subtitle-paragraph");
	const subtitleText = subtitle.text();
	if (subtitle.length === 0) article.find(".pw-post-body-paragraph").siblings().first().remove();
	else subtitle.siblings().remove();
	return {
		title: titleText,
		subtitle: subtitleText,
		author,
		publishedTime,
		html: article.html(),
		url
	};
}
function parseArticle(ctx, url) {
	return cache_default.tryGet(`medium:article:${url}`, async () => {
		const { title, author, publishedTime, html } = await parse(url, config.medium.articleCookie);
		return {
			title,
			author,
			link: url,
			description: html,
			pubDate: publishedTime
		};
	});
}
//#endregion
export { getWebInlineTopicFeedQuery as a, getWebInlineRecommendedFeedQuery as i, getFollowingFeedQuery as n, getUserCatalogMainContentQuery as r, parseArticle as t };
