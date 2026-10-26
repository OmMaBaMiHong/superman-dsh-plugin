import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/mymusicsheet/usersheets.tsx
const route = {
	path: "/user/sheets/:username/:iso?/:freeOnly?",
	categories: ["shopping"],
	example: "/mymusicsheet/user/sheets/HalcyonMusic/USD/1",
	parameters: {
		username: "Username, can be found in the URL",
		iso: "ISO 4217 currency code for displaying prices, defaults to `USD`",
		freeOnly: "Only return free scores, any value to enable"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["mymusicfive.com/:username/*", "mymusicfive.com/:username"],
		target: "/user/sheets/:username"
	}],
	name: "User Sheets",
	maintainers: ["Freddd13"],
	handler,
	description: "Please refer to [Wikipedia](https://en.wikipedia.org/wiki/ISO_4217#Active_codes) for ISO 4217."
};
async function handler(ctx) {
	const baseUrl = "https://www.mymusicfive.com";
	const graphqlUrl = "https://mms.pd.mapia.io/mms/graphql";
	const exchangeRateUrl = "https://payport.pd.mapia.io/v2/currency";
	const { username, iso = "USD", freeOnly } = ctx.req.param();
	const rates = await cache_default.tryGet("mymusicfive:exchangeRate", () => rofetch(exchangeRateUrl, { query: {
		serviceProvider: "mms",
		"ngsw-bypass": true,
		"no-cache": Date.now(),
		skipHeaders: true
	} }));
	const artistInfo = (await cache_default.tryGet(`mymusicfive:artistInfo:${username}`, () => rofetch(graphqlUrl, {
		method: "POST",
		body: {
			operationName: "ArtistDetailLoadUser",
			query: `
                    query ArtistDetailLoadUser($artistUrl: String!) {
                        user(artistUrl: $artistUrl) {
                            coverUrl
                            coverImageMeta {
                                isDark
                                isLight
                                startRgba: rgba(opacity: 1)
                                endRgba: rgba(opacity: 0.24)
                            }
                            createdAt
                            instruments
                            userId
                            name
                            profileUrl
                            iamUuid
                            artistUrl
                            profileImageMeta {
                                startRgba: rgba(opacity: 1)
                                endRgba: rgba(opacity: 0.24)
                                hex
                                isDark
                            }
                            social {
                                type
                                url
                            }
                            sheetsCount
                            isArtist
                            isOfficial
                            likes
                            seoInfo {
                                title
                                description
                                keywords
                                imageUrl
                            }
                            uploadedInstrumentGroups {
                                name
                                instruments {
                                    name
                                }
                            }
                        }
                    }
                `,
			variables: { artistUrl: username }
		}
	}))).data.user;
	const items = (await rofetch(graphqlUrl, {
		method: "POST",
		body: {
			operationName: "loadArtistSheets",
			query: `
                query loadArtistSheets($data: SheetSearchInput!) {
                    sheetSearch(data: $data) {
                        list {
                            productId
                            productType
                            metaSong
                            metaMaker
                            metaMusician
                            metaMemo
                            instruments
                            createdAt
                            level
                            price
                            sheetId
                            status
                            author {
                                name
                                artistUrl
                                profileUrl
                            }
                            youtubeId
                            title
                            supportCountry
                            excludeCountries
                            __typename
                        }
                        total
                        current
                        listNum
                    }
                }
            `,
			variables: { data: {
				listNum: 10,
				paginate: "page",
				includeChord: null,
				includeLyrics: null,
				page: 1,
				level: null,
				instruments: [],
				orderBy: { createdAt: "DESC" },
				isFree: freeOnly ? true : null,
				category: null,
				artistUrl: username,
				aggregationKeywords: [
					"PACKAGE_IDS",
					"TAG_IDS",
					"INSTRUMENTS",
					"SHEET_TYPE",
					"INCLUDE_CHORD",
					"INCLUDE_LYRICS",
					"INSTRUMENTATION",
					"LEVEL",
					"CATEGORY"
				],
				aggregationKeySize: 20
			} }
		}
	})).data.sheetSearch.list.map((item) => {
		let finalPrice = "Unknown";
		const price = Number(item.price);
		if (item.price === 0) finalPrice = "Free";
		else if (!Number.isNaN(price) && Number.isFinite(price)) {
			const rate = Number(rates[iso]);
			if (rate) finalPrice = `${(price * rate).toFixed(2)} ${iso}`;
		}
		const youtubeId = item.youtubeId;
		const content = {
			musicName: item.metaSong,
			musicMemo: item.metaMemo,
			musicianName: item.metaMusician,
			instruments: item.instruments,
			status: item.status,
			price: finalPrice
		};
		return {
			title: `${item.title} | ${finalPrice}`,
			link: `${baseUrl}/${username}/${item.sheetId}`,
			guid: `https://www.mymusicsheet.com/${username}/${item.sheetId}`,
			itunes_item_image: item.author.profileUrl,
			description: renderToString(/* @__PURE__ */ jsx(MymusicSheetDescription, {
				youtubeId,
				content
			})),
			author: item.author.name,
			pubDate: parseDate(item.createdAt)
		};
	});
	return {
		title: artistInfo.seoInfo.title || `${artistInfo.name}'s Music Sheets`,
		description: artistInfo.seoInfo.description,
		image: artistInfo.profileUrl,
		link: `https://www.mymusicfive.com/${username}?viewType=sheet&orderBy=createdAt`,
		item: items
	};
}
const MymusicSheetDescription = ({ youtubeId, content }) => /* @__PURE__ */ jsxs("div", {
	class: "item-description",
	children: [
		youtubeId ? /* @__PURE__ */ jsx("iframe", {
			id: "ytplayer",
			type: "text/html",
			width: "640",
			height: "360",
			src: `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=0`,
			frameborder: "0",
			allowfullscreen: true,
			referrerpolicy: "strict-origin-when-cross-origin"
		}) : null,
		content.musicName ? /* @__PURE__ */ jsxs("p", { children: ["Music Name: ", content.musicName] }) : null,
		content.musicMemo ? /* @__PURE__ */ jsxs("p", { children: ["Music Memo: ", content.musicMemo] }) : null,
		content.musicianName ? /* @__PURE__ */ jsxs("p", { children: ["Musician Name: ", content.musicianName] }) : null,
		content.instruments && content.instruments.length ? /* @__PURE__ */ jsxs("p", { children: ["Instruments:", content.instruments.map((instrument) => ` ${instrument}`)] }) : null,
		content.status ? /* @__PURE__ */ jsxs("p", { children: ["Status: ", content.status] }) : null,
		content.price ? /* @__PURE__ */ jsxs("p", { children: ["Price: ", content.price] }) : null
	]
});
//#endregion
export { route };
