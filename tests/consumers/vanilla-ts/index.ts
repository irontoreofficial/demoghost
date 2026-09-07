import { DemoGhost, click, type, focus, wait } from "demoghost";

const scenario = {
  title: "Test Scenario",
  steps: [click("#btn"), type("#search", "hello world"), focus("#btn"), wait(200)]
};

const controller = DemoGhost.play(scenario, {
  controls: false,
  speed: 1.5
});

controller.pause();
controller.resume();
controller.stop();
