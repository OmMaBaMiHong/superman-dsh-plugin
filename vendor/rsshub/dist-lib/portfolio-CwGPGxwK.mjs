import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { a as CDN_HOST, i as API_HOST, n as fetchPortfolioItem, o as HOST, r as parseUserData, t as customFetch } from "./utils-BalV16OQ.mjs";
//#region lib/routes/cara/portfolio.ts
const route = {
	path: "/portfolio/:user",
	categories: ["social-media"],
	example: "/cara/portfolio/fengz",
	parameters: { user: "username" },
	name: "Portfolio",
	maintainers: ["KarasuShin"],
	handler,
	radar: [{
		source: ["cara.app/:user", "cara.app/:user/*"],
		target: "/portfolio/:user"
	}]
};
async function handler(ctx) {
	const user = ctx.req.param("user");
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 15;
	const userInfo = await parseUserData(user);
	const portfolioResponse = await customFetch(`${API_HOST}/profiles/portfolio?id=${userInfo.id}&take=${limit}`);
	const items = await Promise.all(portfolioResponse.data.map((item) => cache_default.tryGet(`${HOST}/post/${item.postId}`, async () => await fetchPortfolioItem(item))));
	return {
		title: `Portfolio - ${userInfo.name}`,
		link: `${HOST}/${user}/portfolio`,
		image: `${CDN_HOST}/${userInfo.photo}`,
		item: items
	};
}
//#endregion
export { route };
