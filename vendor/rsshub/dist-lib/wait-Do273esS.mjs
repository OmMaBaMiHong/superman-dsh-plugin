//#region lib/utils/wait.ts
function wait(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
//#endregion
export { wait as t };
