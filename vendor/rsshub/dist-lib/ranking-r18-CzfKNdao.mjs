import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as renderDescription } from "./description-D8tUoFfX.mjs";
import { NarouNovelFetch, R18Site, SearchBuilderR18 } from "narou";
//#region lib/routes/syosetu/types/ranking-r18.ts
let SyosetuSub = /* @__PURE__ */ function(SyosetuSub) {
	SyosetuSub["NOCTURNE"] = "noc";
	SyosetuSub["MOONLIGHT"] = "mnlt";
	SyosetuSub["MIDNIGHT"] = "mid";
	SyosetuSub["MOONLIGHT_BL"] = "mnlt-bl";
	return SyosetuSub;
}({});
let RankingPeriod = /* @__PURE__ */ function(RankingPeriod) {
	RankingPeriod["DAILY"] = "daily";
	RankingPeriod["WEEKLY"] = "weekly";
	RankingPeriod["MONTHLY"] = "monthly";
	RankingPeriod["QUARTER"] = "quarter";
	RankingPeriod["YEARLY"] = "yearly";
	return RankingPeriod;
}({});
let NovelType$1 = /* @__PURE__ */ function(NovelType) {
	NovelType["TOTAL"] = "total";
	NovelType["SHORT"] = "t";
	NovelType["ONGOING"] = "r";
	NovelType["COMPLETE"] = "er";
	return NovelType;
}({});
const syosetuSubToNocgenre = {
	["noc"]: R18Site.Nocturne,
	["mnlt"]: R18Site.MoonLight,
	["mnlt-bl"]: R18Site.MoonLightBL,
	["mid"]: R18Site.Midnight
};
const syosetuSubToJapanese = {
	["noc"]: "ノクターン",
	["mnlt"]: "ムーンライト",
	["mnlt-bl"]: "ムーンライト BL",
	["mid"]: "ミッドナイト"
};
const periodToOrder = {
	["daily"]: "dailypoint",
	["weekly"]: "weeklypoint",
	["monthly"]: "monthlypoint",
	["quarter"]: "quarterpoint",
	["yearly"]: "yearlypoint"
};
const periodToJapanese = {
	["daily"]: "日間",
	["weekly"]: "週間",
	["monthly"]: "月間",
	["quarter"]: "四半期",
	["yearly"]: "年間"
};
const novelTypeToJapanese = {
	["total"]: "総合",
	["t"]: "短編",
	["r"]: "連載中",
	["er"]: "完結済"
};
//#endregion
//#region lib/routes/syosetu/ranking-r18.ts
/**
* Implementation of "Syosetu" R18 Rankings
*
* While "Syosetu" only provides ranking API for "Syosetu o yomou" (general audience),
* equivalent ranking functionality can be achieved using the point-based sorting in the search API.
*
* This implementation utilizes the 'order' parameter (e.g., dailypoint, weeklypoint)
* of the search API to replicate ranking functionality across all Syosetu subsidiary sites.
*/
const getParameters = () => {
	const subOptions = Object.values(SyosetuSub).map((value) => ({
		value,
		label: syosetuSubToJapanese[value]
	}));
	const periodOptions = Object.entries(RankingPeriod).map(([key, value]) => ({
		value,
		label: `${periodToJapanese[value]} (${key})`
	}));
	const novelTypeOptions = Object.entries(NovelType$1).map(([key, value]) => ({
		value,
		label: `${novelTypeToJapanese[value]} (${key})`
	}));
	return {
		sub: {
			description: "Target site for R18 rankings",
			options: subOptions
		},
		type: {
			description: "Detailed ranking type (format: period_noveltype)",
			options: periodOptions.flatMap((period) => novelTypeOptions.map((type) => ({
				value: `${period.value}_${type.value}`,
				label: `${period.label} ${type.label}`
			})))
		}
	};
};
const getBest5RadarItems = () => Object.values(SyosetuSub).flatMap((domain) => Object.values(RankingPeriod).map((period) => ({
	title: `${syosetuSubToJapanese[domain]} ${periodToJapanese[period]}ランキング BEST5`,
	source: [`${domain === "mnlt-bl" ? "mnlt" : domain}.syosetu.com/rank/${domain === "mnlt-bl" ? "bltop" : "top"}`],
	target: `/rankingr18/${domain}/${period}_total?limit=5`
})));
const route = {
	path: "/rankingr18/:sub/:type",
	categories: ["reading"],
	example: "/syosetu/rankingr18/noc/daily_total?limit=50",
	parameters: getParameters(),
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "R18 Rankings",
	url: "syosetu.com/site/group",
	maintainers: ["SnowAgar25"],
	handler,
	description: `| Period  | Description       | 説明             |
| ------- | ----------------- | ---------------- |
| daily   | Daily Ranking     | 日間ランキング   |
| weekly  | Weekly Ranking    | 週間ランキング   |
| monthly | Monthly Ranking   | 月間ランキング   |
| quarter | Quarterly Ranking | 四半期ランキング |
| yearly  | Yearly Ranking    | 年間ランキング   |

| Novel Type | Description      | 説明   |
| ---------- | ---------------- | ------ |
| total      | All Works        | 総合   |
| t          | Short Stories    | 短編   |
| r          | Ongoing Series   | 連載中 |
| er         | Completed Series | 完結済 |

::: tip
Combine Period and Novel Type with \`_\`.
For example: \`daily_total\`, \`weekly_r\`, \`monthly_er\`
:::`,
	radar: [
		{
			source: ["noc.syosetu.com/rank/list/type/:type"],
			target: "/rankingr18/noc/:type"
		},
		{
			source: ["mid.syosetu.com/rank/list/type/:type"],
			target: "/rankingr18/mid/:type"
		},
		{
			source: ["mnlt.syosetu.com/rank/list/type/:type"],
			target: "/rankingr18/mnlt/:type"
		},
		{
			source: ["mnlt.syosetu.com/rank/bllist/type/:type"],
			target: "/rankingr18/mnlt-bl/:type"
		},
		...getBest5RadarItems()
	]
};
function parseRankingType(type) {
	const [periodStr, novelTypeStr] = type.split("_");
	const period = periodStr;
	const novelType = novelTypeStr;
	if (![Object.values(RankingPeriod).includes(period), Object.values(NovelType$1).includes(novelType)].every(Boolean)) throw new InvalidParameterError(`Invalid ranking type: ${type}`);
	return {
		period: periodStr,
		novelType: novelTypeStr
	};
}
function getRankingTitle(type, limit) {
	const { period, novelType } = parseRankingType(type);
	return `${periodToJapanese[period]}${novelTypeToJapanese[novelType]}ランキング BEST${limit}`;
}
async function handler(ctx) {
	const { sub, type } = ctx.req.param();
	const rankingUrl = `${`https://${sub === "mnlt-bl" ? "mnlt" : sub}.syosetu.com`}/rank/list/type/${type}`;
	const api = new NarouNovelFetch();
	const limit = Math.min(Number(ctx.req.query("limit") ?? 300), 300);
	const { period, novelType } = parseRankingType(type);
	const searchParams = {
		gzip: 5,
		lim: limit,
		order: periodToOrder[period]
	};
	if (novelType !== "total") searchParams.type = novelType;
	if (!Object.hasOwn(syosetuSubToNocgenre, sub)) throw new InvalidParameterError(`Invalid subsite: ${sub}`);
	const nocgenre = syosetuSubToNocgenre[sub];
	const items = (await new SearchBuilderR18(searchParams, api).r18Site(nocgenre).execute()).values.map((novel, index) => ({
		title: `#${index + 1} ${novel.title}`,
		link: `https://novel18.syosetu.com/${String(novel.ncode).toLowerCase()}`,
		description: renderDescription({ novel }),
		author: novel.writer,
		category: novel.keyword.split(/[\s/\u{FF0F}]/u).filter(Boolean)
	}));
	return {
		title: `小説家になろう (${sub}) - ${getRankingTitle(type, limit)}`,
		link: rankingUrl,
		item: items,
		language: "ja"
	};
}
//#endregion
export { route };
