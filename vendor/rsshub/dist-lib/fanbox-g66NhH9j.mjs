import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/fanbox/utils.tsx
function getHeaders() {
	const sessionid = config.fanbox.session;
	return {
		origin: "https://fanbox.cc",
		cookie: sessionid ? `FANBOXSESSID=${sessionid}` : ""
	};
}
function embedUrlMap(urlEmbed) {
	switch (urlEmbed.type) {
		case "html": return urlEmbed.html;
		case "fanbox.post": return renderToString(/* @__PURE__ */ jsxs("a", {
			href: `https://${urlEmbed.postInfo.creatorId}.fanbox.cc/posts/${urlEmbed.postInfo.id}`,
			children: [
				/* @__PURE__ */ jsx("h1", { children: urlEmbed.postInfo.title }),
				/* @__PURE__ */ jsx("span", {
					style: "margin-right:1.6em",
					children: urlEmbed.postInfo.user.name
				}),
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsx("span", { children: urlEmbed.postInfo.excerpt })
			]
		}));
		default: return "";
	}
}
function passageConv(p) {
	const seg = [...p.text];
	if (p.styles) p.styles.map((s) => {
		switch (s.type) {
			case "bold":
				seg[s.offset] = "<b>" + seg[s.offset];
				seg[s.offset + s.length - 1] += "</b>";
				break;
			default:
		}
		return s;
	});
	if (p.links) p.links.map((l) => {
		seg[l.offset] = `<a href="${l.url}">` + seg[l.offset];
		seg[l.offset + l.length - 1] += "</a>";
		return l;
	});
	return seg.join("");
}
function parseText(body) {
	return body.text || "";
}
function parseImage(body) {
	let ret = body.text || "";
	for (const i of body.images) ret += `<hr><img src="${i.originalUrl}">`;
	return ret;
}
function parseFile(body) {
	let ret = body.text || "";
	for (const f of body.files) ret += `<br><a href="${f.url}" download="${f.name}.${f.extension}">${f.name}.${f.extension}</a>`;
	return ret;
}
async function parseVideo(body) {
	let ret = "";
	switch (body.video.serviceProvider) {
		case "soundcloud":
			ret += await getSoundCloudEmbedUrl(body.video.videoId);
			break;
		case "youtube":
			ret += `<iframe src="https://www.youtube-nocookie.com/embed/${body.video.videoId}" frameborder="0" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
			break;
		case "vimeo":
			ret += `<iframe src="https://player.vimeo.com/video/${body.video.videoId}" frameborder="0"></iframe>`;
			break;
		default:
	}
	ret += `<br>${body.text}`;
	return ret;
}
async function parseArtile(body) {
	let ret = [];
	for (const b of body.blocks) {
		ret.push("<p>");
		switch (b.type) {
			case "p":
				ret.push(passageConv(b));
				break;
			case "header":
				ret.push(`<h2>${b.text}</h2>`);
				break;
			case "image": {
				const i = body.imageMap[b.imageId];
				ret.push(`<img src="${i.originalUrl}">`);
				break;
			}
			case "file": {
				const file = body.fileMap[b.fileId];
				ret.push(`<a href="${file.url}" download="${file.name}.${file.extension}">${file.name}.${file.extension}</a>`);
				break;
			}
			case "url_embed":
				ret.push(embedUrlMap(body.urlEmbedMap[b.urlEmbedId]));
				break;
			default:
		}
	}
	ret = await Promise.all(ret);
	return ret.join("");
}
async function parseDetail(i) {
	let ret = "";
	if (i.feeRequired !== 0) ret += `Fee Required: <b>${i.feeRequired} JPY/month</b><hr>`;
	if (i.coverImageUrl) ret += `<img src="${i.coverImageUrl}"><hr>`;
	if (!i.body) {
		ret += i.excerpt;
		return ret;
	}
	switch (i.type) {
		case "text":
			ret += parseText(i.body);
			break;
		case "file":
			ret += parseFile(i.body);
			break;
		case "image":
			ret += parseImage(i.body);
			break;
		case "video":
			ret += await parseVideo(i.body);
			break;
		case "article":
			ret += await parseArtile(i.body);
			break;
		default: ret += "<b>Unsupported content (RSSHub)</b>";
	}
	return ret;
}
function parseItem(item) {
	return cache_default.tryGet(`fanbox-${item.id}-${item.updatedDatetime}`, async () => {
		const postDetail = await rofetch(`https://api.fanbox.cc/post.info?postId=${item.id}`, { headers: {
			...getHeaders(),
			"User-Agent": config.trueUA
		} });
		return {
			title: item.title || "No title",
			description: await parseDetail(postDetail.body),
			pubDate: parseDate(item.updatedDatetime),
			link: `https://${item.creatorId}.fanbox.cc/posts/${item.id}`,
			category: item.tags
		};
	});
}
async function getSoundCloudEmbedUrl(videoId) {
	const videoUrl = `https://soundcloud.com/${videoId}`;
	return (await rofetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json&maxheight=400&format=json`)).html;
}
//#endregion
//#region lib/routes/fanbox/index.ts
const route = {
	path: "/:creator",
	categories: ["social-media"],
	example: "/fanbox/official",
	parameters: { creator: "fanbox user name" },
	maintainers: ["KarasuShin", "pseudoyu"],
	name: "Creator",
	handler,
	features: {
		requireConfig: [{
			name: "FANBOX_SESSION_ID",
			description: "Required for private posts. Can be found in browser DevTools -> Application -> Cookies -> https://www.fanbox.cc -> FANBOXSESSID",
			optional: true
		}],
		nsfw: true
	}
};
async function handler(ctx) {
	const creator = ctx.req.param("creator");
	if (!isValidHost(creator)) throw new InvalidParameterError("Invalid user name");
	let title = `Fanbox - ${creator}`;
	let description;
	let image;
	try {
		const userInfoResponse = await rofetch(`https://api.fanbox.cc/creator.get?creatorId=${creator}`, { headers: getHeaders() });
		title = `Fanbox - ${userInfoResponse.body.user.name}`;
		description = userInfoResponse.body.description;
		image = userInfoResponse.body.user.iconUrl;
	} catch {}
	const postListResponse = await rofetch(`https://api.fanbox.cc/post.listCreator?creatorId=${creator}&limit=20&withPinned=true`, { headers: getHeaders() });
	const items = await Promise.all(postListResponse.body.map((i) => parseItem(i)));
	return {
		title,
		link: `https://${creator}.fanbox.cc`,
		description,
		image,
		item: items
	};
}
//#endregion
export { route };
