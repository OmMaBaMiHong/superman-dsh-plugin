import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { a as CDN_HOST, i as API_HOST, o as HOST, r as parseUserData, t as customFetch } from "./utils-BalV16OQ.mjs";
import { t as renderPost } from "./post-Q5QpSQJc.mjs";
//#region lib/routes/cara/likes.ts
const route = {
	path: "/likes/:user",
	categories: ["social-media"],
	example: "/cara/likes/fengz",
	parameters: { user: "username" },
	name: "Likes",
	maintainers: ["KarasuShin"],
	handler,
	radar: [{
		source: ["cara.app/:user", "cara.app/:user/*"],
		target: "/likes/:user"
	}]
};
async function handler(ctx) {
	const user = ctx.req.param("user");
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 15;
	const userInfo = await parseUserData(user);
	const items = (await customFetch(`${API_HOST}/posts/getAllLikesByUser?slug=${userInfo.slug}&take=${limit}`)).data.map((item) => {
		const description = renderPost({
			content: item.content,
			images: item.images.filter((i) => !i.isCoverImg).map((i) => ({
				...i,
				src: `${CDN_HOST}/${i.src}`
			}))
		});
		return {
			title: item.title || item.content,
			pubDate: parseDate(item.createdAt),
			link: `${HOST}/post/${item.id}`,
			description
		};
	});
	return {
		title: `Likes - ${userInfo.name}`,
		link: `${HOST}/${user}/likes`,
		image: `${CDN_HOST}/${userInfo.photo}`,
		item: items
	};
}
//#endregion
export { route };
