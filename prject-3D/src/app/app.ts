import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Scene3d } from './components/scene3d/scene3d';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Scene3d],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('prject-3D');
}
