//#region lib/routes/test/api-index.ts
const apiRoute = {
	path: "/",
	maintainers: ["DIYgod"],
	handler
};
function handler() {
	return { code: 0 };
}
//#endregion
export { apiRoute };
