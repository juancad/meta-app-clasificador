import { Component, ViewChild } from '@angular/core';
import { Configuration } from 'src/app/models/configuration.model';
import { Align } from 'src/app/models/configuration.model';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent {
  @ViewChild('description') description: any;
  configuration: Configuration;
  step = 0;
  Align = Align;
  
  constructor() {
    this.configuration = new Configuration("Perros y gatos", "Permite identificar perros o gatos.", "./assets/perros-gatos/model.json", "#000000", "#000000", "#FFFFFF", "Calibri", 100, 100, Align.center);
  }

  setDescription(description: string) {
    this.configuration.description = description;
  }

  setStep(index: number) {
    this.step = index;
  }

  setAlign(align: Align) {
    this.configuration.align = align;
  }
}
