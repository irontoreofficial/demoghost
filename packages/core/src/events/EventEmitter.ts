export class EventEmitter<Events extends Record<string, any>> {
  private listeners: { [K in keyof Events]?: Array<(data: Events[K]) => void> } = {};

  public on<K extends keyof Events>(event: K, listener: (data: Events[K]) => void): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
    return () => this.off(event, listener);
  }

  public off<K extends keyof Events>(event: K, listener: (data: Events[K]) => void): void {
    const list = this.listeners[event];
    if (!list) return;
    this.listeners[event] = list.filter(l => l !== listener);
  }

  public emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const list = this.listeners[event];
    if (!list || list.length === 0) return;
    // Copy array to protect against modification during iteration
    [...list].forEach(listener => {
      try {
        listener(data);
      } catch (err) {
        console.error(`[DemoGhost] Error in event listener for "${String(event)}":`, err);
      }
    });
  }

  public removeAllListeners(): void {
    this.listeners = {};
  }
}
