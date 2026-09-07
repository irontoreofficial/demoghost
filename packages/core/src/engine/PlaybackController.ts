import {
  DemoScenario,
  DemoStep,
  PlaybackControllerInterface,
  PlaybackState,
  PlaybackOptions,
  PlaybackEvents,
  ActionExecutionContext
} from "../types";
import { ActionRegistry } from "../actions/ActionRegistry";
import { TargetResolver } from "../targeting/TargetResolver";
import { CursorEngine } from "../cursor/CursorEngine";
import { ScrollEngine } from "../scroll/ScrollEngine";
import { SpotlightEngine } from "../spotlight/SpotlightEngine";
import { ThemeManager } from "../theme/theme";
import { AccessibilityManager } from "../accessibility/a11y";
import { EventEmitter } from "../events/EventEmitter";

export class PlaybackController implements PlaybackControllerInterface {
  private scenario: DemoScenario;
  private options: PlaybackOptions;
  private actionRegistry: ActionRegistry;
  private emitter: EventEmitter<PlaybackEvents>;

  private _state: PlaybackState = "idle";
  private _currentStep = 0;
  private _speed = 1;

  private abortController: AbortController | null = null;
  private pauseResolver: (() => void) | null = null;
  private runPromise: Promise<void> | null = null;
  private enginesInitialized = false;
  private finishResolver!: () => void;
  private finishRejecter!: (err: any) => void;
  public finished: Promise<void>;

  // Sub-engines
  private targetResolver!: TargetResolver;
  private cursorEngine!: CursorEngine;
  private scrollEngine!: ScrollEngine;
  private spotlightEngine!: SpotlightEngine;
  private a11y!: AccessibilityManager;

  constructor(
    scenario: DemoScenario,
    options: PlaybackOptions = {},
    actionRegistry: ActionRegistry,
    emitter?: EventEmitter<PlaybackEvents>
  ) {
    this.scenario = scenario;
    this.options = options;
    this._speed = options.speed ?? 1;
    this.actionRegistry = actionRegistry;
    this.emitter = emitter || new EventEmitter<PlaybackEvents>();

    this.finished = Promise.resolve();
    this.resetFinishedPromise();

    this.initEngines();
  }

  private initEngines(): void {
    if (typeof window === "undefined") return;

    if (this.enginesInitialized) this.cleanup();

    ThemeManager.apply(this.options.theme, this.options.container);

    this.targetResolver = new TargetResolver(this.options.defaultTimeout ?? 5000);
    this.cursorEngine = new CursorEngine({
      pointerMode: this.options.pointer,
      cursor: this.options.cursor,
      container: this.options.container,
      deterministic: this.options.deterministic
    });
    this.scrollEngine = new ScrollEngine(this.options.scroll);
    this.spotlightEngine = new SpotlightEngine(this.options.container);
    this.a11y = new AccessibilityManager();

    this.a11y.saveFocus();
    this.a11y.bindKeyboardControls({
      onStop: () => this.stop(),
      onTogglePause: () => {
        if (this._state === "playing") this.pause();
        else if (this._state === "paused") this.resume();
      }
    });
    this.enginesInitialized = true;
  }

  private resetFinishedPromise(): void {
    this.finished = new Promise<void>((resolve, reject) => {
      this.finishResolver = resolve;
      this.finishRejecter = reject;
    });
    // Auto-start users may ignore `finished`; attaching a handler avoids an
    // unhandled-rejection warning while preserving rejection for consumers.
    void this.finished.catch(() => undefined);
  }

  public get state(): PlaybackState {
    return this._state;
  }

  public get currentStep(): number {
    return this._currentStep;
  }

  public get totalSteps(): number {
    return this.scenario.steps.length;
  }

  public get speed(): number {
    return this._speed;
  }

  public set speed(val: number) {
    this._speed = Math.max(0.1, val);
  }

  public play(): Promise<void> {
    if (this._state === "playing") return this.runPromise ?? this.finished;
    if (this._state === "paused") {
      this.resume();
      return this.runPromise ?? this.finished;
    }

    if (this._state === "completed" || this._state === "stopped" || this._state === "error") {
      return this.restart();
    }

    this.runPromise = this.runPlayback();
    return this.runPromise;
  }

  private async runPlayback(): Promise<void> {
    this._state = "playing";
    this.abortController = new AbortController();
    this.emitter.emit("start", { scenario: this.scenario });

    try {
      while (this._currentStep < this.totalSteps) {
        if (this.abortController.signal.aborted) break;

        await this.waitIfPaused();
        if (this.abortController.signal.aborted) break;

        const step = this.scenario.steps[this._currentStep];
        await this.executeStep(step, this._currentStep);

        this._currentStep++;
      }

      if (!this.abortController.signal.aborted) {
        this._state = "completed";
        this.emitter.emit("complete", { scenario: this.scenario });
        this.cleanup();
        this.finishResolver();
      }
    } catch (err: any) {
      if (this.abortController?.signal.aborted) {
        return;
      }
      this._state = "error";
      this.emitter.emit("error", { error: err, stepIndex: this._currentStep });
      this.cleanup();
      this.finishRejecter(err);
      throw err;
    } finally {
      this.runPromise = null;
    }
  }

  private async executeStep(step: DemoStep, index: number): Promise<void> {
    const handler = this.actionRegistry.get(step.type);
    const startTime = performance.now();

    this.emitter.emit("step:start", { step, index, total: this.totalSteps });
    this.log(`Step ${index + 1}/${this.totalSteps} -> ${step.type.toUpperCase()}`);

    // Caption announcement if provided on step
    if (step.caption) {
      const captionText = typeof step.caption === "string" ? step.caption : step.caption.text;
      this.a11y.announce(captionText);
      const capOpts = typeof step.caption === "string" ? { text: step.caption } : step.caption;
      let targetEl: HTMLElement | undefined;
      if (step.target) {
        targetEl =
          (await this.targetResolver.resolveOptional(step.target, this.abortController?.signal)) ||
          undefined;
      }
      this.spotlightEngine.showCaption(capOpts, targetEl);
    }

    if (step.delayBefore && step.delayBefore > 0) {
      await this.waitForDuration(step.delayBefore / this._speed);
    }

    const context: ActionExecutionContext = {
      step,
      stepIndex: index,
      totalSteps: this.totalSteps,
      targetResolver: this.targetResolver,
      cursor: this.cursorEngine,
      scrollEngine: this.scrollEngine,
      spotlightEngine: this.spotlightEngine,
      options: { ...this.options, speed: this._speed },
      signal: this.abortController!.signal,
      isPaused: () => this._state === "paused",
      waitIfPaused: () => this.waitIfPaused(),
      log: (msg: string, ...args: any[]) => this.log(msg, ...args)
    };

    await handler.execute(context);

    if (step.delayAfter && step.delayAfter > 0) {
      await this.waitForDuration(step.delayAfter / this._speed);
    }

    const elapsed = Math.round(performance.now() - startTime);
    this.log(`Step ${index + 1}/${this.totalSteps} completed in ${elapsed}ms`);
    this.emitter.emit("step:complete", { step, index, total: this.totalSteps });
  }

  public pause(): void {
    if (this._state !== "playing") return;
    this._state = "paused";
    this.emitter.emit("pause", undefined);
  }

  public resume(): void {
    if (this._state !== "paused") return;
    this._state = "playing";
    if (this.pauseResolver) {
      this.pauseResolver();
      this.pauseResolver = null;
    }
    this.emitter.emit("resume", undefined);
  }

  public stop(): void {
    if (this._state === "stopped" || this._state === "completed") return;
    this._state = "stopped";
    if (this.abortController) {
      this.abortController.abort();
    }
    if (this.pauseResolver) {
      this.pauseResolver();
      this.pauseResolver = null;
    }
    this.emitter.emit("stop", undefined);
    this.cleanup();
    this.finishResolver();
  }

  public async restart(): Promise<void> {
    const activeRun = this.runPromise;
    this.stop();
    if (activeRun) await activeRun.catch(() => undefined);
    this._currentStep = 0;
    this.initEngines();
    this.resetFinishedPromise();
    this._state = "idle";
    return this.play();
  }

  public async next(): Promise<void> {
    if (this._currentStep < this.totalSteps - 1) {
      this._currentStep++;
      const step = this.scenario.steps[this._currentStep];
      await this.executeStep(step, this._currentStep);
    }
  }

  public async previous(): Promise<void> {
    if (this._currentStep > 0) {
      this._currentStep--;
      const step = this.scenario.steps[this._currentStep];
      await this.executeStep(step, this._currentStep);
    }
  }

  private async waitIfPaused(): Promise<void> {
    if (this._state === "paused") {
      await new Promise<void>(resolve => {
        this.pauseResolver = resolve;
      });
    }
  }

  private async waitForDuration(duration: number): Promise<void> {
    let remaining = Math.max(0, duration);
    while (remaining > 0 && !this.abortController?.signal.aborted) {
      await this.waitIfPaused();
      if (this.abortController?.signal.aborted) return;
      const slice = Math.min(remaining, 50);
      const startedAt = performance.now();
      await new Promise<void>(resolve => {
        const timer = setTimeout(resolve, slice);
        this.abortController?.signal.addEventListener(
          "abort",
          () => {
            clearTimeout(timer);
            resolve();
          },
          { once: true }
        );
      });
      remaining -= performance.now() - startedAt;
    }
  }

  private cleanup(): void {
    if (!this.enginesInitialized) return;
    if (this.cursorEngine) this.cursorEngine.destroy();
    if (this.scrollEngine) this.scrollEngine.destroy();
    if (this.spotlightEngine) this.spotlightEngine.destroy();
    if (this.a11y) this.a11y.destroy();
    this.enginesInitialized = false;
  }

  public then<TResult1 = void, TResult2 = never>(
    onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.finished.then(onfulfilled, onrejected);
  }

  private log(msg: string, ...args: any[]): void {
    if (this.options.debug) {
      console.log(`[DemoGhost] ${msg}`, ...args);
    }
  }

  public on<K extends keyof PlaybackEvents>(
    event: K,
    listener: (data: PlaybackEvents[K]) => void
  ): () => void {
    return this.emitter.on(event, listener);
  }

  public off<K extends keyof PlaybackEvents>(
    event: K,
    listener: (data: PlaybackEvents[K]) => void
  ): void {
    this.emitter.off(event, listener);
  }
}
