import { t as fetchFeed } from "./utils-INacok5b.mjs";
//#region lib/routes/ruancan/user.ts
const route = {
	path: "/user/:id",
	radar: [{ source: ["ruancan.com/i/:id", "ruancan.com/"] }],
	name: "Unknown",
	maintainers: [],
	handler,
	url: "ruancan.com/"
};
async function handler(ctx) {
	return await fetchFeed(ctx, `/i/${ctx.req.param("id")}`);
}
//#endregion
export { route };
