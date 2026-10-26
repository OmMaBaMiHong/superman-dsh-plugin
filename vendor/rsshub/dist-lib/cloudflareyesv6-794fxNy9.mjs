//#region lib/routes/hostmonit/cloudflareyesv6.ts
const route = {
	path: "/cloudflareyesv6",
	name: "Unknown",
	maintainers: [],
	handler
};
function handler(ctx) {
	ctx.set("redirect", "/hostmonit/cloudflareyes/v6");
}
//#endregion
export { route };
