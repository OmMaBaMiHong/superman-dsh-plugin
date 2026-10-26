//#region lib/routes/liulinblog/itnews.ts
const route = {
	path: "/itnews/:channel",
	name: "Unknown",
	maintainers: [],
	handler
};
function handler(ctx) {
	const { channel } = ctx.req.param();
	const redirectTo = `/liulinblog/${channel}`;
	ctx.set("redirect", redirectTo);
}
//#endregion
export { route };
