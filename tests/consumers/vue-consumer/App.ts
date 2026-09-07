import { createApp, defineComponent, h } from "vue";
import { DemoGhostPlugin, useDemoGhost } from "@demoghost/vue";
import { click, wait } from "demoghost";

const DemoComponent = defineComponent({
  setup() {
    const { play, isPlaying } = useDemoGhost();

    const startTour = () => {
      play([click("#feature"), wait(300)]);
    };

    return () =>
      h(
        "button",
        { onClick: startTour, disabled: isPlaying.value },
        isPlaying.value ? "Playing" : "Start"
      );
  }
});

const app = createApp(DemoComponent);
app.use(DemoGhostPlugin);
