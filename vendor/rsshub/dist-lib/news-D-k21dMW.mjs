import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import * as cheerio from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/espn/news.tsx
const renderMedia = (media) => {
	const video = {
		cover: media.posterImages?.full?.href || media.posterImages?.default?.href,
		src: media.links?.source.mezzanine?.href || media.links?.source.HD?.href || media.links?.source.full?.href || media.links?.source.href,
		title: media.title,
		description: media.description
	};
	const image = {
		src: media.url,
		alt: media.alt,
		caption: media.caption,
		credit: media.credit
	};
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [video.src ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("video", {
		controls: true,
		preload: "metadata",
		width: "100%",
		height: "auto",
		cover: video.cover,
		children: /* @__PURE__ */ jsx("source", {
			src: video.src,
			type: "video/mp4"
		})
	}), video.title || video.description ? /* @__PURE__ */ jsxs("div", { children: [video.title ? /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("b", { children: video.title }) }) : null, video.description ? /* @__PURE__ */ jsx("p", { children: video.description }) : null] }) : null] }) : null, image.src ? /* @__PURE__ */ jsxs("figure", { children: [
		image.alt ? /* @__PURE__ */ jsx("img", {
			src: image.src,
			alt: image.alt
		}) : /* @__PURE__ */ jsx("img", { src: image.src }),
		image.caption ? /* @__PURE__ */ jsx("figcaption", { children: image.caption }) : null,
		image.credit ? /* @__PURE__ */ jsx("cite", { children: image.credit }) : null
	] }) : null] }));
};
const junkPattern = /inline\d+|alsosee/;
const mediaPattern = /(photo|video)(\d+)/;
const route = {
	path: "/news/:sport",
	name: "News",
	maintainers: ["weijianduan0302"],
	example: "/espn/news/nba",
	categories: ["traditional-media"],
	parameters: { sport: "sport category, can be nba, nfl, mlb, nhl etc." },
	description: `Get the news feed of the sport you love on ESPN.

| Sport                 | sport | Sport      | sport   |
| --------------------- | ----- | ---------- | ------- |
| 🏀 NBA                | nba   | 🎾 Tennis  | tennis  |
| 🏀 WNBA               | wnba  | ⛳️ Golf    | golf    |
| 🏈 NFL                | nfl   | 🏏 Cricket | cricket |
| ⚾️ MLB                | mlb   | ⚽️ Soccer  | soccer  |
| 🏒 NHL                | nhl   | 🏎️ F1      | f1      |
| ⛹️ College Basketball | ncb   | 🥊 MMA     | mma     |
| 🏟️️ College Football   | ncf   | 🏈 UFL     | ufl     |
| 🏉 Rugby              | rugby | 🃏 Poker   | poker   |`,
	radar: [{
		source: ["espn.com/:sport*"],
		target: "/news/:sport"
	}],
	handler: async (ctx) => {
		const { sport = "nba" } = ctx.req.param();
		const response = await rofetch(`https://onefeed.fan.api.espn.com/apis/v3/cached/contentEngine/oneFeed/leagues/${sport}?offset=0`, { headers: { accept: "application/json" } });
		const handledTypes = /* @__PURE__ */ new Set([
			"HeadlineNews",
			"Story",
			"Media",
			"Shortstop"
		]);
		const list = response.feed.filter((item) => handledTypes.has(item.data.now[0].type)).map((item) => {
			const itemDetail = item.data.now[0];
			const itemType = itemDetail.type;
			return {
				title: itemDetail.headline,
				link: itemDetail.links.web.href,
				author: itemDetail.byline,
				pubDate: item.date,
				description: itemType === "Media" ? renderMedia(itemDetail.video[0]) : itemType === "Shortstop" ? itemDetail.headline : ""
			};
		});
		const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			if (item.description === "") {
				const article = await rofetch(`${item.link}?xhr=1`, { headers: { accept: "application/json" } });
				const $ = cheerio.load(article.content.story, null, false);
				$("*").each((_, ele) => {
					if (junkPattern.test(ele.name)) $(ele).remove();
					if (mediaPattern.test(ele.name)) {
						const mediaType = ele.name.match(mediaPattern)[1] === "photo" ? "images" : "video";
						const mediaIndex = Number.parseInt(ele.name.match(mediaPattern)[2]) - 1;
						const media = article.content[mediaType][mediaIndex];
						if (media) $(ele).replaceWith(renderMedia(media));
						else $(ele).remove();
					}
				});
				item.description = $.html();
			}
			return item;
		})));
		return {
			title: `ESPN ${sport.toUpperCase()} News`,
			link: `https://www.espn.com/espn/rss/${sport}/news`,
			item: items
		};
	}
};
//#endregion
export { route };
