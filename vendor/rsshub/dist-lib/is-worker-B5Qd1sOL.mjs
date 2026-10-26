//#region lib/utils/is-worker.ts
const isWorker = typeof caches !== "undefined" && globalThis.WebSocketPair !== void 0;
//#endregion
export { isWorker as t };
