import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/pawchive/const.ts
const baseUrl = "https://pawchive.st";
const apiBaseUrl = `${baseUrl}/api/v1`;
//#endregion
//#region lib/routes/pawchive/index.tsx
const route = {
	path: "/:service/:id",
	categories: ["anime"],
	example: "/pawchive/fanbox/22445",
	parameters: {
		service: "service, either `patreon` or `fanbox`",
		id: "User id, can be found in URL"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{
		source: ["pawchive.st/"],
		target: ""
	}, {
		source: ["pawchive.st/:service/user/:id"],
		target: "/:service/:id"
	}],
	name: "Posts",
	maintainers: ["TonyRL"],
	handler
};
const processPostFiles = (post) => [post.file, ...post.attachments].map((file) => {
	if (!file.path) return null;
	return {
		name: file.name,
		path: file.path
	};
}).filter(Boolean);
const render = (post, files) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	files.length > 0 && /* @__PURE__ */ jsx("h2", { children: "Downloads / Files" }),
	files.length > 0 && /* @__PURE__ */ jsx("ul", { children: files.map((file) => {
		const extension = file.path.replace(/.*\./, "").toLowerCase();
		let element;
		if ([
			"gif",
			"jpg",
			"jpeg",
			"png",
			"webp",
			"jpeg",
			"jfif"
		].includes(extension)) element = /* @__PURE__ */ jsx("a", {
			href: `https://file.pawchive.st/data${file.path}?f=${file.name}`,
			target: "_blank",
			rel: "noopener noreferrer",
			children: /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
				src: `https://img.pawchive.st/thumbnail/data${file.path}`,
				alt: file.name
			}), /* @__PURE__ */ jsx("figcaption", { children: file.name })] })
		});
		else if ([
			"m4a",
			"mp3",
			"ogg"
		].includes(extension)) element = /* @__PURE__ */ jsx("audio", {
			controls: true,
			preload: "metadata",
			children: /* @__PURE__ */ jsx("source", {
				src: `https://file.pawchive.st/data${file.path}`,
				type: `audio/${extension}`
			})
		});
		else if (["mp4", "webm"].includes(extension)) element = /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("video", {
			controls: true,
			preload: "metadata",
			children: /* @__PURE__ */ jsx("source", {
				src: `https://file.pawchive.st/data${file.path}`,
				type: `video/${extension}`
			})
		}), /* @__PURE__ */ jsx("summary", { children: file.name })] });
		else element = /* @__PURE__ */ jsx("a", {
			href: `https://file.pawchive.st/data${file.path}`,
			children: file.name
		});
		return /* @__PURE__ */ jsx("li", {
			style: { listStyleType: "none" },
			children: element
		});
	}) }),
	post.content && /* @__PURE__ */ jsx("h2", { children: "Content" }),
	post.content && raw(post.content)
] }));
async function handler(ctx) {
	const { service, id } = ctx.req.param();
	const response = await rofetch(`${apiBaseUrl}/${service}/user/${id}`);
	if (response.length === 0) throw new Error("The user does not exist.");
	const author = await cache_default.tryGet(`pawchive:${service}:${id}`, async () => {
		return (await rofetch(`${apiBaseUrl}/${service}/user/${id}/profile`)).name || "Unknown User";
	});
	const items = response.map((post) => ({
		title: post.title || "Untitled Post",
		description: render(post, processPostFiles(post)),
		author,
		pubDate: parseDate(post.published),
		link: `${baseUrl}/${post.service}/user/${post.user}/post/${post.id}`,
		guid: `pawchive:${post.service}:${post.user}:post:${post.id}`
	}));
	return {
		title: `Posts of ${author} from ${service} | Pawchive`,
		link: `${baseUrl}/${service}/user/${id}`,
		image: `${baseUrl}/icons/${service}/${id}`,
		item: items
	};
}
//#endregion
export { route };
