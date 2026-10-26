import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
const route = {
	path: "/latest-ranked/:routeParams?",
	categories: ["game"],
	example: "/osu/latest-ranked/includeMode=osu&difficultyLimit=L3&difficultyLimit=U7",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		supportRadar: true
	},
	parameters: { routeParams: {
		description: "Used to pass route parameters in Query String format. Check out route description for more info.",
		default: "null"
	} },
	name: "Latest Ranked Beatmap",
	description: `
Subscribe to the new beatmaps on https://osu.ppy.sh/beatmapsets.

#### Parameter Description

Parameters allows you to:

- Filter game mode
- Limit beatmap difficulty
- Show/hide game mode in feed title

Below is a table of all allowed parameters passed to \`routeParams\`


| Name              | Default  | Description                                                                                                                                                                                                                                          |
| ----------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \`includeMode\`     | All mode | Could be \`osu\`, \`mania\`, \`fruits\` or \`taiko\`. Specify included game mode of beatmaps. Including this paramseter multiple times to specify multiple game modes, e.g.: \`includeMode=osu&includeMode=mania\`. Subscribe to all game modes if not specified |
| \`difficultyLimit\` | None     | Lower/upper limit of star rating of the beatmaps in the beatmapset item, e.g.:\`difficultyLimit=U6\`. Checkout tips in descriptions for detailed explaination and examples.                                                                            |
| \`modeInTitle\`     | \`true\`   | \`true\` or \`false\` Add mode info into feed title.


This actual parameters should be passed as \`routeParams\` in URL Query String format without \`?\`, e.g.:

    /osu/latest-ranked/modeInTitle=true&includeMode=osu

::: tip
You could make use of \`difficultyLimit\` paramters to create a "high difficulty/low difficulty only" only feed.

For example, if you only wants to play low star rating beatmap like 1 or 2 star, you could subscribe to:

    /osu/latest-ranked/difficultyLimit=U2

This will filter out all beatmapsets that do not provide at least one beatmap with star rating<=\`2.00\`.

Similarly, you could use lower bound to filter out beatmapsets which don't have at least one beatmap
with star rating higher than a certain threshold.

    /osu/latest-ranked/difficultyLimit=L6

Now all beatmapsets that don't provided at least one beatmap with star rating higher than \`6.00\` will be filtered.
:::`,
	maintainers: ["nfnfgo"],
	radar: [{ source: ["osu.ppy.sh/beatmapsets"] }],
	handler
};
async function handler(ctx) {
	const pathParams = ctx.req.param("routeParams");
	const searchParams = new URL(`https://osu.ppy.sh?${pathParams}`).searchParams;
	const includeModes = searchParams.getAll("includeMode");
	const difficultyLimits = searchParams.getAll("difficultyLimit");
	const modeInTitle = searchParams.get("modeInTitle") ?? "true";
	let beatmapsetList = await cache_default.tryGet("https://osu.ppy.sh/beatmapsets:JSON", async () => {
		const $ = load((await got_default.get("https://osu.ppy.sh/beatmapsets")).data);
		const beatmapList = JSON.parse($("#json-beatmaps").text() ?? "{\"beatmapsets\": undefined}").beatmapsets;
		if (beatmapList === void 0) throw new Error("Failed to retrieve JSON beatmap info from osu! website");
		return beatmapList;
	}, config.cache.routeExpire, false);
	for (const item of beatmapsetList) item.beatmaps.sort((a, b) => a.difficulty_rating - b.difficulty_rating);
	if (includeModes?.length && includeModes?.length > 0) beatmapsetList = beatmapsetList.filter((bm) => includeModes.includes(bm.beatmaps[0].mode));
	let upperLimit = 99;
	let lowerLimit = 0;
	if (difficultyLimits && difficultyLimits.length > 0 && difficultyLimits.length < 2) {
		for (const dfLimit of difficultyLimits) if (dfLimit.startsWith("U")) upperLimit = Number(dfLimit.slice(1));
		else if (dfLimit.startsWith("L")) lowerLimit = Number(dfLimit.slice(1));
		const difficultyRateFilterFunc = (item) => {
			if (item.beatmaps.at(0).difficulty_rating > upperLimit) return false;
			return item.beatmaps.at(-1).difficulty_rating >= lowerLimit;
		};
		beatmapsetList = beatmapsetList.filter((item) => difficultyRateFilterFunc(item));
	}
	function getReadableFeedConfig() {
		if (!pathParams) return "";
		let readableConf = "Feed Configurations:\n";
		readableConf += `Game Mode: ${includeModes.length > 0 ? JSON.stringify(includeModes) : "All modes"}\n`;
		readableConf += `Star Rating Limit: Lower=${lowerLimit}, Upper=${upperLimit}`;
		return readableConf;
	}
	const rssItems = beatmapsetList.map((beatmapset) => {
		const pubDate = parseDate(beatmapset.ranked_date);
		const coverImage = beatmapset.covers["cover@2x"] || beatmapset.covers.cover;
		const bannerImage = beatmapset.covers["card@2x"] || beatmapset.covers.card;
		const readableTotalLength = `${Math.floor(beatmapset.beatmaps[0].total_length / 60).toString().padStart(2, "0")}:${(beatmapset.beatmaps[0].total_length % 60).toString().padStart(2, "0")}`;
		const modeLiteralToDisplayNameMap = {
			osu: "Osu!",
			fruits: "Osu!Catch",
			taiko: "Osu!Taiko",
			mania: "Osu!Mania"
		};
		const description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx("img", {
				src: beatmapset.covers["cover@2x"] || beatmapset.covers.cover,
				alt: beatmapset.title,
				style: "max-width: 100%; height: auto;"
			}),
			/* @__PURE__ */ jsx("h3", { children: "Song Info" }),
			/* @__PURE__ */ jsxs("ul", { children: [
				/* @__PURE__ */ jsxs("li", { children: [
					/* @__PURE__ */ jsx("strong", { children: "English Title:" }),
					" ",
					beatmapset.title
				] }),
				/* @__PURE__ */ jsxs("li", { children: [
					/* @__PURE__ */ jsx("strong", { children: "Artist:" }),
					" ",
					`${beatmapset.artist_unicode} (${beatmapset.artist})`
				] }),
				/* @__PURE__ */ jsxs("li", { children: [
					/* @__PURE__ */ jsx("strong", { children: "Length:" }),
					" ",
					readableTotalLength
				] }),
				/* @__PURE__ */ jsxs("li", { children: [
					/* @__PURE__ */ jsx("strong", { children: "BPM:" }),
					" ",
					beatmapset.bpm
				] })
			] }),
			/* @__PURE__ */ jsx("h3", { children: "Beatmapset Info" }),
			/* @__PURE__ */ jsxs("ul", { children: [/* @__PURE__ */ jsxs("li", { children: [
				/* @__PURE__ */ jsx("strong", { children: "Mode:" }),
				" ",
				modeLiteralToDisplayNameMap[beatmapset.beatmaps[0].mode]
			] }), /* @__PURE__ */ jsxs("li", { children: [
				/* @__PURE__ */ jsx("strong", { children: "Creator:" }),
				" ",
				beatmapset.creator
			] })] }),
			/* @__PURE__ */ jsx("h3", { children: "Difficulties" }),
			/* @__PURE__ */ jsxs("table", {
				border: "1",
				children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("th", { children: "Version" }),
					/* @__PURE__ */ jsx("th", { children: "Rating" }),
					/* @__PURE__ */ jsx("th", { children: "AR" }),
					/* @__PURE__ */ jsx("th", { children: "Drain" })
				] }) }), /* @__PURE__ */ jsx("tbody", { children: beatmapset.beatmaps.map((beatmap) => /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
						href: beatmap.url,
						target: "_blank",
						children: beatmap.version
					}) }),
					/* @__PURE__ */ jsx("td", { children: beatmap.difficulty_rating.toFixed(2) }),
					/* @__PURE__ */ jsx("td", { children: beatmap.ar.toFixed(1) }),
					/* @__PURE__ */ jsx("td", { children: beatmap.drain })
				] })) })]
			})
		] }));
		return {
			title: `${modeInTitle === "true" ? `[${modeLiteralToDisplayNameMap[beatmapset.beatmaps[0].mode]}] ` : ""}${beatmapset.title_unicode ?? beatmapset.title}`,
			description,
			pubDate,
			link: `https://osu.ppy.sh/beatmapsets/${beatmapset.id}`,
			category: ["osu!", "game"],
			author: [{ name: beatmapset.creator }],
			image: coverImage,
			banner: bannerImage,
			updated: beatmapset.last_updated
		};
	});
	return {
		title: "Osu! Latest Ranked Map",
		link: "https://osu.ppy.sh/beatmapsets",
		description: `Newly ranked beatmaps at https://osu.ppy.sh/beatmapsets.\n${getReadableFeedConfig()}`,
		item: rssItems
	};
}
//#endregion
export { route };
