export class DemoGhostError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DemoGhostError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DemoGhostTargetNotFoundError extends DemoGhostError {
  public readonly target: string;
  public readonly timeout: number;
  public readonly stepIndex?: number;

  constructor(target: string, timeout: number, stepIndex?: number) {
    const stepMsg = typeof stepIndex === "number" ? ` during step ${stepIndex + 1}` : "";
    super(`DemoGhost could not find target "${target}" within ${timeout}ms${stepMsg}.`);
    this.name = "DemoGhostTargetNotFoundError";
    this.target = target;
    this.timeout = timeout;
    this.stepIndex = stepIndex;
  }
}

export class DemoGhostTimeoutError extends DemoGhostError {
  public readonly condition: string;
  public readonly timeout: number;

  constructor(condition: string, timeout: number) {
    super(`DemoGhost timed out waiting for ${condition} after ${timeout}ms.`);
    this.name = "DemoGhostTimeoutError";
    this.condition = condition;
    this.timeout = timeout;
  }
}

export class DemoGhostPlaybackError extends DemoGhostError {
  public readonly stepIndex?: number;

  constructor(message: string, stepIndex?: number) {
    const stepMsg = typeof stepIndex === "number" ? ` at step ${stepIndex + 1}` : "";
    super(`Playback error${stepMsg}: ${message}`);
    this.name = "DemoGhostPlaybackError";
    this.stepIndex = stepIndex;
  }
}

export class DemoGhostRecordingError extends DemoGhostError {
  constructor(message: string) {
    super(`Recording error: ${message}`);
    this.name = "DemoGhostRecordingError";
  }
}

export class DemoGhostConfigurationError extends DemoGhostError {
  constructor(message: string) {
    super(`Configuration error: ${message}`);
    this.name = "DemoGhostConfigurationError";
  }
}
