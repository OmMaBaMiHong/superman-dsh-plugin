//#region lib/routes/cs/zzkx.ts
const route = {
	path: ["/news/zzkx", "/zzkx"],
	name: "Unknown",
	maintainers: [],
	handler
};
function handler(ctx) {
	ctx.set("redirect", "/cs/sylm/jsbd");
}
//#endregion
export { route };
