import { t as md5 } from "./md5-CpIHIxCO.mjs";
//#region lib/routes/dockerhub/utils.ts
function hash(images) {
	return md5(Object.entries(images).map((x) => `${x[1].os}/${x[1].architecture},${x[1].digest}`).toSorted((a, b) => a.localeCompare(b)).join("|"));
}
//#endregion
export { hash as t };
