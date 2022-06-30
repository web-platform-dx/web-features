# Supported in all

* [x]  :white_check_mark: [`api.CSSStyleSheet.deleteRule`](https://developer.mozilla.org/docs/Web/API/CSSStyleSheet/deleteRule) ([spec](https://drafts.csswg.org/cssom/#dom-cssstylesheet-deleterule), [demo](demos/api.CSSStyleSheet.deleteRule.html), chrome :white_check_mark: firefox :white_check_mark: safari :white_check_mark:) - Works reliably, but changes are not always reflected in web dev tools. Bug trackers: [1](https://bugs.webkit.org/show_bug.cgi?id=141450)
* [x]  :white_check_mark: [`api.DOMMatrixReadOnly.transformPoint` :hole:](https://developer.mozilla.org/docs/Web/API/DOMMatrixReadOnly/transformPoint) ([spec](https://drafts.fxtf.org/geometry/#dom-dommatrixreadonly-transformpoint), [demo](demos/api.DOMMatrixReadOnly.transformPoint.html), chrome :white_check_mark: firefox :white_check_mark: safari :white_check_mark:) - Works but isn't documented on MDN (despite BCD linking there).
* [ ] :new: :test_tube: :thinking: [`api.MediaKeyStatusMap.get`](https://developer.mozilla.org/docs/Web/API/MediaKeyStatusMap/get) ([spec](https://w3c.github.io/encrypted-media/#dom-mediakeystatusmap-get)) - Part of Encrypted Media Extensions, which is hard to write a quick test for.
* [x]  :white_check_mark: [`api.MediaTrackSettings`](https://developer.mozilla.org/docs/Web/API/MediaTrackSettings) ([spec](https://w3c.github.io/mediacapture-main/#media-track-settings,https://w3c.github.io/mediacapture-screen-share/#extensions-to-mediatracksettings), [demo](demos/api.MediaTrackSettings.html), chrome :white_check_mark: firefox :white_check_mark: safari :white_check_mark:) - Works, but the amount of settings returned are different between browsers. On desktop MacOS 12.4 the settings returned for my microphone are 4 in Safari 15.5, 6 in Firefox 101 and 8 in Chrome 102. deviceId and echoCancellation being the only two settings included in all three. SO: [1](https://stackoverflow.com/questions/71072144/is-there-a-way-to-get-aspect-ratio-of-the-webcam-in-firefox),[2](https://stackoverflow.com/questions/12021159/webrtc-get-webcams-aspect-ratio/58160251#58160251)
* [x]  :white_check_mark: [`api.MediaTrackSettings.echoCancellation`](https://developer.mozilla.org/docs/Web/API/MediaTrackSettings/echoCancellation) ([spec](https://w3c.github.io/mediacapture-main/#dom-mediatracksettings-echocancellation), [demo](demos/api.MediaTrackSettings.echoCancellation.html), chrome :white_check_mark: firefox :white_check_mark: safari :white_check_mark:)
* [ ] :new: [`api.Navigator.geolocation.secure_context_required`](https://developer.mozilla.org/docs/Web/API/Navigator/geolocation)
* [ ] :new: [`api.StorageEvent.oldValue`](https://developer.mozilla.org/docs/Web/API/StorageEvent/oldValue) ([spec](https://html.spec.whatwg.org/multipage/webstorage.html#dom-storageevent-oldvalue-dev))
* [ ] :new: [`api.SVGFEMorphologyElement.result`](https://developer.mozilla.org/docs/Web/API/SVGFEMorphologyElement) ([spec](https://drafts.fxtf.org/filter-effects/#dom-svgfilterprimitivestandardattributes-result))
* [ ] :new: [`api.WebGL2RenderingContext.bufferSubData`](https://developer.mozilla.org/docs/Web/API/WebGL2RenderingContext/bufferSubData)
* [ ] :new: [`api.WebGL2RenderingContext.getInternalformatParameter`](https://developer.mozilla.org/docs/Web/API/WebGL2RenderingContext/getInternalformatParameter) ([spec](https://www.khronos.org/registry/webgl/specs/latest/2.0/#3.7.5))
* [ ] :new: [`css.properties.column-count`](https://developer.mozilla.org/docs/Web/CSS/column-count) ([spec](https://drafts.csswg.org/css-multicol/#cc))
* [ ] :new: [`css.properties.font-variant`](https://developer.mozilla.org/docs/Web/CSS/font-variant) ([spec](https://drafts.csswg.org/css-fonts/#font-variant-prop))
* [ ] :new: [`css.properties.grid-template-columns.fit-content`](https://developer.mozilla.org/docs/Web/CSS/fit-content) ([spec](https://drafts.csswg.org/css-sizing-4/#sizing-values))
* [ ] :new: [`css.properties.justify-content.flex_context.space-evenly`](https://developer.mozilla.org/docs/Web/CSS/justify-content)
* [ ] :new: [`css.properties.list-style-type.urdu`](https://developer.mozilla.org/docs/Web/CSS/list-style-type)
* [ ] :new: [`css.properties.max-inline-size.fit-content`](https://developer.mozilla.org/docs/Web/CSS/max-inline-size)
* [ ] :new: [`css.properties.overflow-wrap`](https://developer.mozilla.org/docs/Web/CSS/overflow-wrap) ([spec](https://drafts.csswg.org/css-text/#overflow-wrap-property))
* [ ] :new: [`css.properties.print-color-adjust`](https://developer.mozilla.org/docs/Web/CSS/print-color-adjust) ([spec](https://drafts.csswg.org/css-color-adjust/#propdef-print-color-adjust))
* [ ] :new: [`css.properties.transform-origin.support_in_svg`](https://developer.mozilla.org/docs/Web/CSS/transform-origin)
* [ ] :new: [`css.types.angle.turn`](https://developer.mozilla.org/docs/Web/CSS/angle#turn)
* [ ] :new: [`javascript.builtins.Date.getTimezoneOffset`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset) ([spec](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date.prototype.gettimezoneoffset))
* [ ] :new: [`javascript.builtins.Intl.DisplayNames.of`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames/of) ([spec](https://tc39.es/ecma402/#sec-Intl.DisplayNames.prototype.of))
* [ ] :new: [`javascript.builtins.Intl.NumberFormat.NumberFormat.options_unit_parameter`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat)
* [ ] :new: [`javascript.builtins.Math.round`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Math/round) ([spec](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-math.round))
* [ ] :new: [`javascript.builtins.ReferenceError`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ReferenceError) ([spec](https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-native-error-types-used-in-this-standard-referenceerror))
* [ ] :new: [`javascript.builtins.String.fromCharCode`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode) ([spec](https://tc39.es/ecma262/multipage/text-processing.html#sec-string.fromcharcode))
* [ ] :new: [`javascript.builtins.Symbol.for`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Symbol/for) ([spec](https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-symbol.for))
* [x]  :white_check_mark: [`javascript.grammar.null_literal`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Lexical_grammar#Null_literal) ([spec](https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#sec-null-literals)) - See `javascript.operators.less_than_or_equal`
* [x]  :white_check_mark: [`javascript.operators.bitwise_or`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Bitwise_OR) ([spec](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#prod-BitwiseORExpression)) - See `javascript.operators.less_than_or_equal`
* [x]  :white_check_mark: [`javascript.operators.less_than_or_equal`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Less_than_or_equal) ([spec](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-relational-operators)) - Some oddities in the data stemming from the fact that BCD has minimum versions for this feature despite it probably being around from the start wherever this feature has been precent. Eg. Node.js is said to have only supported it since 0.10.0, but that since BCD has decided that the minimum version to include for Node.js is 0.10.0, making eg MDN docs confusing, as it presents it as not being fully precent before 0.10.0. Same goes for Edge 12, Firefox 4 for Android etc. Bug trackers: [1](https://github.com/mdn/browser-compat-data/issues/6861),[2](https://github.com/mdn/browser-compat-data/pull/5923),[3](https://github.com/mdn/browser-compat-data/pull/4784),[4](https://github.com/mdn/browser-compat-data/issues/4772),[5](https://github.com/mdn/browser-compat-data/pull/4923),[6](https://github.com/mdn/browser-compat-data/pull/942),[7](https://github.com/mdn/browser-compat-data/pull/5621)
# Other

* [ ] :new: [`api.CSSSkew`](https://developer.mozilla.org/docs/Web/API/CSSSkew) ([spec](https://drafts.css-houdini.org/css-typed-om/#cssskew))
* [ ] :new: [`api.Event.explicitOriginalTarget`](https://developer.mozilla.org/docs/Web/API/Event/explicitOriginalTarget)
* [ ] :new: [`api.EventTarget.addEventListener.options_parameter.options_signal_parameter`](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener) ([spec](https://dom.spec.whatwg.org/#dom-addeventlisteneroptions-signal))
* [ ] :new: [`api.FetchEvent.respondWith.resource_url`](https://developer.mozilla.org/docs/Web/API/FetchEvent/respondWith)
* [ ] :new: [`api.FileSystemDirectoryReader`](https://developer.mozilla.org/docs/Web/API/FileSystemDirectoryReader) ([spec](https://wicg.github.io/entries-api/#api-directoryreader))
* [ ] :new: [`api.MathMLElement.style`](https://developer.mozilla.org/docs/Web/API/MathMLElement) ([spec](https://drafts.csswg.org/cssom/#dom-elementcssinlinestyle-style))
* [ ] :new: [`api.Navigation.navigatesuccess_event`](https://chromestatus.com/feature/6232287446302720) ([spec](https://wicg.github.io/navigation-api/#dom-navigation-onnavigatesuccess))
* [ ] :new: [`api.PaymentInstruments.set`](https://developer.mozilla.org/docs/Web/API/PaymentInstruments/set) ([spec](https://w3c.github.io/payment-handler/#dom-paymentinstruments-set))
* [ ] :new: [`api.Performance.resourcetimingbufferfull_event`](https://developer.mozilla.org/docs/Web/API/Performance/resourcetimingbufferfull_event) ([spec](https://w3c.github.io/resource-timing/#dom-performance-onresourcetimingbufferfull))
* [ ] :new: [`api.XRSession.requestLightProbe`](https://developer.mozilla.org/docs/Web/API/XRSession/requestLightProbe) ([spec](https://immersive-web.github.io/lighting-estimation/#dom-xrsession-requestlightprobe))
* [ ] :new: [`css.at-rules.supports.selector`](https://developer.mozilla.org/docs/Web/CSS/@supports)
* [ ] :new: [`css.properties.hyphens.german_reformed_orthography`](https://developer.mozilla.org/docs/Web/CSS/hyphens)
* [ ] :new: [`css.properties.hyphens.slovenian`](https://developer.mozilla.org/docs/Web/CSS/hyphens)
* [ ] :new: [`css.properties.list-style-type.tigrinya-er-abegede`](https://developer.mozilla.org/docs/Web/CSS/list-style-type)
* [ ] :new: [`css.properties.text-decoration-skip-ink`](https://developer.mozilla.org/docs/Web/CSS/text-decoration-skip-ink) ([spec](https://drafts.csswg.org/css-text-decor-4/#text-decoration-skip-ink-property))
* [ ] :new: [`css.properties.text-underline-position`](https://developer.mozilla.org/docs/Web/CSS/text-underline-position) ([spec](https://drafts.csswg.org/css-text-decor/#text-underline-position-property))
* [ ] :new: [`css.properties.user-select.all`](https://developer.mozilla.org/docs/Web/CSS/user-select)
* [ ] :new: [`css.types.color.color`](https://developer.mozilla.org/docs/Web/CSS/color_value/color) ([spec](https://drafts.csswg.org/css-color/#color-function))
* [ ] :new: [`css.types.frequency.hz`](https://developer.mozilla.org/docs/Web/CSS/frequency)
* [ ] :new: [`css.types.resolution.dpcm`](https://developer.mozilla.org/docs/Web/CSS/resolution)
* [ ] :new: [`javascript.builtins.Date.toSource`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date/toSource)
* [ ] :new: [`javascript.builtins.Error.fileName`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error/fileName)
* [ ] :new: [`javascript.builtins.Temporal.Duration.constructor`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Temporal/Duration/constructor) ([spec](https://tc39.es/proposal-temporal/#sec-temporal-duration-constructor))
* [ ] :new: [`javascript.builtins.Temporal.Duration.nanoseconds`](https://developer.mozilla.org/docs/web/javascript/reference/global_objects/temporal/duration/nanoseconds) ([spec](https://tc39.es/proposal-temporal/#sec-get-temporal.duration.prototype.nanoseconds))
* [ ] :new: [`javascript.builtins.Temporal.Duration.years`](https://developer.mozilla.org/docs/web/javascript/reference/global_objects/temporal/duration/years) ([spec](https://tc39.es/proposal-temporal/#sec-get-temporal.duration.prototype.years))
* [ ] :new: [`javascript.builtins.Temporal.PlainDate.monthsInYear`](https://developer.mozilla.org/docs/web/javascript/reference/global_objects/temporal/plaindate/monthsinyear) ([spec](https://tc39.es/proposal-temporal/#sec-get-temporal.plaindate.prototype.monthsinyear))
* [ ] :new: [`javascript.builtins.Temporal.PlainDate.withCalendar`](https://developer.mozilla.org/docs/web/javascript/reference/global_objects/temporal/plaindate/withcalendar) ([spec](https://tc39.es/proposal-temporal/#sec-temporal.plaindate.prototype.withcalendar))
* [ ] :new: [`javascript.builtins.Temporal.PlainMonthDay.constructor`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainMonthDay/constructor) ([spec](https://tc39.es/proposal-temporal/#sec-temporal-plainmonthday-constructor))
* [ ] :new: [`javascript.builtins.Temporal.PlainTime.microsecond`](https://developer.mozilla.org/docs/web/javascript/reference/global_objects/temporal/plaintime/microsecond) ([spec](https://tc39.es/proposal-temporal/#sec-get-temporal.plaintime.prototype.microsecond))
* [ ] :new: [`javascript.builtins.Temporal.PlainTime.with`](https://developer.mozilla.org/docs/web/javascript/reference/global_objects/temporal/plaintime/with) ([spec](https://tc39.es/proposal-temporal/#sec-temporal.plaintime.prototype.with))

# Symbol explanation

## Success status

- :white_check_mark: - success
- :warning: - partial failure
- :x: - failure

## Other

- :new: - feature hasn't yet been looked at in this work
- :test_tube: - feature is experimental
- :thinking: - feature is hard to make demo of
- :hole: - documentation page leads nowhere

