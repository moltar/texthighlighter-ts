export interface TextHighlighterI {
  doHighlight(keepRange?: boolean): void;
  deserializeHighlights(json: string): void;
  serializeHighlights(): void;
  removeHighlights(el: HTMLElement): void;
}

export interface TextHighlighterCounstructor {
  new (el: HTMLElement, custOptions: optionsI): TextHighlighterI;
}

export interface TextRange {
  collapse(arg0: boolean): boolean;
  select(): void;
  parentElement(): HTMLElement;
  findText(text: any, arg1: number, arg2: number): any;
  moveToElementText(el: any): any;
}

export interface highlightI {
  highlightHandler: any;
  options: optionsI;
  el: HTMLElement;
}

export interface optionsI {
  color?: string;
  highlightedClass: string;
  contextClass: string;
  onRemoveHighlight: { (...e: unknown[]): boolean };
  onBeforeHighlight: { (...e: unknown[]): boolean };
  onAfterHighlight: { (...e: unknown[]): boolean };
}

export interface paramsImp {
  container?: HTMLElement;
  andSelf?: boolean;
  grouped?: boolean;
}

export class paramsImpClass implements paramsImp {}

export class paramsClass implements paramsImp {}

export interface hlDescriptorI {
  wrapper: string;
  textContent: string;
  color: string;
  hlpaths?: number[];
  path: string;
  offset: number;
  length: number;
}
