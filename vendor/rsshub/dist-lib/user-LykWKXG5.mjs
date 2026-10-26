import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/curiouscat/user.ts
const fetchAPIByUser = async (user) => {
	const { data } = await got_default.get("https://curiouscat.me/api/v2/profile?username=" + user);
	return data;
};
const route = {
	path: "/user/:id",
	radar: [{ source: ["curiouscat.live/:id"] }],
	name: "Unknown",
	maintainers: ["lucasew"],
	handler
};
async function handler(ctx) {
	const user = ctx.req.param("id");
	const data = await fetchAPIByUser(user);
	const items = data.posts.map((post) => {
		const author = post.senderData.id ? post.senderData.username : "Anonymous";
		const title = `@${author}: ${post.comment}`;
		const link = `https://curiouscat.live/${user}/post/${post.id}`;
		const media = post.media ? `<img src="${post.media.img}"></img>` : "";
		return {
			author,
			link,
			title,
			description: `${post.comment}<br><br>
        ${post.reply}
        ${media}
        <br>
        Likes: ${post.likes}`,
			pubDate: /* @__PURE__ */ new Date(post.timestamp * 1e3)
		};
	});
	return {
		title: `CuriousCat - ${user}`,
		link: `https://curiouscat.live/${user}`,
		description: `Questions answered by ${user} using CuriousCat`,
		language: data.lang,
		item: items
	};
}
//#endregion
export { route };
