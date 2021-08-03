// TextHighLighterv2 client
import { TextHighlighterCounstructor } from "../src/types";
import TextHighlighter from "../src";

interface Window {
  TextHighlighter: TextHighlighterCounstructor;
}

declare let window: Window;
window.TextHighlighter = TextHighlighter;
