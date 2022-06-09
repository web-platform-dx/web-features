/** @type {Readonly<Record<string,string|false>>} */
export const polyfillToBcdFeatureMapping = Object.freeze({
  'Event.focusin': 'Element.focusin_event',
  'Event.hashchange': 'Window.hashchange_event',
  'document.visibilityState': 'Document.visibilityState',
  'document.currentScript': 'Document.currentScript',
  'document.elementsFromPoint': 'Document.elementsFromPoint',
  'Number.Epsilon': 'Number.EPSILON',
  'location.origin': 'Location.origin',
  'requestAnimationFrame': 'Window.requestAnimationFrame',
  '~html5-elements': false,
  'Element.prototype.dataset': 'HTMLElement.prototype.dataset',
  'Element.prototype.inert': 'HTMLElement.prototype.inert',
  'devicePixelRatio': 'Window.devicePixelRatio',
  'matchMedia': 'Window.matchMedia',
  'requestIdleCallback': 'Window.requestIdleCallback',
  'setImmediate': 'Window.setImmediate',
  'navigator.sendBeacon': 'Navigator.sendBeacon',
  'performance.now': 'Performance.now',
  'screen.orientation': 'Screen.orientation',
  // Neither API:s or javascript builtins
  'Element.prototype.placeholder': 'html.elements.textarea.placeholder',
  'smoothscroll': 'css.properties.scroll-behavior',
  // Somewhat possible to map, but not fully accurate
  'MediaQueryList.prototype.addEventListener': 'MediaQueryList.EventTarget_inheritance',
  // Missing in BCD
  'console.markTimeline': false,
  'console.profiles': false,
  'console.timeline': false,
  'console.timelineEnd': false,
});
