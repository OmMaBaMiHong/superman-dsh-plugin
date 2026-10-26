import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/transcriptforest/templates/description.tsx
const TranscriptForestDescription = ({ audios, texts }) => /* @__PURE__ */ jsxs(Fragment, { children: [audios?.map((audio) => audio?.src ? /* @__PURE__ */ jsxs("audio", {
	controls: true,
	children: [/* @__PURE__ */ jsx("source", {
		src: audio.src,
		type: audio.type
	}), /* @__PURE__ */ jsx("object", {
		data: audio.src,
		children: /* @__PURE__ */ jsx("embed", { src: audio.src })
	})]
}) : null), texts?.map((text) => /* @__PURE__ */ jsxs(Fragment, { children: [text.startTime && text.endTime ? /* @__PURE__ */ jsxs("small", { children: [
	text.startTime,
	" - ",
	text.endTime
] }) : null, /* @__PURE__ */ jsx("p", { children: text.text })] }))] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(TranscriptForestDescription, { ...data }));
//#endregion
//#region lib/routes/transcriptforest/index.ts
const bakeTimestamp = (seconds) => {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor(seconds % 3600 / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};
const route = {
	path: "/:channel?",
	radar: [{
		source: ["www.transcriptforest.com/en/channel"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["nczitzk"],
	handler,
	url: "www.transcriptforest.com/en/channel"
};
async function handler(ctx) {
	const channel = ctx.req.param("channel");
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 10;
	const rootUrl = "https://www.transcriptforest.com";
	const { data: firstResponse } = await got_default(rootUrl);
	const data = JSON.parse(firstResponse.match(/(\{"props".*"scriptLoader":\[\]\})<\/script>/)?.[1]);
	const buildId = data.buildId;
	const defaultLocale = data.defaultLocale;
	const channels = data.props.pageProps.listChannel;
	const selected = channel ? channels.find((c) => c.channel_id === channel || c.channel_name === channel) : void 0;
	const apiUrl = new URL(`_next/data/${buildId}/en${selected ? `/channel/${selected.channel_id}` : ""}.json`, rootUrl).href;
	const currentUrl = new URL(selected ? `${defaultLocale}/channel/${selected.channel_id}` : "", rootUrl).href;
	const { data: response } = await got_default(apiUrl, { searchParams: {
		channelName: selected ? selected.channel_id : "",
		offset: 0
	} });
	let items = response.pageProps.listEpisode.data.slice(0, limit).map((item) => ({
		title: item.episode_name,
		link: new URL(`${defaultLocale}/${item.channel_id}/${item.episode_id}`, rootUrl).href,
		detailUrl: new URL(`_next/data/${buildId}/${defaultLocale}/${item.channel_id}/${item.episode_id}.json`, rootUrl).href,
		description: renderDescription({ texts: item.episode_description.split(/\n\n/).map((text) => ({ text })) }),
		author: item.channel_name,
		guid: item.id,
		pubDate: parseDate(item.published_at),
		updated: parseDate(item.updated_at),
		itunes_item_image: item.episode_cover.split(/\?/, 1)[0],
		itunes_duration: item.episode_duration,
		enclosure_url: item.source_media,
		enclosure_type: "audio/mpeg"
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.detailUrl);
		const { data: textResponse } = await got_default(detailResponse.pageProps.currentEpisode.ps4_url);
		item.description = renderDescription({ audios: [{
			src: detailResponse.pageProps.currentEpisode.media,
			type: "audio/mpeg"
		}] }) + item.description + renderDescription({ texts: textResponse.map((t) => ({
			startTime: bakeTimestamp(t.startTime),
			endTime: bakeTimestamp(t.endTime),
			text: t.readOnlyText
		})) });
		delete item.detailUrl;
		return item;
	})));
	const { data: currentResponse } = await got_default(currentUrl);
	const $ = load(currentResponse);
	const title = $("title").text();
	const image = $("meta[property=\"og:image\"]").prop("content");
	const icon = new URL($("link[rel=\"apple-touch-icon\"]").prop("href"), rootUrl).href;
	const author = title.split(/\|/, 1)[0].trim();
	return {
		item: items,
		title,
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: $("html").prop("lang"),
		image,
		icon,
		logo: icon,
		author,
		itunes_author: author,
		allowEmpty: true
	};
}
//#endregion
export { route };
