import {
  Injectable,
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import {
  DemoGhost,
  DemoScenario,
  DemoStep,
  PlaybackController,
  PlaybackOptions,
  RecorderOptions,
  EventRecorder
} from "demoghost";

@Injectable({
  providedIn: "root"
})
export class DemoGhostService {
  public play(scenario: DemoScenario | DemoStep[], options?: PlaybackOptions): PlaybackController {
    return DemoGhost.play(scenario, options);
  }

  public record(options?: RecorderOptions): EventRecorder {
    return DemoGhost.record(options);
  }

  public serialize(scenario: DemoScenario): string {
    return DemoGhost.serialize(scenario);
  }

  public deserialize(json: string): DemoScenario {
    return DemoGhost.deserialize(json);
  }
}

@Directive({
  selector: "[demoGhostTarget]",
  standalone: true
})
export class DemoGhostTargetDirective implements OnInit, OnChanges {
  @Input("demoGhostTarget") demoId = "";

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.updateAttribute();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.updateAttribute();
  }

  private updateAttribute(): void {
    if (this.demoId && this.el.nativeElement) {
      this.el.nativeElement.setAttribute("data-demoghost-id", this.demoId);
    }
  }
}
