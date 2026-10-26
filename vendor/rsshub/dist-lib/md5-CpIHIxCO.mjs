import crypto from "node:crypto";
//#region lib/utils/md5.ts
function md5(date) {
	return crypto.createHash("md5").update(date).digest("hex");
}
//#endregion
export { md5 as t };
