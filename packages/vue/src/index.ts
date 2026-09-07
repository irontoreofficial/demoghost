import { App, ref, shallowRef, computed, DirectiveBinding } from "vue";
import {
  DemoGhost,
  DemoScenario,
  DemoStep,
  PlaybackController,
  PlaybackOptions,
  PlaybackState,
  RecorderOptions,
  EventRecorder
} from "demoghost";

export function useDemoGhost() {
  const controller = shallowRef<PlaybackController | null>(null);
  const state = ref<PlaybackState>("idle");
  const isPlaying = computed(() => state.value === "playing");

  const play = (
    scenario: DemoScenario | DemoStep[],
    options?: PlaybackOptions
  ): PlaybackController => {
    const ctrl = DemoGhost.play(scenario, options);
    controller.value = ctrl;

    ctrl.on("start", () => (state.value = "playing"));
    ctrl.on("pause", () => (state.value = "paused"));
    ctrl.on("resume", () => (state.value = "playing"));
    ctrl.on("complete", () => (state.value = "completed"));
    ctrl.on("stop", () => (state.value = "stopped"));
    ctrl.on("error", () => (state.value = "error"));

    return ctrl;
  };

  const pause = () => controller.value?.pause();
  const resume = () => controller.value?.resume();
  const stop = () => controller.value?.stop();
  const restart = () => controller.value?.restart();
  const record = (options?: RecorderOptions): EventRecorder => DemoGhost.record(options);

  return {
    controller,
    state,
    isPlaying,
    play,
    pause,
    resume,
    stop,
    restart,
    record
  };
}

export const demoGhostDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
    if (binding.value) {
      el.setAttribute("data-demoghost-id", binding.value);
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding<string>) {
    if (binding.value) {
      el.setAttribute("data-demoghost-id", binding.value);
    }
  }
};

export const DemoGhostPlugin = {
  install(app: App) {
    app.directive("demo-ghost", demoGhostDirective);
    app.config.globalProperties.$demoGhost = DemoGhost;
  }
};
