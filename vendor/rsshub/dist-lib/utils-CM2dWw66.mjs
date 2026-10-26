import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import dayjs from "dayjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/pornhub/utils.tsx
const defaultDomain = "https://www.pornhub.com";
const headers = {
	accessAgeDisclaimerPH: 1,
	hasVisited: 1
};
const renderDescription = (data, showImages = false) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [data.previewVideo ? /* @__PURE__ */ jsx("video", {
	controls: true,
	preload: "metadata",
	poster: data.poster,
	children: /* @__PURE__ */ jsx("source", {
		src: data.previewVideo,
		type: "video/webm"
	})
}) : null, showImages && (data.thumbs ? data.thumbs.map((thumb, index) => /* @__PURE__ */ jsx("img", { src: thumb.src }, `${thumb.src}-${index}`)) : /* @__PURE__ */ jsx("img", { src: data.poster }))] }));
const extractDateFromImageUrl = (imageUrl) => {
	const matchResult = imageUrl.match(/(\d{6})\/(\d{2})/);
	return matchResult ? matchResult.slice(1, 3).join("") : null;
};
const parseItems = (e, showImages = false) => ({
	title: e.find("span.title a").text().trim(),
	link: defaultDomain + e.find("span.title a").attr("href"),
	description: renderDescription({
		poster: e.find("img").data("mediumthumb"),
		previewVideo: e.find("img").data("mediabook")
	}, showImages),
	author: e.find(".usernameWrap a").text(),
	pubDate: dayjs(extractDateFromImageUrl(e.find("img").data("mediumthumb"))).toDate() || parseRelativeDate(e.find(".added").text())
});
const getRadarDomin = (path) => [{
	source: [`www.pornhub.com${path}`, `www.pornhub.com${path}/*`],
	target: path
}, ...[
	"de",
	"fr",
	"es",
	"it",
	"pt",
	"pl",
	"rt",
	"jp",
	"nl",
	"cz",
	"cn"
].map((language) => ({
	source: [`${language}.pornhub.com${path}`, `${language}.pornhub.com${path}/*`],
	target: `${path}/${language}`
}))];
//#endregion
export { renderDescription as a, parseItems as i, getRadarDomin as n, headers as r, defaultDomain as t };
