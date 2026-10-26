import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/curius/links.tsx
const route = {
	path: "/links/:name",
	categories: ["social-media"],
	example: "/curius/links/yuu-yuu",
	parameters: { name: "Username, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["curius.app/:name"] }],
	name: "User",
	maintainers: ["Ovler-Young"],
	handler
};
async function handler(ctx) {
	const username = ctx.req.param("name");
	const data = (await got_default(`https://curius.app/api/users/${username}`, { headers: { Referer: `https://curius.app/${username}` } })).data;
	const uid = data.user.id;
	const name = `${data.user.firstName} ${data.user.lastName}`;
	const items = (await got_default(`https://curius.app/api/users/${uid}/links?page=0`, { headers: { Referer: `https://curius.app/${username}` } })).data.userSaved.map((item) => ({
		title: item.title,
		description: renderDescription(item),
		link: item.link,
		pubDate: parseDate(item.createdDate),
		guid: `curius:${username}:${item.id}`
	}));
	return {
		title: `${name} - Curius`,
		link: `https://curius.app/${username}`,
		description: `${name} - Curius`,
		allowEmpty: true,
		item: items
	};
}
const renderDescription = (item) => {
	const fullText = item.metadata?.full_text ? item.metadata.full_text.replaceAll("\n", "<br>") : "";
	const firstComment = item.comments?.length ? item.comments[0].text.slice(0, 100) : "";
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		fullText ? /* @__PURE__ */ jsxs(Fragment, { children: [
			"原文：",
			raw(fullText),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("br", {})
		] }) : null,
		firstComment ? /* @__PURE__ */ jsxs(Fragment, { children: [
			"评论：",
			firstComment,
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("br", {})
		] }) : null,
		item.highlights?.length ? /* @__PURE__ */ jsxs(Fragment, { children: ["评论：", item.highlights.map((highlight, index) => highlight.comment ? /* @__PURE__ */ jsxs("span", { children: [
			highlight.highlight,
			/* @__PURE__ */ jsx("br", {}),
			"评论：",
			highlight.comment.text,
			/* @__PURE__ */ jsx("br", {})
		] }, `${highlight.highlight}-${index}`) : /* @__PURE__ */ jsxs("span", { children: [
			/* @__PURE__ */ jsx("br", {}),
			"标注：",
			highlight.highlight,
			/* @__PURE__ */ jsx("br", {})
		] }, `${highlight.highlight}-${index}`))] }) : null
	] }));
};
//#endregion
export { route };
