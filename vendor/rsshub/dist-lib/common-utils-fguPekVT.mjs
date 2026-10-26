import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/instagram/templates/images.tsx
const renderImages = ({ summary, images }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [summary ? /* @__PURE__ */ jsxs(Fragment, { children: [raw(summary.replaceAll("\n", "<br>")), /* @__PURE__ */ jsx("br", {})] }) : null, images.map((image) => /* @__PURE__ */ jsx("img", {
	src: image.url,
	height: image.height,
	width: image.width,
	alt: image.alt ?? void 0
}))] }));
//#endregion
//#region lib/routes/instagram/templates/video.tsx
const renderVideo = ({ summary, image, video }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [summary ? /* @__PURE__ */ jsxs(Fragment, { children: [raw(summary.replaceAll("\n", "<br>")), /* @__PURE__ */ jsx("br", {})] }) : null, /* @__PURE__ */ jsx("video", {
	controls: true,
	preload: "metadata",
	poster: image,
	width: video.width,
	children: /* @__PURE__ */ jsx("source", {
		src: video.url,
		type: "video/mp4"
	})
})] }));
//#endregion
//#region lib/routes/instagram/common-utils.ts
const renderItems = (items) => items.map((item) => {
	const productType = item.product_type;
	const summary = item.caption?.text ?? "";
	let description;
	switch (productType) {
		case "carousel_container":
			description = renderImages({
				summary,
				images: item.carousel_media.map((i) => ({
					...i.image_versions2.candidates.toSorted((a, b) => b.width - a.width)[0],
					alt: item.accessibility_caption
				}))
			});
			break;
		case "clips":
		case "igtv":
			description = renderVideo({
				summary,
				image: item.image_versions2.candidates.toSorted((a, b) => b.width - a.width)[0].url,
				video: item.video_versions[0]
			});
			break;
		case "feed":
			description = renderImages({
				summary,
				images: [{
					...item.image_versions2.candidates.toSorted((a, b) => b.width - a.width)[0],
					alt: item.accessibility_caption
				}]
			});
			break;
		default: throw new Error(`Instagram: Unhandled feed type: ${productType}`);
	}
	const url = `https://www.instagram.com/p/${item.code}/`;
	const pubDate = parseDate(item.caption?.created_at_utc || item.taken_at, "X");
	return {
		title: summary.split("\n", 1)[0],
		id: item.pk,
		pubDate,
		author: item.user.username,
		link: url,
		summary,
		description
	};
});
//#endregion
export { renderVideo as n, renderImages as r, renderItems as t };
