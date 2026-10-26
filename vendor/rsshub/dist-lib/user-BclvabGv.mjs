import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/keep/user.tsx
const route = {
	path: "/user/:id",
	categories: ["social-media"],
	example: "/keep/user/556b02c1ab59390afea671ea",
	parameters: { id: "Keep 用户 id" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gotokeep.com/users/:id"] }],
	name: "运动日记",
	maintainers: ["Dectinc", "DIYgod"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const response = await rofetch(`https://api.gotokeep.com/social/v3/people/${id}/home`, { headers: { Referer: `https://show.gotokeep.com/users/${id}` } });
	if (response.data.entries.length === 0) throw new Error("该用户运动日记为空");
	const items = response.data.entries.flatMap((entry) => entry.entries.map((item) => {
		let images = [];
		if (item.images) images = item.meta.picture ? [item.meta.picture, ...item.images] : item.images;
		else if (item.meta.picture) images = [item.meta.picture];
		const minute = Math.floor(item.meta.secondDuration / 60);
		const second = item.meta.secondDuration - minute * 60;
		return {
			title: item.meta.title.trim(),
			pubDate: item.created,
			link: `https://show.gotokeep.com/entries/${item.id}`,
			author: item.author.username,
			description: renderDescription(item, minute, second, images)
		};
	}));
	return {
		title: `${items[0].author} 的 Keep 动态`,
		link: `https://show.gotokeep.com/users/${id}`,
		language: "zh-cn",
		item: items
	};
}
const renderDescription = (item, minute, second, images) => renderToString(/* @__PURE__ */ jsx(KeepDescription, {
	item,
	minute,
	second,
	images
}));
const KeepDescription = ({ item, minute, second, images }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	"项目：",
	item.meta.name === item.meta.workoutName ? item.meta.name : `${item.meta.name} - ${item.meta.workoutName}`,
	/* @__PURE__ */ jsx("br", {}),
	"时长：",
	minute,
	"分",
	second,
	"秒",
	item.content ? /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("br", {}),
		"备注：",
		item.content
	] }) : null,
	images ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), images.map((image) => /* @__PURE__ */ jsx("img", { src: image }))] }) : null
] });
//#endregion
export { route };
