import { DemoGhost, click, type, wait, highlight } from "demoghost";

const searchInput = document.getElementById("demo-search") as HTMLInputElement;
const submitBtn = document.getElementById("search-submit") as HTMLButtonElement;
const resultsEl = document.getElementById("results") as HTMLDivElement;
const playBtn = document.getElementById("btn-play") as HTMLButtonElement;

submitBtn.addEventListener("click", () => {
  resultsEl.textContent = `Search results for: "${searchInput.value}"`;
});

playBtn.addEventListener("click", () => {
  DemoGhost.play([
    click("#demo-search"),
    type("#demo-search", "Self-playing live UI demo"),
    wait(300),
    click("#search-submit"),
    highlight("#results", { duration: 1200 })
  ]);
});
