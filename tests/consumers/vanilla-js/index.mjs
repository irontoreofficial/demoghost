import { DemoGhost, click, type, wait } from "demoghost";

console.log("ESM import check:", typeof DemoGhost.play, typeof click, typeof type, typeof wait);
if (typeof DemoGhost.play !== "function" || typeof click !== "function") {
  throw new Error("DemoGhost exports invalid in ESM");
}
console.log("Vanilla JS ESM consumer passed!");
