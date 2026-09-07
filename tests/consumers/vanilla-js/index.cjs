const { DemoGhost, click, type, wait } = require("demoghost");

console.log("CJS require check:", typeof DemoGhost.play, typeof click, typeof type, typeof wait);
if (typeof DemoGhost.play !== "function" || typeof click !== "function") {
  throw new Error("DemoGhost exports invalid in CJS");
}
console.log("Vanilla JS CJS consumer passed!");
