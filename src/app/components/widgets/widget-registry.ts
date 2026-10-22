import { Type } from '@angular/core';
import { TemperatureWidgetComponent } from './temperature-widget.component';
import { ImageTokenWidgetComponent } from './image-token-widget.component';
import { AgentLoopWidgetComponent } from './agent-loop-widget.component';

/** Maps `data-widget="<name>"` to the component mounted into that element. */
export const WIDGET_REGISTRY: Record<string, Type<unknown>> = {
  temperature: TemperatureWidgetComponent,
  'image-tokens': ImageTokenWidgetComponent,
  'agent-loop': AgentLoopWidgetComponent,
};
