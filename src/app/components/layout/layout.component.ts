import { Component, Input, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ScrollToTopComponent } from '../scroll-to-top/scroll-to-top.component';
import { PullCordComponent } from '../pull-cord/pull-cord.component';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ScrollToTopComponent,
    PullCordComponent,
  ],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  @Input() showSidebar: boolean = true;
  @Input() sidebarContent?: string;

  private readonly themeService = inject(ThemeService);

  /** Pull-cord toggles the theme. Bound as an @Input callback. */
  toggleTheme = (): void => this.themeService.toggle();

  /** aria-pressed = "the light is on" (i.e. light mode). */
  get isLight(): boolean {
    return this.themeService.theme() === 'light';
  }
}
