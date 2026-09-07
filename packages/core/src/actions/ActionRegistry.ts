import { ActionHandler, ActionExecutionContext, ActionType } from "../types";
import { DemoGhostPlaybackError } from "../errors";

export class ActionRegistry {
  private handlers = new Map<ActionType, ActionHandler>();

  public register(
    type: ActionType,
    handler: ActionHandler | ((context: ActionExecutionContext) => Promise<void>)
  ): void {
    if (typeof handler === "function") {
      this.handlers.set(type, { execute: handler });
    } else {
      this.handlers.set(type, handler);
    }
  }

  public get(type: ActionType): ActionHandler {
    const handler = this.handlers.get(type);
    if (!handler) {
      throw new DemoGhostPlaybackError(
        `Unknown action type "${type}". Did you forget to register it?`
      );
    }
    return handler;
  }

  public has(type: ActionType): boolean {
    return this.handlers.has(type);
  }
}
