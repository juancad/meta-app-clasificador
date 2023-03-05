export class Configuration {
    name: string;
    description: string;
    modelURL: string;
    titleColor: string;
    contentColor: string;
    backgroundColor: string;
    fontFamily: string;
    width: number;
    height: number;
    align: Align;

    constructor(name: string, description: string, modelURL: string, titleColor: string, contentColor: string, backgroundColor: string, fontFamily: string, width: number, height: number, align: Align) {
        this.name = name;
        this.description = description;
        this.modelURL = modelURL;
        this.titleColor = titleColor;
        this.contentColor = contentColor;
        this.backgroundColor = backgroundColor;
        this.fontFamily = fontFamily;
        this.width = width;
        this.height = height;
        this.align = align;
    }
}

export enum Align {
    center,
    right,
    left,
    justify
  }