import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/fcbayern/news-cn.ts
const cnNewsHander = async (limit) => {
	return {
		title: "拜仁慕尼黑俱乐部中文官方网站 - 新闻",
		link: "https://www.fcbayern.cn/news",
		item: (await rofetch("https://www.fcbayern.cn/api2018/news/list", {
			method: "POST",
			headers: {
				accept: "application/json",
				"content-type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				page: "1",
				pageSize: String(limit),
				totalPage: "1",
				tagId: "",
				year: "-1",
				month: "-1",
				type: "1"
			})
		})).data.map((item) => ({
			title: item.title,
			link: item.url,
			pubDate: timezone(parseDate(item.time), 8),
			image: item.pic?.split("?", 1)[0]
		}))
	};
};
//#endregion
//#region lib/routes/fcbayern/news.ts
const languages = {
	en: "fcbayern.com-en-gb",
	es: "fcbayern.com-es-es",
	de: "fcbayern.com-de-de"
};
const query = `
    query Web_NewsSearch($channelId: String!, $query: String!, $filterTags: [String!], $filterSections: [String!], $filterTypes: [String!], $count: Int!, $offset: Int, $excludeHeroStageResultFromPageId: String) {
        newsSearch(
            channelId: $channelId
            query: $query
            filterTags: $filterTags
            filterSections: $filterSections
            filterTypes: $filterTypes
            count: $count
            offset: $offset
            excludeHeroStageResultFromPageId: $excludeHeroStageResultFromPageId
        ) {
            total
            offset
            count
            results {
                ...Teaser
                __typename
            }
            __typename
        }
    }
    fragment Teaser on Teaser {
        __typename
        id
        pageType
        teaserTitle
        teaserShortTitle
        teaserSubtitle
        teaserText
        tag
        publicationDate
        teaserImage {
            ...ImageFragment
            __typename
        }
        teaserLink {
            ...Link
            __typename
        }
        teamEmblems {
            ...TeamEmblems
            __typename
        }
        teaserAppendix {
            ... on GalleryTeaserAppendix {
                galleryImages {
                    ...ImageFragment
                    __typename
                }
                __typename
            }
            ... on VideoTeaserAppendix {
                documentId
                kalturaId
                __typename
            }
            __typename
        }
        markers
        adMarker
        channelId
    }
    fragment Link on Link {
        __typename
        newTabOrWindow
        title
        target {
            ... on ExternalLink {
                url
                __typename
            }
            ... on InternalLink {
                id
                path
                channelId
                channelPath
                differentChannelDomain
                locale
                pageType
                __typename
            }
            __typename
        }
    }
    fragment ImageFragment on ImageFragment {
        __typename
        url
        alt
        caption
        copyright
        origWidth
        origHeight
        aspectRatioImageOverrides {
            ...AspectRatioImageOverride
            __typename
        }
    }
    fragment AspectRatioImageOverride on AspectRatioImageOverride {
        aspectRatio
        url
        __typename
    }
    fragment TeamEmblems on TeamEmblems {
        ownTeam
        emblem {
            ...ImageFragment
            __typename
        }
        __typename
    }
`;
const route = {
	path: "/news/:language?",
	categories: ["sport"],
	example: "/fcbayern/news",
	parameters: { language: {
		description: "Language",
		options: [
			{
				value: "en",
				label: "English"
			},
			{
				value: "es",
				label: "Español"
			},
			{
				value: "de",
				label: "Deutsch"
			},
			{
				value: "zh",
				label: "中文"
			}
		],
		default: "en"
	} },
	radar: [{
		source: ["fcbayern.com/:language/news", "fcbayern.com/:language"],
		target: "/news/:language"
	}, {
		source: ["www.fcbayern.cn/news", "www.fcbayern.cn"],
		target: "/news/zh"
	}],
	name: "News",
	maintainers: ["TonyRL"],
	handler,
	url: "fcbayern.com"
};
async function handler(ctx) {
	const { language = "en" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20;
	if (language === "zh") return cnNewsHander(limit);
	const baseUrl = "https://fcbayern.com";
	const channelId = languages[language] ?? languages.en;
	const items = (await rofetch(`${baseUrl}/graphql`, {
		method: "POST",
		query: { client: "fcbwebsite" },
		body: {
			operationName: "Web_NewsSearch",
			variables: {
				query: "",
				filterTags: [
					"tag_club",
					"tag_team_women",
					"tag_team_campus",
					"tag_article_news",
					"tag_competitions_bundesliga",
					"tag_competitions_champions-league",
					"tag_column_saebener-stories",
					"tag_club_magazin-51"
				],
				offset: 0,
				count: limit,
				channelId,
				filterSections: [
					"section_professionals",
					"section_club",
					"section_women",
					"section_campus",
					"section_aroundtheworld"
				],
				filterTypes: [
					"fcbhippo:ArticleDocument",
					"fcbhippo:ImageGalleryDocument",
					"fcbhippo:TeaserDocument"
				]
			},
			query
		}
	})).data.newsSearch.results.map((item) => ({
		title: item.teaserTitle,
		description: item.teaserText,
		link: `${baseUrl}${item.teaserLink.target.path}`,
		pubDate: item.publicationDate ? parseDate(item.publicationDate) : void 0,
		image: item.teaserImage?.url,
		category: item.tag ? [item.tag] : void 0
	}));
	return {
		title: "FC Bayern München - News",
		link: `${baseUrl}/${language}/news`,
		language,
		image: `${baseUrl}/favicon.ico`,
		item: items
	};
}
//#endregion
export { route };
