import {
  deserializeHighlights,
  find,
  flattenNestedHighlights,
  highlightRange,
  isHighlight,
  mergeSiblingHighlights,
  normalizeHighlights,
  removeHighlights,
  serializeHighlights,
} from "../common/helpers";
import * as Utils from "../common/utils";
import {
  optionsI,
  paramsImp,
  paramsImpClass,
  TextHighlighterI,
} from "../types";

export default class TextHighLighter implements TextHighlighterI {
  private options!: optionsI;

  constructor(private el: HTMLElement, custOptions?: optionsI) {
    if (!this.el) {
      throw "Missing anchor element";
    }
    // we override default options in case custOptions are provided
    this.options = {
      ...Utils.defaults(this.options, {
        color: "#ffff7b",
        highlightedClass: "highlighted",
        contextClass: "highlighter-context",
        onRemoveHighlight: () => true,
        onBeforeHighlight: () => true,
        onAfterHighlight: () => true,
      }),
      ...custOptions,
    };

    Utils.dom(this.el).addClass(this.options.contextClass);
    Utils.bindEvents(this.el, this);
  }

  destory() {
    Utils.unbindEvents(this.el, this);
    Utils.dom(this.el).removeClass(this.options.contextClass);
  }

  highlightHandler() {
    this.doHighlight();
  }

  /**
   * highlight selected element
   */

  doHighlight(keepRange = false) {
    // doHighlight(this.el, keepRange, this.options);

    const range = Utils.dom(this.el).getRange();
    let wrapper: HTMLSpanElement,
      createdHighlights: HTMLElement[],
      normalizedHighlights,
      timestamp: string;

    if (!range || range.collapsed) {
      return false;
    }
    let highlightMade = false;

    if (this.options.onBeforeHighlight(range)) {
      timestamp = (+new Date()).toString();
      wrapper = this.createWrapper();
      wrapper.setAttribute(Utils.TIMESTAMP_ATTR, timestamp);

      createdHighlights = highlightRange(this.el, range, wrapper);
      if (createdHighlights.length > 0) highlightMade = true;
      normalizedHighlights = normalizeHighlights(createdHighlights);
      this.options.onAfterHighlight(range, normalizedHighlights, timestamp);
    }

    if (!keepRange) {
      Utils.dom(this.el).removeAllRanges();
    }
    return highlightMade;
  }

  highlightRange(
    range: Range,
    wrapper: { cloneNode: (arg0: boolean) => unknown }
  ) {
    highlightRange(this.el, range, wrapper);
  }

  /**
   * Normalizes highlights. Ensures that highlighting is done with use of the smallest possible number of
   * wrapping HTML elements.
   * Flattens highlights structure and merges sibling highlights. Normalizes text nodes within highlights.
   * @param highlights - highlights to normalize.
   * @returns
   */

  normalizeHighlights(highlights: HTMLElement[]) {
    let normalizedHighlights: HTMLElement[];

    flattenNestedHighlights(highlights);
    mergeSiblingHighlights(highlights);

    // omit removed nodes
    normalizedHighlights = highlights.filter((el) => el.parentElement);

    normalizedHighlights = Utils.unique(normalizedHighlights);
    normalizedHighlights.sort((a, b) => {
      return a.offsetTop - b.offsetTop || a.offsetLeft - b.offsetLeft;
    });

    return normalizedHighlights;
  }

  flattenNestedHighlights(highlights: HTMLElement[]) {
    flattenNestedHighlights(highlights);
  }

  /**
   * * Merges sibling highlights and normalizes descendant text nodes.
   * Note: this method changes input highlights - their order and number after calling this method may change.
   * @param highlights
   */

  mergeSiblingHighlights(highlights: HTMLElement[]) {
    const shouldMerge = (current: Node, node: Node) => {
      return (
        node &&
        node.nodeType === Utils.NODE_TYPE.ELEMENT_NODE &&
        Utils.haveSameColor(current, node) &&
        isHighlight(node as HTMLElement)
      );
    };

    highlights.forEach((highlight) => {
      const prev = highlight.previousSibling,
        next = highlight.nextSibling;

      if (prev && shouldMerge(highlight, prev)) {
        Utils.dom(highlight).prepend(prev.childNodes);
        Utils.dom(prev).remove();
      }
      if (next && shouldMerge(highlight, next)) {
        Utils.dom(highlight).append(next.childNodes);
        Utils.dom(next).remove();
      }

      Utils.dom(highlight).normalizeTextNodes();
    });
  }

  setColor(color: string) {
    this.options.color = color;
  }

  getColor() {
    return this.options.color;
  }

  removeHighlights(element?: HTMLElement) {
    const container = element ?? this.el;
    removeHighlights(container, this.options);
  }

  /**
   * Returns highlights from given container.
   * @param params
   * @returns
   */

  getHighlights(params?: paramsImp) {
    if (!params) params = new paramsImpClass();
    params = Utils.defaults(params, {
      container: this.el,
      andSelf: true,
      grouped: false,
    });

    if (params.container) {
      const nodeList = params.container.querySelectorAll(
        "[" + Utils.DATA_ATTR + "]"
      );
      let highlights = Array.prototype.slice.call(nodeList);

      if (
        params.andSelf === true &&
        params.container.hasAttribute(Utils.DATA_ATTR)
      ) {
        highlights.push(params.container);
      }

      if (params.grouped) {
        highlights = Utils.groupHighlights(highlights);
      }
      return highlights;
    }
  }

  isHighli(el: HTMLElement) {
    return (
      el &&
      el.nodeType === Utils.NODE_TYPE.ELEMENT_NODE &&
      el.hasAttribute(Utils.DATA_ATTR)
    );
  }

  serializeHighlights() {
    return serializeHighlights(this.el);
  }

  deserializeHighlights(json: string) {
    deserializeHighlights(this.el, json);
  }

  find(text: string, caseSensitive: boolean) {
    find(this.el, text, caseSensitive, this.options);
  }

  createWrapper() {
    const span = document.createElement("span");
    if (this.options.color) {
      span.style.backgroundColor = this.options.color;
      span.setAttribute("data-backgroundcolor", this.options.color);
    }
    if (this.options.highlightedClass)
      span.className = this.options.highlightedClass;
    return span;
  }
}
