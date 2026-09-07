export type TargetSelector = string | HTMLElement;

export interface TargetOptions {
  selector: TargetSelector;
  timeout?: number;
  waitForTarget?: number;
  offset?: { x?: number; y?: number };
}

export type DemoTarget = TargetSelector | TargetOptions;

export type CursorStyle = "classic" | "pointer" | "dot" | "minimal" | "custom";
export type PointerMode = "cursor" | "touch";

export type TypingSpeed = "instant" | "fast" | "normal" | "slow" | "human" | number;

export interface CaptionOptions {
  title?: string;
  text: string;
  position?: "top" | "bottom" | "left" | "right" | "auto";
  duration?: number;
}

export type ActionType =
  | "move"
  | "click"
  | "doubleClick"
  | "rightClick"
  | "type"
  | "clear"
  | "focus"
  | "blur"
  | "wait"
  | "scroll"
  | "scrollTo"
  | "select"
  | "check"
  | "uncheck"
  | "hover"
  | "press"
  | "highlight"
  | "caption"
  | "drag"
  | string;

export interface BaseStep {
  type: ActionType;
  caption?: string | CaptionOptions;
  waitForTarget?: number;
  delayBefore?: number;
  delayAfter?: number;
  [key: string]: any;
}

export interface MoveStep extends BaseStep {
  type: "move";
  target: DemoTarget;
  duration?: number;
}

export interface ClickStep extends BaseStep {
  type: "click";
  target: DemoTarget;
  button?: "left" | "right" | "middle";
  clickCount?: number;
}

export interface DoubleClickStep extends BaseStep {
  type: "doubleClick";
  target: DemoTarget;
}

export interface RightClickStep extends BaseStep {
  type: "rightClick";
  target: DemoTarget;
}

export interface TypeStep extends BaseStep {
  type: "type";
  target: DemoTarget;
  value: string;
  speed?: TypingSpeed;
  clearFirst?: boolean;
}

export interface ClearStep extends BaseStep {
  type: "clear";
  target: DemoTarget;
}

export interface FocusStep extends BaseStep {
  type: "focus";
  target: DemoTarget;
}

export interface BlurStep extends BaseStep {
  type: "blur";
  target: DemoTarget;
}

export interface WaitStep extends BaseStep {
  type: "wait";
  duration?: number;
  condition?: () => boolean | Promise<boolean>;
  selector?: string;
  state?: "visible" | "hidden" | "attached" | "detached";
  timeout?: number;
}

export interface ScrollStep extends BaseStep {
  type: "scroll";
  target?: DemoTarget;
  x?: number;
  y?: number;
  offset?: number;
  behavior?: ScrollBehavior;
}

export interface ScrollToStep extends BaseStep {
  type: "scrollTo";
  x: number;
  y: number;
  behavior?: ScrollBehavior;
}

export interface SelectStep extends BaseStep {
  type: "select";
  target: DemoTarget;
  value: string | string[];
}

export interface CheckStep extends BaseStep {
  type: "check";
  target: DemoTarget;
}

export interface UncheckStep extends BaseStep {
  type: "uncheck";
  target: DemoTarget;
}

export interface HoverStep extends BaseStep {
  type: "hover";
  target: DemoTarget;
  duration?: number;
}

export interface PressStep extends BaseStep {
  type: "press";
  key: string;
  target?: DemoTarget;
}

export interface HighlightStep extends BaseStep {
  type: "highlight";
  target: DemoTarget;
  duration?: number;
  style?: "glow" | "spotlight" | "outline" | "pulse";
}

export interface CaptionStep extends BaseStep {
  type: "caption";
  options: CaptionOptions;
  target?: DemoTarget;
}

export interface DragStep extends BaseStep {
  type: "drag";
  source: DemoTarget;
  target: DemoTarget;
  duration?: number;
}

export type DemoStep =
  | MoveStep
  | ClickStep
  | DoubleClickStep
  | RightClickStep
  | TypeStep
  | ClearStep
  | FocusStep
  | BlurStep
  | WaitStep
  | ScrollStep
  | ScrollToStep
  | SelectStep
  | CheckStep
  | UncheckStep
  | HoverStep
  | PressStep
  | HighlightStep
  | CaptionStep
  | DragStep
  | BaseStep;

export interface DemoScenario {
  id?: string;
  name?: string;
  description?: string;
  version?: number;
  tags?: string[];
  steps: DemoStep[];
}

export type PlaybackState = "idle" | "playing" | "paused" | "completed" | "stopped" | "error";

export type ThemeName = "auto" | "light" | "dark" | "glass";

export interface CustomTheme {
  accent?: string;
  cursor?: string;
  glassBg?: string;
  border?: string;
  text?: string;
  shadow?: string;
  zIndexCursor?: number;
  zIndexOverlay?: number;
}

export type DemoTheme = ThemeName | CustomTheme;

export interface CursorConfig {
  style?: CursorStyle;
  customSvg?: string;
  customElement?: HTMLElement;
  size?: number;
  color?: string;
}

export interface ScrollConfig {
  behavior?: ScrollBehavior;
  offset?: number;
}

export interface PlaybackOptions {
  speed?: number;
  pointer?: PointerMode;
  cursor?: CursorConfig;
  scroll?: ScrollConfig;
  theme?: DemoTheme;
  controls?: boolean;
  debug?: boolean;
  autoStart?: boolean;
  loop?: boolean;
  deterministic?: boolean;
  container?: HTMLElement;
}

export interface DemoGhostConfig extends PlaybackOptions {
  defaultTimeout?: number;
  typingSpeed?: TypingSpeed;
}

export interface ActionExecutionContext {
  step: DemoStep;
  stepIndex: number;
  totalSteps: number;
  targetResolver: TargetResolver;
  cursor: CursorEngineInterface;
  scrollEngine: ScrollEngineInterface;
  spotlightEngine: SpotlightEngineInterface;
  options: PlaybackOptions;
  signal: AbortSignal;
  isPaused: () => boolean;
  waitIfPaused: () => Promise<void>;
  log: (msg: string, ...args: any[]) => void;
}

export interface ActionHandler {
  execute(context: ActionExecutionContext): Promise<void>;
}

export interface TargetResolver {
  resolve(target: DemoTarget, stepIndex?: number): Promise<HTMLElement>;
  resolveOptional(target: DemoTarget): Promise<HTMLElement | null>;
}

export interface CursorEngineInterface {
  moveTo(x: number, y: number, duration?: number): Promise<void>;
  click(button?: string): Promise<void>;
  doubleClick(): Promise<void>;
  show(): void;
  hide(): void;
  setState(state: "default" | "pointer" | "text" | "active" | "hidden"): void;
  getPosition(): { x: number; y: number };
  destroy(): void;
}

export interface ScrollEngineInterface {
  scrollIntoView(element: HTMLElement, offset?: number): Promise<void>;
  scrollTo(x: number, y: number, behavior?: ScrollBehavior): Promise<void>;
}

export interface SpotlightEngineInterface {
  highlight(
    element: HTMLElement,
    options?: { duration?: number; style?: string; caption?: CaptionOptions | string }
  ): Promise<void>;
  clearHighlight(): void;
  showCaption(options: CaptionOptions, targetEl?: HTMLElement): void;
  hideCaption(): void;
  destroy(): void;
}

export interface PlaybackEvents {
  start: { scenario: DemoScenario };
  "step:start": { step: DemoStep; index: number; total: number };
  "step:complete": { step: DemoStep; index: number; total: number };
  pause: void;
  resume: void;
  complete: { scenario: DemoScenario };
  stop: void;
  error: { error: Error; stepIndex?: number };
  "record:start": void;
  "record:stop": { scenario: DemoScenario };
}

export interface PlaybackControllerInterface {
  readonly state: PlaybackState;
  readonly currentStep: number;
  readonly totalSteps: number;
  readonly finished: Promise<void>;
  speed: number;
  play(): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
  restart(): Promise<void>;
  next(): Promise<void>;
  previous(): Promise<void>;
  on<K extends keyof PlaybackEvents>(
    event: K,
    listener: (data: PlaybackEvents[K]) => void
  ): () => void;
  off<K extends keyof PlaybackEvents>(event: K, listener: (data: PlaybackEvents[K]) => void): void;
}
