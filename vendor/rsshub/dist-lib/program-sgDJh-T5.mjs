import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/tingtingfm/utils.ts
const SALT = "1Ftjv0bfpVmqbE38";
const getClientVal = (length) => {
	let result = "";
	const randomChar = () => {
		const random = Math.floor(62 * Math.random());
		if (random < 10) return random;
		if (random < 36) return String.fromCharCode(random + 55);
		return String.fromCharCode(random + 61);
	};
	while (result.length < length) result += randomChar();
	return `h5_${result}`;
};
const sign = (params) => {
	const searchParams = new URLSearchParams(params);
	searchParams.sort();
	return md5(`${searchParams.toString()}_${SALT}`);
};
//#endregion
//#region lib/routes/tingtingfm/program.tsx
const renderAudio = (url) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: url ? /* @__PURE__ */ jsx("audio", {
	controls: true,
	children: /* @__PURE__ */ jsx("source", { src: url })
}) : null }));
const route = {
	path: "/program/:programId",
	categories: ["multimedia"],
	view: 4,
	example: "/tingtingfm/program/M7VJv6Jj4R",
	parameters: { programId: "节目 ID，可以在 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	radar: [{ source: ["mobile.tingtingfm.com/v3/program/:programId"] }],
	name: "节目",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const programId = ctx.req.param("programId");
	const apiBaseUrl = "https://api-v3.tingtingfm.com";
	const mobileBaseUrl = "https://mobile.tingtingfm.com";
	const params = {
		version: "h5_5.16",
		client: getClientVal(30),
		h_program_id: programId
	};
	const radioInfo = await cache_default.tryGet(`tingtingfm:program:${programId}`, async () => {
		const { data: response } = await got_default.post(`${apiBaseUrl}//broadcast/get_program_v3_8`, { searchParams: {
			...params,
			api_sign: sign(params)
		} });
		if (response.errno !== 0) throw new Error(response.error);
		return response.data.info;
	});
	const latestAudio = await cache_default.tryGet(`tingtingfm:audio_list:${programId}`, async () => {
		const { data: response } = await got_default.post(`${apiBaseUrl}//broadcast/get_program_audio_list`, { searchParams: {
			...params,
			api_sign: sign(params)
		} });
		if (response.errno !== 0) throw new Error(response.error);
		return response.data[0];
	}, config.cache.routeExpire, false);
	const { radioCover, list } = await cache_default.tryGet(`tingtingfm:play_audio:${programId}`, async () => {
		const playAudioParams = {
			...Object.fromEntries(Object.entries(params).filter(([key]) => key !== "h_program_id")),
			type: "",
			sort: "-1",
			audio_id: latestAudio.h_audio_id
		};
		const { data: response } = await got_default.post(`${apiBaseUrl}//albumaudio/play_audio`, { searchParams: {
			...playAudioParams,
			api_sign: sign(playAudioParams)
		} });
		if (response.errno !== 0) throw new Error(response.error);
		return {
			radioCover: response.data.info.radio_cover,
			list: response.data.list
		};
	}, config.cache.routeExpire, false);
	const items = list.map((audio) => ({
		title: audio.title,
		link: `${mobileBaseUrl}/v3/vod/2/${audio.h_audio_id}`,
		description: renderAudio(audio.play_url),
		pubDate: parseDate(audio.add_time, "X"),
		itunes_item_image: radioCover,
		itunes_duration: audio.duration,
		enclosure_url: audio.play_url,
		enclosure_type: "audio/x-m4a"
	}));
	return {
		title: `${radioInfo.title} - ${radioInfo.belong_radio}${radioInfo.belong_fm}`,
		description: radioInfo.description,
		link: `${mobileBaseUrl}/v3/program/${programId}`,
		image: radioInfo.cover.split("?x-oss", 1)[0],
		itunes_author: radioInfo.anchor.join(", "),
		itunes_category: radioInfo.category,
		itunes_explicit: false,
		item: items
	};
}
//#endregion
export { route };
