import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/zuvio/utils.tsx
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0OTcyMzI1MjMsInN5c3RlbV9uYW1lIjoiZm9ydW0iLCJ6dXZpb19pZCI6LTk5OSwiZW1haWwiOm51bGwsIm5hbWUiOm51bGwsInVuaXZlcnNpdHlfaWQiOm51bGwsInVuaXZlcnNpdHlfbmFtZSI6bnVsbH0.0KoJiSnyazsJxLCNEnqnuNUdKsJFhBdCn3R2BJpoUtk";
const apiUrl = "https://forum.zuvio.com.tw/api";
const rootUrl = "https://irs.zuvio.com.tw/student5/chickenM";
const renderDesc = (data) => {
	let output = "";
	if (data.ref_article) output += renderRefArticle(data.ref_article);
	output += renderSections(data.sections);
	return output;
};
const renderSections = (sections) => {
	let output = "";
	for (const section of sections) switch (section.type) {
		case "text":
			output += section.content.replaceAll("\n", "<br>");
			break;
		case "img":
			output += renderImageSection(section);
			break;
		case "youtube":
			output += renderYouTubeSection(section);
			break;
		case "link":
			output += renderLinkSection(section);
			break;
		default: throw new Error(`Unknown section type: ${section.type}`);
	}
	return output;
};
const getBoards = () => cache_default.tryGet("zuvio:boards", async () => {
	const { data } = await got_default(`${apiUrl}/board`, { searchParams: {
		api_token: token,
		user_id: "0"
	} });
	return data.map((item) => ({
		title: item.name,
		description: renderBoardLink(item.id),
		boardId: item.id,
		link: `${rootUrl}/articles/${item.id}`
	}));
});
const renderRefArticle = (ref_article) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	"引用自：",
	/* @__PURE__ */ jsxs("a", {
		href: ref_article.id,
		children: [
			/* @__PURE__ */ jsx("img", { src: ref_article.user_icon }),
			/* @__PURE__ */ jsxs("div", { children: [
				ref_article.university,
				" ",
				ref_article.user_name,
				" ",
				ref_article.board_name
			] }),
			/* @__PURE__ */ jsx("div", { children: ref_article.title }),
			/* @__PURE__ */ jsx("div", { children: ref_article.abstract })
		]
	}),
	/* @__PURE__ */ jsx("hr", {})
] }));
const renderImageSection = (section) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: section.content }), /* @__PURE__ */ jsx("br", {})] }));
const renderYouTubeSection = (section) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("iframe", {
	width: "672",
	height: "377",
	src: `https://www.youtube-nocookie.com/embed/${section.youtube_id}`,
	frameborder: "0",
	allowfullscreen: true,
	referrerpolicy: "strict-origin-when-cross-origin"
}), /* @__PURE__ */ jsx("br", {})] }));
const renderLinkSection = (section) => renderToString(/* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsxs("a", {
	href: section.content,
	children: [
		/* @__PURE__ */ jsx("img", { src: section.icon }),
		/* @__PURE__ */ jsx("div", { children: section.title }),
		/* @__PURE__ */ jsx("div", { children: section.description })
	]
}) }));
const renderBoardLink = (id) => renderToString(/* @__PURE__ */ jsx("a", {
	href: `https://rsshub.app/zuvio/student5/${id}`,
	children: id
}));
//#endregion
export { token as a, rootUrl as i, getBoards as n, renderDesc as r, apiUrl as t };
