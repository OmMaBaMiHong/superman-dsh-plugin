import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/meteor/templates/desc.tsx
const Media = ({ youTube, img, video }) => /* @__PURE__ */ jsx(Fragment, { children: youTube ? /* @__PURE__ */ jsx("iframe", {
	width: "560",
	height: "315",
	src: `https://www.youtube-nocookie.com/embed/${youTube}`,
	frameborder: "0",
	allowfullscreen: true,
	referrerpolicy: "strict-origin-when-cross-origin"
}) : img ? /* @__PURE__ */ jsx("img", { src: img }) : video ? /* @__PURE__ */ jsx("video", {
	src: video,
	controls: true
}) : null });
const renderMedia = (props) => renderToString(/* @__PURE__ */ jsx(Media, { ...props }));
//#endregion
//#region lib/routes/meteor/utils.ts
const baseUrl = "https://meteor.today";
const getBoards = () => cache_default.tryGet("meteor:boards", async () => {
	const { data: response } = await got_default.post(`${baseUrl}/board/get_boards`, { json: { isCollege: "false" } });
	return JSON.parse(decodeURIComponent(response.result)).map((item) => ({
		title: `${item.category ? `${item.category} - ` : ""}${item.name}`,
		description: item.id,
		feedDescription: item.description,
		category: item.articleCategory,
		link: `${baseUrl}/board/${item.alias ?? item.name}`,
		alias: item.alias,
		imgUrl: item.imageUrl,
		id: item.id
	}));
});
const renderDesc = (desc) => {
	const youTube = /(?:https?:\/\/)?(?:www\.)?youtu\.?be.*(?:v=|v\/|\/)([\w-]+)&?/g;
	const matchYouTube = desc.match(youTube);
	const matchImgur = desc.match(/https:\/\/i.imgur.com\/\w*.(jpg|png|gif|jpeg)/g);
	const matchVideo = desc.match(/(https:\/\/storage\.meteor\.today\/video\/[\da-f]{24}\.)(mp4|mov|avi|flv|wmv|mpeg|mkv)/gi);
	const matchSticker = desc.match(/assets\/images\/stickers\/(duck|ep2|ep1)\/\w*.(jpg|png|gif|jpeg)/g);
	const matchEmoji = desc.match(/assets\/images\/emoji\/\w*.(jpg|png|gif|jpeg)/g);
	if (matchYouTube) desc = desc.replaceAll(youTube, (_match, p1) => renderMedia({ youTube: p1 }));
	if (matchImgur) for (const img of matchImgur) desc = desc.replace(img, () => renderMedia({ img }));
	if (matchVideo) for (const video of matchVideo) desc = desc.replace(video, () => renderMedia({ video }));
	if (matchSticker) for (const sticker of matchSticker) desc = desc.replace(sticker, () => renderMedia({ img: sticker }));
	if (matchEmoji) for (const emoji of matchEmoji) desc = desc.replace(emoji, () => renderMedia({ img: emoji }));
	return desc.replaceAll("\n", "<br>");
};
//#endregion
export { getBoards as n, renderDesc as r, baseUrl as t };
