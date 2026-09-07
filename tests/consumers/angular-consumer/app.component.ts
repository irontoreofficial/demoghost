import { Component, inject } from "@angular/core";
import { DemoGhostService, DemoGhostTargetDirective } from "@demoghost/angular";
import { click, type } from "demoghost";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [DemoGhostTargetDirective],
  template: ` <button demoGhostTarget="tour-btn" (click)="startTour()">Start Tour</button> `
})
export class AppComponent {
  private demoGhost = inject(DemoGhostService);

  startTour() {
    this.demoGhost.play([click("@tour-btn"), type("#search", "Angular 19 test")]);
  }
}
