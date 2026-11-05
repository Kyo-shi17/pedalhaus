import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent {
  readonly theme = inject(ThemeService);
  showSplash = true;

  private readonly changeDetector = inject(ChangeDetectorRef);

  constructor() {
    window.setTimeout(() => {
      this.showSplash = false;
      this.changeDetector.detectChanges();
    }, 1600);
  }
}
