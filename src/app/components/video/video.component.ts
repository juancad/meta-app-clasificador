import { OnInit, Component, HostListener } from '@angular/core';
import { async } from '@angular/core/testing';
import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-root',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})

export class VideoComponent implements OnInit {
  width: number = 400;
  height: number = 400;
  video: any;
  canvas1: any;
  canvas2: any;
  ctx: any;
  currentStream: any;
  facingMode: String = "user";
  modelo: any = null;
  respuesta: String = "Cargando respuesta.";
  resultado!: Float32Array;

  constructor() {
  }

  ngOnInit(): void {
    this.video = document.getElementById('video');
    this.canvas1 = document.getElementById('canvas1');
    this.canvas2 = document.getElementById('canvas2');
    this.ctx = this.canvas1.getContext("2d");

    this.loadModel();
  }

  async loadModel() {
    console.log("Cargando modelo...");
    this.modelo = await tf.loadLayersModel("/assets/perros-gatos/model.json");
    console.log("Modelo cargado.");
  }

  @HostListener('window:load')
  onLoad() {
    this.mostrarCamara();
  }

  mostrarCamara() {
    this.video = <HTMLVideoElement>document.getElementById("video");
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { facingMode: "user", width: this.width, height: this.height}
      })
      .then(stream => {
        this.video.srcObject = stream;
        this.video.onloadedmetadata = () => {
          this.video.play();
        };
        this.procesarCamara();
        this.predecir();
      });
  }

  procesarCamara() {
    this.ctx.drawImage(this.video, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
    setTimeout(this.procesarCamara.bind(this), 20);
  }

  predecir() {
    if (this.modelo != null) {
      this.resample_single(this.canvas1, 100, 100, this.canvas2);

      //Hacer la predicción
      let ctx2 = this.canvas1.getContext("2d");
      let imgData = ctx2.getImageData(0, 0, 100, 100);

      let arr = [];
      let arr100 = [];

      for (let p = 0; p < imgData.data.length; p += 4) {
        let rojo = imgData.data[p] / 255;
        let verde = imgData.data[p + 1] / 255;
        let azul = imgData.data[p + 2] / 255;

        let gris = (rojo + verde + azul) / 3;

        arr100.push([gris]);
        if (arr100.length == 100) {
          arr.push(arr100);
          arr100 = [];
        }
      }

      arr = [arr];

      let tensor = tf.tensor4d(arr);
      let resultado = this.modelo.predict(tensor).dataSync();

      if (resultado <= .5) {
        this.respuesta = "Gato";
      } else {
        this.respuesta = "Perro";
      }
      this.resultado = resultado;

    }

    setTimeout(this.predecir.bind(this), 100);
  }

  resample_single(canvas: HTMLCanvasElement, width: number, height: number, resize_canvas: HTMLCanvasElement): void {
    let width_source = canvas.width;
    let height_source = canvas.height;
    width = Math.round(width);
    height = Math.round(height);

    let ratio_w = width_source / width;
    let ratio_h = height_source / height;
    let ratio_w_half = Math.ceil(ratio_w / 2);
    let ratio_h_half = Math.ceil(ratio_h / 2);

    let ctx = canvas.getContext("2d");
    let ctx2 = resize_canvas.getContext("2d");

    if (ctx != null && ctx2 != null) {
      let img = ctx.getImageData(0, 0, width_source, height_source);
      let img2 = ctx2.createImageData(width, height);
      let data = img.data;
      let data2 = img2.data;

      for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
          let x2 = (i + j * width) * 4;
          let weight = 0;
          let weights = 0;
          let weights_alpha = 0;
          let gx_r = 0;
          let gx_g = 0;
          let gx_b = 0;
          let gx_a = 0;
          let center_y = (j + 0.5) * ratio_h;
          let yy_start = Math.floor(j * ratio_h);
          let yy_stop = Math.ceil((j + 1) * ratio_h);
          for (let yy = yy_start; yy < yy_stop; yy++) {
            let dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
            let center_x = (i + 0.5) * ratio_w;
            let w0 = dy * dy; //pre-calc part of w
            let xx_start = Math.floor(i * ratio_w);
            let xx_stop = Math.ceil((i + 1) * ratio_w);
            for (let xx = xx_start; xx < xx_stop; xx++) {
              let dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
              let w = Math.sqrt(w0 + dx * dx);
              if (w >= 1) {
                //pixel too far
                continue;
              }
              //hermite filter
              weight = 2 * w * w * w - 3 * w * w + 1;
              let pos_x = 4 * (xx + yy * width_source);
              //alpha
              gx_a += weight * data[pos_x + 3];
              weights_alpha += weight;
              //colors
              if (data[pos_x + 3] < 255)
                weight = weight * data[pos_x + 3] / 250;
              gx_r += weight * data[pos_x];
              gx_g += weight * data[pos_x + 1];
              gx_b += weight * data[pos_x + 2];
              weights += weight;
            }
          }
          data2[x2] = gx_r / weights;
          data2[x2 + 1] = gx_g / weights;
          data2[x2 + 2] = gx_b / weights;
          data2[x2 + 3] = gx_a / weights_alpha;
        }
      }
    }
  }
}
