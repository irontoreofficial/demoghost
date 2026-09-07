import { DemoGhostService } from "@demoghost/angular";
import { click, type, wait, highlight } from "demoghost";
import "demoghost/css";

const demoService = new DemoGhostService();

const playBtn = document.getElementById("btn-ang-play")!;
const submitBtn = document.getElementById("ang-btn")!;
const input = document.getElementById("ang-input") as HTMLInputElement;
const feedback = document.getElementById("ang-feedback")!;

submitBtn.addEventListener("click", () => {
  feedback.textContent = `Angular submitted: ${input.value}`;
});

playBtn.addEventListener("click", () => {
  demoService.play([
    click("#ang-input"),
    type("#ang-input", "Modern Angular Standalone"),
    wait(250),
    click("#ang-btn"),
    highlight("#ang-feedback", { duration: 1000 })
  ]);
});
