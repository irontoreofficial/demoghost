import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
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

export interface DemoGhostContextValue {
  controller: PlaybackController | null;
  state: PlaybackState;
  isPlaying: boolean;
  play: (scenario: DemoScenario | DemoStep[], options?: PlaybackOptions) => PlaybackController;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  restart: () => Promise<void>;
  record: (options?: RecorderOptions) => EventRecorder;
}

const DemoGhostContext = createContext<DemoGhostContextValue | null>(null);

export interface DemoGhostProviderProps {
  children: ReactNode;
  defaultOptions?: PlaybackOptions;
}

export const DemoGhostProvider: React.FC<DemoGhostProviderProps> = ({
  children,
  defaultOptions
}) => {
  const [controller, setController] = useState<PlaybackController | null>(null);
  const [state, setState] = useState<PlaybackState>("idle");

  useEffect(() => {
    if (!controller) return;

    const unsubs = [
      controller.on("start", () => setState("playing")),
      controller.on("pause", () => setState("paused")),
      controller.on("resume", () => setState("playing")),
      controller.on("complete", () => setState("completed")),
      controller.on("stop", () => setState("stopped")),
      controller.on("error", () => setState("error"))
    ];

    return () => {
      unsubs.forEach(u => u());
    };
  }, [controller]);

  const value = useMemo<DemoGhostContextValue>(() => {
    return {
      controller,
      state,
      isPlaying: state === "playing",
      play: (scenario, options) => {
        const ctrl = DemoGhost.play(scenario, { ...defaultOptions, ...options });
        setController(ctrl);
        return ctrl;
      },
      pause: () => controller?.pause(),
      resume: () => controller?.resume(),
      stop: () => controller?.stop(),
      restart: async () => controller?.restart(),
      record: opts => DemoGhost.record(opts)
    };
  }, [controller, state, defaultOptions]);

  return <DemoGhostContext.Provider value={value}>{children}</DemoGhostContext.Provider>;
};

export function useDemoGhost(): DemoGhostContextValue {
  const ctx = useContext(DemoGhostContext);
  if (!ctx) {
    // Graceful fallback if used outside Provider: direct Demoghost play
    return {
      controller: null,
      state: "idle",
      isPlaying: false,
      play: (scenario, options) => DemoGhost.play(scenario, options),
      pause: () => {},
      resume: () => {},
      stop: () => {},
      restart: async () => {},
      record: opts => DemoGhost.record(opts)
    };
  }
  return ctx;
}

export interface DemoGhostTargetProps extends React.HTMLAttributes<HTMLElement> {
  demoId: string;
  as?: React.ElementType;
}

export const DemoGhostTarget: React.FC<DemoGhostTargetProps> = ({
  demoId,
  as: Component = "div",
  children,
  ...props
}) => {
  return (
    <Component data-demoghost-id={demoId} {...props}>
      {children}
    </Component>
  );
};
