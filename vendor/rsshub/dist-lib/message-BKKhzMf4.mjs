import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/discord/templates/message.tsx
const renderWithLineBreaks = (text) => text ? raw(text.replaceAll("\n", "<br>")) : null;
const DiscordMessage = ({ message, guildInfo }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	message.type === 7 ? /* @__PURE__ */ jsxs(Fragment, { children: [
		message.author.global_name ?? message.author.username,
		" joined ",
		guildInfo.name,
		".",
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	message.content ? /* @__PURE__ */ jsxs(Fragment, { children: [renderWithLineBreaks(message.content), /* @__PURE__ */ jsx("br", {})] }) : null,
	message.attachments?.map((attachment) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: attachment.proxy_url }), /* @__PURE__ */ jsx("br", {})] })),
	message.sticker_items?.map((sticker) => {
		const src = sticker.format_type < 3 ? `https://cdn.discordapp.com/stickers/${sticker.id}.png` : sticker.format_type === 4 ? `https://media.discordapp.net/stickers/${sticker.id}.gif` : null;
		return src ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", {
			src,
			alt: sticker.name
		}), /* @__PURE__ */ jsx("br", {})] }) : null;
	}),
	message.embeds?.map((embed) => /* @__PURE__ */ jsxs(Fragment, { children: [
		embed.type === "article" ? /* @__PURE__ */ jsxs(Fragment, { children: [embed.url ? /* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx("a", {
				href: embed.url,
				children: embed.title || embed.url
			}),
			embed.description ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), renderWithLineBreaks(embed.description)] }) : null,
			/* @__PURE__ */ jsx("br", {})
		] }) : null, embed.thumbnail ? /* @__PURE__ */ jsx("img", { src: embed.thumbnail.proxy_url }) : null] }) : null,
		embed.type === "gifv" ? /* @__PURE__ */ jsx("video", {
			controls: true,
			poster: embed.thumbnail?.proxy_url,
			children: /* @__PURE__ */ jsx("source", {
				src: embed.video?.proxy_url,
				type: "video/mp4"
			})
		}) : null,
		embed.type === "image" ? /* @__PURE__ */ jsx("img", { src: embed.thumbnail?.proxy_url }) : null,
		embed.type === "rich" ? /* @__PURE__ */ jsxs(Fragment, { children: [
			embed.author ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("a", {
				href: embed.author.url,
				children: embed.author.name
			}), /* @__PURE__ */ jsx("br", {})] }) : null,
			/* @__PURE__ */ jsx("a", {
				href: embed.url,
				children: embed.title || embed.url
			}),
			embed.description ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), renderWithLineBreaks(embed.description)] }) : null,
			/* @__PURE__ */ jsx("br", {}),
			embed.image ? /* @__PURE__ */ jsx("img", { src: embed.image.proxy_url }) : null
		] }) : null,
		embed.type === "video" ? /* @__PURE__ */ jsxs(Fragment, { children: [embed.url ? /* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx("a", {
				href: embed.url,
				children: embed.title
			}),
			embed.description ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), renderWithLineBreaks(embed.description)] }) : null,
			/* @__PURE__ */ jsx("br", {})
		] }) : null, embed.thumbnail ? /* @__PURE__ */ jsx("img", { src: embed.thumbnail.proxy_url }) : null] }) : null,
		/* @__PURE__ */ jsx("br", {})
	] }))
] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(DiscordMessage, { ...data }));
//#endregion
export { renderDescription as t };
