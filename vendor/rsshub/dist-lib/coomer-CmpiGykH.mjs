import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/coomer/index.tsx
const headers = { Accept: "text/css" };
const route = {
	path: "/:source?/:id?",
	categories: ["multimedia"],
	example: "/coomer",
	parameters: {
		source: "Source, see below, Posts by default",
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
		source: ["coomer.st/"],
		target: ""
	}, {
		source: ["coomer.st/:source/user/:id"],
		target: "/:source/:id"
	}],
	name: "Posts",
	maintainers: ["nczitzk", "AiraNadih"],
	handler,
	description: `Sources

| Posts | OnlyFans | Fansly | CandFans |
| ----- | -------- | ------ | -------- |
| posts | onlyfans | fansly | candfans |

::: tip
When \`posts\` is selected as the value of the parameter **source**, the parameter **id** does not take effect.
There is an optinal parameter **limit** which controls the number of posts to fetch, default value is 25.
:::`
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 25;
	const source = ctx.req.param("source") ?? "posts";
	const id = ctx.req.param("id");
	const isPosts = source === "posts";
	const rootUrl = "https://coomer.st";
	const apiUrl = `${rootUrl}/api/v1`;
	const response = await got_default({
		method: "get",
		url: isPosts ? `${apiUrl}/posts` : `${apiUrl}/${source}/user/${id}/posts`,
		headers
	});
	const responseData = isPosts ? response.data.posts : response.data;
	const author = isPosts ? "" : await getAuthor(`${apiUrl}/${source}/user/${id}`);
	const title = isPosts ? "Coomer Posts" : `Posts of ${author} from ${source} | Coomer`;
	const image = isPosts ? `${rootUrl}/favicon.ico` : `https://img.coomer.st/icons/${source}/${id}`;
	const items = responseData.filter((i) => i.content || i.attachments).slice(0, limit).map((i) => {
		i.files = [];
		if ("path" in i.file) i.files.push({
			name: i.file.name,
			path: i.file.path,
			extension: i.file.path.replace(/.*\./, "").toLowerCase()
		});
		for (const attachment of i.attachments) i.files.push({
			name: attachment.name,
			path: attachment.path,
			extension: attachment.path.replace(/.*\./, "").toLowerCase()
		});
		let $ = load(renderSource(i));
		const coomerFiles = $("img, a, audio, video").map((_, el) => $(el).prop("outerHTML"));
		let desc = "";
		if (i.content) desc += `<div>${i.content}</div>`;
		$ = load(desc);
		let count = 0;
		const regex = /downloads.fanbox.cc/;
		$("a").each((_, el) => {
			const link = $(el).attr("href");
			if (regex.test(link)) {
				count++;
				$(el).replaceWith(coomerFiles[count]);
			}
		});
		desc = (coomerFiles.length > 0 ? coomerFiles[0] : "") + $.html();
		const remainingCoomerFiles = coomerFiles.slice(count + 1);
		for (const coomerFile of remainingCoomerFiles) desc += coomerFile;
		let enclosureInfo = {};
		load(desc)("audio source, video source").each((_, el) => {
			const src = $(el).attr("src") ?? "";
			const mimeType = {
				m4a: "audio/mp4",
				mp3: "audio/mpeg",
				mp4: "video/mp4"
			}[src.replace(/.*\./, "").toLowerCase()] || null;
			if (mimeType === null) return;
			enclosureInfo = {
				enclosure_url: new URL(src, rootUrl).href,
				enclosure_type: mimeType
			};
		});
		return {
			title: i.title || parseDate(i.published),
			description: desc,
			author,
			pubDate: parseDate(i.published),
			guid: `coomer:${i.service}:${i.user}:post:${i.id}`,
			link: `${rootUrl}/${i.service}/user/${i.user}/post/${i.id}`,
			...enclosureInfo
		};
	});
	return {
		title,
		image,
		link: isPosts ? `${rootUrl}/posts` : `${rootUrl}/${source}/user/${id}`,
		item: items
	};
}
const renderSource = (item) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [item.files?.map((file, index) => {
	if ([
		"jpg",
		"png",
		"webp",
		"jpeg",
		"jfif"
	].includes(file.extension)) return /* @__PURE__ */ jsx("img", { src: file.path }, `image-${index}`);
	if ([
		"m4a",
		"mp3",
		"ogg"
	].includes(file.extension)) return /* @__PURE__ */ jsx("audio", {
		controls: true,
		children: /* @__PURE__ */ jsx("source", {
			src: file.path,
			type: `audio/${file.extention}`
		})
	}, `audio-${index}`);
	if (["mp4", "webm"].includes(file.extension)) return /* @__PURE__ */ jsx("video", {
		controls: true,
		children: /* @__PURE__ */ jsx("source", {
			src: file.path,
			type: `video/${file.extention}`
		})
	}, `video-${index}`);
	return /* @__PURE__ */ jsx("a", {
		href: file.path,
		children: file.name
	}, `file-${index}`);
}), item.embed ? /* @__PURE__ */ jsxs(Fragment, { children: [item.embed.type === "image" ? /* @__PURE__ */ jsx("img", { src: item.embed.thumbnail?.proxy_url }) : null, item.embed.type === "link" ? /* @__PURE__ */ jsxs(Fragment, { children: [
	item.embed.thumbnail ? /* @__PURE__ */ jsx("a", {
		href: item.embed.thumbnail.url,
		children: /* @__PURE__ */ jsx("img", { src: item.embed.thumbnail.proxy_url })
	}) : null,
	/* @__PURE__ */ jsx("a", {
		href: item.embed.url,
		children: item.embed.title
	}),
	item.embed.description ? /* @__PURE__ */ jsx("p", { children: item.embed.description }) : null
] }) : null] }) : null] }));
async function getAuthor(currentUrl) {
	return (await got_default({
		method: "get",
		url: `${currentUrl}/profile`,
		headers
	})).data.name;
}
//#endregion
export { route };
