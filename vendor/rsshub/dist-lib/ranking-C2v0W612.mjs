import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as renderDescription } from "./description-D8tUoFfX.mjs";
import { BigGenre, Genre, GenreNotation, NarouNovelFetch, SearchBuilder } from "narou";
//#region lib/routes/syosetu/types/ranking.ts
let RankingPeriod = /* @__PURE__ */ function(RankingPeriod) {
	RankingPeriod["DAILY"] = "daily";
	RankingPeriod["WEEKLY"] = "weekly";
	RankingPeriod["MONTHLY"] = "monthly";
	RankingPeriod["QUARTER"] = "quarter";
	RankingPeriod["YEARLY"] = "yearly";
	RankingPeriod["TOTAL"] = "total";
	return RankingPeriod;
}({});
let NovelType$1 = /* @__PURE__ */ function(NovelType) {
	NovelType["TOTAL"] = "total";
	NovelType["SHORT"] = "t";
	NovelType["ONGOING"] = "r";
	NovelType["COMPLETE"] = "er";
	return NovelType;
}({});
const periodToOrder = {
	["daily"]: "dailypoint",
	["weekly"]: "weeklypoint",
	["monthly"]: "monthlypoint",
	["quarter"]: "quarterpoint",
	["yearly"]: "yearlypoint",
	["total"]: "hyoka"
};
const periodToPointField = {
	["daily"]: "pt",
	["weekly"]: "weekly_point",
	["monthly"]: "monthly_point",
	["quarter"]: "quarter_point",
	["yearly"]: "yearly_point",
	["total"]: "global_point"
};
const periodToJapanese = {
	["daily"]: "日間",
	["weekly"]: "週間",
	["monthly"]: "月間",
	["quarter"]: "四半期",
	["yearly"]: "年間",
	["total"]: "累計"
};
const novelTypeToJapanese = {
	["total"]: "すべて",
	["t"]: "短編",
	["r"]: "連載中",
	["er"]: "完結済"
};
let IsekaiCategory = /* @__PURE__ */ function(IsekaiCategory) {
	IsekaiCategory["RENAI"] = "1";
	IsekaiCategory["FANTASY"] = "2";
	IsekaiCategory["OTHER"] = "o";
	return IsekaiCategory;
}({});
const isekaiCategoryToJapanese = {
	["1"]: "〔恋愛〕",
	["2"]: "〔ファンタジー〕",
	["o"]: "〔文芸・SF・その他〕"
};
//#endregion
//#region lib/routes/syosetu/ranking-isekai.ts
function parseIsekaiRankingType(type) {
	const [periodStr, categoryStr, novelTypeStr = "total"] = type.split("_");
	const period = periodStr;
	const category = categoryStr;
	const novelType = novelTypeStr;
	if (![
		Object.values(RankingPeriod).includes(period),
		Object.values(IsekaiCategory).includes(category),
		Object.values(NovelType$1).includes(novelType)
	].every(Boolean)) throw new InvalidParameterError(`Invalid isekai ranking type: ${type}`);
	return {
		period,
		category,
		novelType
	};
}
function getIsekaiSearchParams(period, category, novelType, limit) {
	const searchParams = {
		order: periodToOrder[period],
		gzip: 5,
		lim: Math.ceil(limit / 2 * 1.2)
	};
	if (novelType !== "total") searchParams.type = novelType;
	switch (category) {
		case "1":
			searchParams.biggenre = BigGenre.Renai;
			break;
		case "2":
			searchParams.biggenre = BigGenre.Fantasy;
			break;
		case "o":
			searchParams.biggenre = `${BigGenre.Bungei}-${BigGenre.Sf}-${BigGenre.Sonota}`;
			break;
		default: throw new InvalidParameterError(`Invalid Isekai category: ${category}`);
	}
	return searchParams;
}
async function handleIsekaiRanking(type, limit) {
	const { period, category, novelType } = parseIsekaiRankingType(type);
	const rankingUrl = `https://yomou.syosetu.com/rank/isekailist/type/${type}`;
	const rankingTitle = `[${periodToJapanese[period]}] 異世界転生/転移${isekaiCategoryToJapanese[category]}ランキング - ${novelTypeToJapanese[novelType]} BEST${limit}`;
	const searchParams = getIsekaiSearchParams(period, category, novelType, limit);
	const api = new NarouNovelFetch();
	const [tenseiResult, tenniResult] = await Promise.all([new SearchBuilder({
		...searchParams,
		istensei: 1
	}, api).execute(), new SearchBuilder({
		...searchParams,
		istenni: 1
	}, api).execute()]);
	const combinedNovels = [...tenseiResult.values, ...tenniResult.values];
	const uniqueNovels = new Map(combinedNovels.map((novel) => [novel.ncode, novel])).values().toArray();
	const pointField = periodToPointField[period];
	if (!pointField) throw new InvalidParameterError(`Invalid period: ${period}`);
	const items = uniqueNovels.toSorted((a, b) => (b[pointField] || 0) - (a[pointField] || 0)).map((novel, index) => ({
		title: `#${index + 1} ${novel.title}`,
		link: `https://ncode.syosetu.com/${String(novel.ncode).toLowerCase()}`,
		description: renderDescription({ novel }),
		author: novel.writer,
		category: novel.keyword.split(/[\s/\u{FF0F}]/u).filter(Boolean)
	}));
	return {
		title: `小説家になろう - ${rankingTitle}`,
		link: rankingUrl,
		item: items.slice(0, limit),
		language: "ja"
	};
}
//#endregion
//#region lib/routes/syosetu/ranking.ts
const getParameters = () => {
	const rankingTypeOptions = [
		{
			value: "list",
			label: "総合ランキング (General Ranking)"
		},
		{
			value: "genre",
			label: "ジャンル別ランキング (Genre Ranking)"
		},
		{
			value: "isekai",
			label: "異世界転生/転移ランキング (Isekai Ranking)"
		}
	];
	const periodOptions = Object.entries(RankingPeriod).map(([key, value]) => ({
		value,
		label: `${periodToJapanese[value]} (${key})`
	}));
	const novelTypeOptions = Object.entries(NovelType$1).map(([key, value]) => ({
		value,
		label: `${novelTypeToJapanese[value]} (${key})`
	}));
	const genreOptions = Object.entries(Genre).filter(([, value]) => typeof value === "number").map(([key, value]) => ({
		value: value.toString(),
		label: key
	}));
	const isekaiOptions = Object.entries(IsekaiCategory).map(([key, value]) => ({
		value,
		label: `${isekaiCategoryToJapanese[value]} (${key})`
	}));
	return {
		listType: {
			description: "Ranking type",
			options: rankingTypeOptions
		},
		type: {
			description: "Detailed ranking type, can be found in Syosetu ranking URLs",
			options: [
				...periodOptions.flatMap((period) => novelTypeOptions.map((novelType) => ({
					value: `${period.value}_${novelType.value}`,
					label: `list - [${periodToJapanese[period.value]}] 総合ランキング - ${novelTypeToJapanese[novelType.value]}`
				}))),
				...periodOptions.flatMap((period) => genreOptions.flatMap((genre) => novelTypeOptions.map((novelType) => ({
					value: `${period.value}_${genre.value}_${novelType.value}`,
					label: `genre - [${periodToJapanese[period.value]}] ${GenreNotation[genre.value]}ランキング - ${novelTypeToJapanese[novelType.value]}`
				})))),
				...periodOptions.flatMap((period) => isekaiOptions.flatMap((category) => novelTypeOptions.map((novelType) => ({
					value: `${period.value}_${category.value}_${novelType.value}`,
					label: `isekai - [${periodToJapanese[period.value]}] 異世界転生/転移${isekaiCategoryToJapanese[category.value]}ランキング - ${novelTypeToJapanese[novelType.value]}`
				}))))
			]
		}
	};
};
const getBest5RadarItems = () => {
	const periodRankings = Object.values(RankingPeriod).map((period) => ({
		title: `${periodToJapanese[period]}ランキング BEST5`,
		source: ["yomou.syosetu.com/rank/top/"],
		target: `/ranking/list/${period}_total?limit=5`
	}));
	const genreRankings = Object.entries(Genre).filter(([, value]) => typeof value === "number" && value !== Genre.SonotaReplay && value !== Genre.NonGenre).map(([, value]) => ({
		title: `[${periodToJapanese.daily}] ${GenreNotation[value]}ランキング BEST5`,
		source: ["yomou.syosetu.com/rank/top/"],
		target: `/ranking/genre/daily_${value}_total?limit=5`
	}));
	const isekaiRankings = Object.values(IsekaiCategory).map((category) => ({
		title: `[${periodToJapanese.daily}] 異世界転生/転移${isekaiCategoryToJapanese[category]}ランキング BEST5`,
		source: ["yomou.syosetu.com/rank/top/"],
		target: `/ranking/isekai/daily_${category}_total?limit=5`
	}));
	return [
		...periodRankings,
		...genreRankings,
		...isekaiRankings
	];
};
const route = {
	path: "/ranking/:listType/:type",
	categories: ["reading"],
	example: "/syosetu/ranking/list/daily_total?limit=50",
	parameters: getParameters(),
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Rankings",
	url: "yomou.syosetu.com/rank/top",
	maintainers: ["SnowAgar25"],
	handler,
	description: `| Keyword | Description                           | 説明                        |
| ------- | ------------------------------------- | --------------------------- |
| list    | Overall Ranking                       | 総合ランキング              |
| genre   | Genre Ranking                         | ジャンル別ランキング        |
| isekai  | Isekai/Reincarnation/Transfer Ranking | 異世界転生 / 転移ランキング |

| Period  | Description       |
| ------- | ----------------- |
| daily   | Daily Ranking     |
| weekly  | Weekly Ranking    |
| monthly | Monthly Ranking   |
| quarter | Quarterly Ranking |
| yearly  | Yearly Ranking    |

| Type  | Description      |
| ----- | ---------------- |
| total | All Works        |
| t     | Short Stories    |
| r     | Ongoing Series   |
| er    | Completed Series |

::: warning
Please note that novel type options may vary depending on the ranking category.

ランキングの種類によって、小説タイプが異なる場合がございますのでご注意ください。
:::

::: danger 注意事項
The "注目度ランキング" (Attention Ranking) is not supported as syosetu does not provide a public API for this feature and the results cannot be replicated through the search API.

「注目度ランキング」については、API が非公開で検索 API でも同様の結果を得ることができないため、本 Route ではサポートしておりません。
:::

::: tip 異世界転生 / 転移ランキングについて (Isekai)
When multiple works have the same points, their order may differ from syosetu's ranking as syosetu randomizes the order for works with identical points.

集計の結果、同じポイントの作品が複数存在する場合、Syosetu ではランダムで順位が決定されるため、本 Route の順位と異なる場合があります。
:::`,
	radar: [
		{
			source: ["yomou.syosetu.com/rank/list/type/:type"],
			target: "/ranking/list/:type"
		},
		{
			source: ["yomou.syosetu.com/rank/genrelist/type/:type"],
			target: "/ranking/genre/:type"
		},
		{
			source: ["yomou.syosetu.com/rank/isekailist/type/:type"],
			target: "/ranking/isekai/:type"
		},
		...getBest5RadarItems()
	]
};
function parseGeneralRankingType(type) {
	const [periodStr, novelTypeStr] = type.split("_");
	const period = periodStr;
	const novelType = novelTypeStr;
	if (![Object.values(RankingPeriod).includes(period), Object.values(NovelType$1).includes(novelType)].every(Boolean)) throw new InvalidParameterError(`Invalid general ranking type: ${type}`);
	return {
		period,
		novelType
	};
}
function parseGenreRankingType(type) {
	const [periodStr, genreStr, novelTypeStr = "total"] = type.split("_");
	const period = periodStr;
	const genre = Number(genreStr);
	const novelType = novelTypeStr;
	if (![
		Object.values(RankingPeriod).includes(period),
		Object.values(Genre).includes(genre),
		Object.values(NovelType$1).includes(novelType),
		genre !== Genre.SonotaReplay,
		genre !== Genre.NonGenre
	].every(Boolean)) throw new InvalidParameterError(`Invalid genre ranking type: ${type}`);
	return {
		period,
		genre,
		novelType
	};
}
async function handler(ctx) {
	const { listType, type } = ctx.req.param();
	const rankingType = listType;
	const limit = Math.min(Number(ctx.req.query("limit") ?? 300), 300);
	const api = new NarouNovelFetch();
	const searchParams = {
		gzip: 5,
		lim: limit
	};
	let rankingUrl;
	let rankingTitle;
	switch (rankingType) {
		case "list": {
			const { period, novelType } = parseGeneralRankingType(type);
			rankingUrl = `https://yomou.syosetu.com/rank/list/type/${type}`;
			rankingTitle = `[${periodToJapanese[period]}] 総合ランキング - ${novelTypeToJapanese[novelType]} BEST${limit}`;
			searchParams.order = periodToOrder[period];
			if (novelType !== "total") searchParams.type = novelType;
			break;
		}
		case "genre": {
			const { period, genre, novelType } = parseGenreRankingType(type);
			rankingUrl = `https://yomou.syosetu.com/rank/genrelist/type/${type}`;
			rankingTitle = `[${periodToJapanese[period]}] ${GenreNotation[genre]}ランキング - ${novelTypeToJapanese[novelType]} BEST${limit}`;
			searchParams.order = periodToOrder[period];
			searchParams.genre = genre;
			if (novelType !== "total") searchParams.type = novelType;
			break;
		}
		case "isekai": return handleIsekaiRanking(type, limit);
		default: throw new InvalidParameterError(`Invalid ranking type: ${type}`);
	}
	const items = (await new SearchBuilder(searchParams, api).execute()).values.map((novel, index) => ({
		title: `#${index + 1} ${novel.title}`,
		link: `https://ncode.syosetu.com/${String(novel.ncode).toLowerCase()}`,
		description: renderDescription({ novel }),
		author: novel.writer,
		category: novel.keyword.split(/[\s/\u{FF0F}]/u).filter(Boolean)
	}));
	return {
		title: `小説家になろう - ${rankingTitle}`,
		link: rankingUrl,
		item: items,
		language: "ja"
	};
}
//#endregion
export { route };
