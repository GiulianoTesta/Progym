// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string'], importedStringConstants: ''};
  return new CompiledApp(
      await _compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string'], importedStringConstants: ''};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

let _isCompileStreamingSupported;
async function _compileStreaming(source, builtins) {
  _isCompileStreamingSupported ??= WebAssembly.compileStreaming(
    new Response(
      new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,2,23,1,14,119,97,115,109,58,106,115,45,115,116,114,105,110,103,4,99,97,115,116,0,0]),
      {headers: {'Content-Type': 'application/wasm'}},
    ),
    builtins,
  ).then(() => false, (e) => e instanceof WebAssembly.CompileError);
  if (await _isCompileStreamingSupported) {
    return WebAssembly.compileStreaming(source, builtins);
  }
  return WebAssembly.compile(await (await source).arrayBuffer(), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: b => !!b,
      AC: Function.prototype.call.bind(DataView.prototype.setUint16),
      AD: x0 => x0.width,
      AE: (o, p) => p in o,
      AF: x0 => x0.key,
      AG: (x0,x1) => x0.querySelectorAll(x1),
      AH: (x0,x1) => x0.writeText(x1),
      AI: (a, i) => a.splice(i, 1),
      AJ: x0 => new window.ImageDecoder(x0),
      AK: (x0,x1) => { x0.scrollLeft = x1 },
      AL: (x0,x1) => { x0.id = x1 },
      B: s => printToConsole(s),
      BB: () => globalThis.document,
      BC: Function.prototype.call.bind(DataView.prototype.setUint8),
      BD: x0 => x0.screen,
      BE: (x0,x1) => { x0.textContent = x1 },
      BF: x0 => x0.identifier,
      BG: (x0,x1) => x0.requestAnimationFrame(x1),
      BH: x0 => x0.unlock(),
      BI: a => a.pop(),
      BJ: x0 => x0.name,
      BK: (x0,x1) => { x0.spellcheck = x1 },
      BL: x0 => globalThis.URL.revokeObjectURL(x0),
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: Function.prototype.call.bind(DataView.prototype.setInt8),
      CD: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      CE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CF: x0 => x0.touches,
      CG: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CH: (x0,x1) => x0.lock(x1),
      CI: () => new AbortController(),
      CJ: x0 => x0.repetitionCount,
      CK: (x0,x1) => { x0.disabled = x1 },
      CL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (x0,x1) => x0.focus(x1),
      DC: Function.prototype.call.bind(DataView.prototype.getInt8),
      DD: x0 => x0.tabIndex,
      DE: x0 => x0.matches,
      DF: x0 => x0.pressure,
      DG: x0 => x0.now(),
      DH: x0 => x0.orientation,
      DI: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      DJ: x0 => x0.frameCount,
      DK: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9) => x0.drawImage(x1,x2,x3,x4,x5,x6,x7,x8,x9),
      DL: (x0,x1,x2,x3) => x0.toBlob(x1,x2,x3),
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: () => ({}),
      EC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      ED: (x0,x1) => x0.contains(x1),
      EE: (x0,x1) => x0.matchMedia(x1),
      EF: x0 => x0.tiltY,
      EG: x0 => x0.performance,
      EH: (x0,x1) => x0.querySelector(x1),
      EI: (x0,x1) => globalThis.fetch(x0,x1),
      EJ: x0 => x0.selectedTrack,
      EK: (x0,x1) => x0.getContext(x1),
      EL: x0 => x0.size,
      F: () => new Error().stack,
      FB: (o, p, v) => o[p] = v,
      FC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      FD: x0 => x0.activeElement,
      FE: x0 => x0.matches,
      FF: x0 => x0.tiltX,
      FG: (d, digits) => d.toFixed(digits),
      FH: (x0,x1) => { x0.title = x1 },
      FI: (x0,x1) => x0.get(x1),
      FJ: x0 => x0.completed,
      FK: (x0,x1) => { x0.height = x1 },
      FL: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      GD: x0 => x0.parentNode,
      GE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      GF: x0 => x0.pointerType,
      GG: x0 => x0.maxHeight,
      GH: (x0,x1) => x0.vibrate(x1),
      GI: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      GJ: x0 => x0.ready,
      GK: (x0,x1) => { x0.width = x1 },
      GL: (x0,x1,x2,x3,x4,x5) => x0.drawImage(x1,x2,x3,x4,x5),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.tagName,
      HE: f => f.dartFunction,
      HF: x0 => x0.pointerId,
      HG: x0 => x0.maxWidth,
      HH: x0 => x0.arrayBuffer(),
      HI: (x0,x1) => x0.forEach(x1),
      HJ: x0 => x0.tracks,
      HK: (x0,x1) => x0.transferFromImageBitmap(x1),
      HL: x0 => x0.height,
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.target,
      IE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      IF: x0 => x0.getCoalescedEvents(),
      IG: x0 => x0.minHeight,
      IH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      II: x0 => x0.name,
      IJ: () => globalThis.window.ImageDecoder,
      IK: x0 => x0.rasterEndMilliseconds,
      IL: x0 => x0.width,
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      JD: x0 => x0.clientY,
      JE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      JF: s => s.trimLeft(),
      JG: x0 => x0.minWidth,
      JH: x0 => x0.status,
      JI: x0 => x0.statusText,
      JJ: x0 => x0.decode(),
      JK: x0 => x0.rasterStartMilliseconds,
      JL: (x0,x1) => x0.getContext(x1),
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.clientX,
      KE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      KF: s => s.toUpperCase(),
      KG: (x0,x1) => x0.removeProperty(x1),
      KH: (x0,x1) => x0.fetch(x1),
      KI: x0 => x0.url,
      KJ: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      KK: x0 => x0.imageBitmaps,
      KL: (x0,x1) => { x0.height = x1 },
      L: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      LB: x0 => new Uint8ClampedArray(x0),
      LC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      LD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      LE: (o, i) => o[i],
      LF: x0 => x0.pop(),
      LG: (x0,x1) => x0.add(x1),
      LH: x0 => x0.content,
      LI: x0 => x0.status,
      LJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      LK: x0 => x0.canvasKitMaximumSurfaces,
      LL: (x0,x1) => { x0.width = x1 },
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      MD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      ME: o => o.length,
      MF: x0 => x0.flags,
      MG: x0 => x0.data,
      MH: x0 => x0.document,
      MI: x0 => x0.cancel(),
      MJ: (x0,x1,x2) => x0.addEventListener(x1,x2),
      MK: x0 => x0.nextSibling,
      ML: x0 => x0.height,
      N: o => String(o),
      NB: x0 => new Uint16Array(x0),
      NC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      ND: (x0,x1) => x0.closest(x1),
      NE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      NF: (a, s) => a.join(s),
      NG: (x0,x1) => x0.removeAttribute(x1),
      NH: () => typeof dartUseDateNowForTicks !== "undefined",
      NI: x0 => x0.getReader(),
      NJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NK: (x0,x1) => x0.debug(x1),
      NL: x0 => x0.width,
      O: o => o === undefined,
      OB: x0 => new Int32Array(x0),
      OC: (x0,x1) => x0.querySelector(x1),
      OD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      OE: x0 => x0.language,
      OF: (x0,x1) => x0.error(x1),
      OG: (x0,x1) => { x0.value = x1 },
      OH: () => Date.now(),
      OI: x0 => x0.read(),
      OJ: x0 => x0.send(),
      OK: x0 => x0.hostElement,
      OL: (x0,x1) => { x0.src = x1 },
      P: (x0,x1) => x0.exec(x1),
      PB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      PC: (x0,x1) => x0.item(x1),
      PD: (handle) => clearTimeout(handle),
      PE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      PF: () => globalThis.console,
      PG: (x0,x1) => { x0.value = x1 },
      PH: () => 1000 * performance.now(),
      PI: x0 => x0.value,
      PJ: x0 => x0.status,
      PK: x0 => x0.location,
      PL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      Q: (x0,x1) => { x0.lastIndex = x1 },
      QB: x0 => new Uint32Array(x0),
      QC: x0 => x0.length,
      QD: x0 => x0.maxTouchPoints,
      QE: () => globalThis.window.FinalizationRegistry,
      QF: s => s.trimRight(),
      QG: x0 => x0.value,
      QH: x0 => new Uint8Array(x0),
      QI: x0 => x0.done,
      QJ: x0 => x0.response,
      QK: (x0,x1) => x0.getModifierState(x1),
      QL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      R: o => o,
      RB: x0 => new Float32Array(x0),
      RC: (x0,x1) => x0.querySelectorAll(x1),
      RD: x0 => x0.platform,
      RE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      RF: x0 => x0.blur(),
      RG: x0 => x0.selectionDirection,
      RH: (x0,x1,x2) => x0.slice(x1,x2),
      RI: x0 => x0.body,
      RJ: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      RK: x0 => x0.metaKey,
      RL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      S: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      SB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      SC: (x0,x1) => x0.getAttribute(x1),
      SD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      SE: x0 => new window.FinalizationRegistry(x0),
      SF: x0 => x0.button,
      SG: x0 => x0.selectionStart,
      SH: (x0,x1) => x0.decode(x1),
      SI: x0 => x0.headers,
      SJ: (x0,x1) => { x0.responseType = x1 },
      SK: x0 => x0.altKey,
      SL: (x0,x1) => { x0.onerror = x1 },
      T: o => o instanceof RegExp,
      TB: x0 => new Float64Array(x0),
      TC: x0 => x0.remove(),
      TD: Date.now,
      TE: (x0,x1) => x0.unregister(x1),
      TF: (x0,x1) => x0.prepend(x1),
      TG: x0 => x0.selectionEnd,
      TH: (x0,x1) => x0.adoptText(x1),
      TI: x0 => x0.signal,
      TJ: () => new XMLHttpRequest(),
      TK: x0 => x0.ctrlKey,
      TL: (x0,x1) => { x0.oncancel = x1 },
      U: (string, times) => string.repeat(times),
      UB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      UC: (x0,x1) => x0.appendChild(x1),
      UD: (x0,x1) => x0.contains(x1),
      UE: x0 => x0.preventDefault(),
      UF: x0 => x0.parentElement,
      UG: x0 => x0.value,
      UH: x0 => x0.first(),
      UI: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      UJ: () => new FileReader(),
      UK: x0 => x0.isComposing,
      UL: (x0,x1) => { x0.onchange = x1 },
      V: o => o,
      VB: x0 => new ArrayBuffer(x0),
      VC: (x0,x1) => x0.append(x1),
      VD: (decoder, codeUnits) => decoder.decode(codeUnits),
      VE: x0 => x0.parent,
      VF: x0 => x0.innerHeight,
      VG: x0 => x0.selectionDirection,
      VH: x0 => x0.next(),
      VI: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      VJ: (x0,x1) => x0.readAsArrayBuffer(x1),
      VK: x0 => x0.code,
      VL: x0 => x0.type,
      W: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      WB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      WC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      WD: () => new TextDecoder("utf-8", {fatal: true}),
      WE: x0 => x0.timeStamp,
      WF: x0 => x0.innerWidth,
      WG: x0 => x0.selectionStart,
      WH: x0 => x0.current(),
      WI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      WJ: x0 => x0.result,
      WK: x0 => x0.repeat,
      WL: x0 => x0.lastModified,
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new DataView(x0,x1,x2),
      XC: x0 => x0.style,
      XD: () => new TextDecoder("utf-8", {fatal: false}),
      XE: (x0,x1) => x0.hasAttribute(x1),
      XF: x0 => x0.height,
      XG: x0 => x0.selectionEnd,
      XH: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      XI: (a, s, e) => a.slice(s, e),
      XJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      XK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      XL: x0 => x0.name,
      Y: x0 => x0.unicode,
      YB: (o, p) => o[p],
      YC: x0 => x0.debugShowSemanticsNodes,
      YD: (a, i, v) => a[i] = v,
      YE: x0 => x0.type,
      YF: x0 => x0.width,
      YG: (x0,x1) => { x0.name = x1 },
      YH: x0 => x0.v8BreakIterator,
      YI: x0 => x0.naturalHeight,
      YJ: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      YK: (x0,x1) => x0.canShare(x1),
      YL: (x0,x1) => x0.item(x1),
      Z: x0 => x0.ignoreCase,
      ZB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      ZC: (x0,x1) => x0.warn(x1),
      ZD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      ZE: (x0,x1) => x0.getModifierState(x1),
      ZF: x0 => x0.clientHeight,
      ZG: (x0,x1) => { x0.placeholder = x1 },
      ZH: () => globalThis.Intl,
      ZI: x0 => x0.naturalWidth,
      ZJ: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      ZK: (x0,x1) => x0.share(x1),
      ZL: x0 => x0.length,
      a: x0 => x0.multiline,
      aB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      aC: x0 => x0.console,
      aD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      aE: x0 => x0.buttons,
      aF: x0 => x0.clientWidth,
      aG: (x0,x1) => { x0.autocomplete = x1 },
      aH: (x0,x1) => x0.segment(x1),
      aI: (x0,x1) => x0.createElement(x1),
      aJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aK: x0 => x0.message,
      aL: x0 => x0.files,
      b: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      bB: o => o.byteOffset,
      bC: () => globalThis.window,
      bD: (s) => +s,
      bE: x0 => x0.ctrlKey,
      bF: x0 => x0.isConnected,
      bG: (x0,x1) => { x0.type = x1 },
      bH: x0 => x0.index,
      bI: (x0,x1) => { x0.pointerEvents = x1 },
      bJ: () => new XMLHttpRequest(),
      bK: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      bL: x0 => x0.target,
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.buffer,
      cC: (o, c) => o instanceof c,
      cD: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      cE: x0 => x0.getBoundingClientRect(),
      cF: x0 => x0.head,
      cG: (x0,x1) => { x0.name = x1 },
      cH: x0 => x0.next(),
      cI: (x0,x1) => { x0.height = x1 },
      cJ: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      cK: (x0,x1) => x0.createElement(x1),
      cL: (x0,x1) => x0.replaceChildren(x1),
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: Function.prototype.call.bind(DataView.prototype.getUint8),
      dC: (x0,x1) => x0[x1],
      dD: s => s.trim(),
      dE: x0 => x0.y,
      dF: (x0,x1) => { x0.content = x1 },
      dG: (x0,x1) => { x0.placeholder = x1 },
      dH: x0 => x0.value,
      dI: (x0,x1) => { x0.width = x1 },
      dJ: x0 => x0.send(),
      dK: x0 => x0.click(),
      dL: (x0,x1,x2) => x0.setAttribute(x1,x2),
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: (b, o) => new DataView(b, o),
      eC: x0 => x0.length,
      eD: x0 => x0.classList,
      eE: x0 => x0.x,
      eF: (x0,x1) => { x0.name = x1 },
      eG: (x0,x1) => { x0.scrollTop = x1 },
      eH: x0 => x0.done,
      eI: x0 => x0.style,
      eJ: x0 => x0.type,
      eK: x0 => x0.remove(),
      eL: (x0,x1) => { x0.accept = x1 },
      f: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      fB: (b, o, l) => new DataView(b, o, l),
      fC: (string, token) => string.split(token),
      fD: x0 => x0.relatedTarget,
      fE: x0 => x0.top,
      fF: (x0,x1) => x0.removeChild(x1),
      fG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      fH: (o, m, a) => o[m].apply(o, a),
      fI: (x0,x1) => { x0.src = x1 },
      fJ: x0 => x0.response,
      fK: (o, a) => o + a,
      fL: (x0,x1) => { x0.multiple = x1 },
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      gC: o => o instanceof Array,
      gD: x0 => x0.hasFocus(),
      gE: x0 => x0.left,
      gF: x0 => x0.firstChild,
      gG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      gH: x0 => x0.iterator,
      gI: () => globalThis.document,
      gJ: (x0,x1) => { x0.responseType = x1 },
      gK: x0 => x0.children,
      gL: (x0,x1) => { x0.type = x1 },
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      hC: (a, i) => a[i],
      hD: x0 => x0.shiftKey,
      hE: x0 => x0.scrollTop,
      hF: x0 => x0.viewConstraints,
      hG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      hH: () => globalThis.Symbol,
      hI: x0 => x0.src,
      hJ: x0 => x0.vendor,
      hK: x0 => x0.body,
      hL: x0 => x0.extraAssets,
      i: x0 => new Promise(x0),
      iB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      iC: a => a.length,
      iD: x0 => x0.body,
      iE: x0 => x0.offsetTop,
      iF: x0 => x0.hostElement,
      iG: x0 => x0.keyCode,
      iH: (x0,x1) => new Intl.Segmenter(x0,x1),
      iI: x0 => x0.close(),
      iJ: x0 => x0.navigator,
      iK: (x0,x1) => { x0.download = x1 },
      iL: x0 => x0.fontManifest,
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: (t, s) => t.set(s),
      jC: (x0,x1) => x0.test(x1),
      jD: x0 => x0.visibilityState,
      jE: x0 => x0.scrollLeft,
      jF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jG: (x0,x1) => x0.scrollIntoView(x1),
      jH: x0 => x0.Segmenter,
      jI: x0 => x0.height,
      jJ: () => globalThis.window,
      jK: (x0,x1) => { x0.display = x1 },
      jL: x0 => x0.assetManifest,
      k: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      kB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      kC: x0 => x0.userAgent,
      kD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      kE: x0 => x0.offsetLeft,
      kF: x0 => ({runApp: x0}),
      kG: x0 => x0.multiViewEnabled,
      kH: x0 => x0.buffer,
      kI: x0 => x0.width,
      kJ: x0 => globalThis.URL.createObjectURL(x0),
      kK: x0 => x0.style,
      kL: x0 => x0.buildConfig,
      l: x0 => new Array(x0),
      lB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      lC: x0 => x0.navigator,
      lD: x0 => x0.disconnect(),
      lE: x0 => x0.offsetParent,
      lF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      lG: (x0,x1) => x0.replaceWith(x1),
      lH: x0 => x0.wasmMemory,
      lI: (x0,x1,x2,x3,x4,x5) => x0.createImageBitmap(x1,x2,x3,x4,x5),
      lJ: x0 => ({type: x0}),
      lK: (x0,x1) => { x0.href = x1 },
      lL: x0 => x0.length,
      m: o => [o],
      mB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      mC: Function.prototype.call.bind(String.prototype.toLowerCase),
      mD: x0 => new Intl.Locale(x0),
      mE: x0 => x0.offsetY,
      mF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      mG: (x0,x1) => { x0.className = x1 },
      mH: () => globalThis.window._flutter_skwasmInstance,
      mI: (x0,x1) => x0.createImageBitmap(x1),
      mJ: (x0,x1) => new Blob(x0,x1),
      mK: () => globalThis.document,
      mL: x0 => x0.getReader(),
      n: (o0, o1) => [o0, o1],
      nB: Function.prototype.call.bind(DataView.prototype.getUint32),
      nC: Object.is,
      nD: x0 => x0.region,
      nE: x0 => x0.offsetX,
      nF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      nG: (x0,x1) => { x0.tabIndex = x1 },
      nH: () => new TextDecoder(),
      nI: x0 => new Blob(x0),
      nJ: o => o.byteLength,
      nK: x0 => ({files: x0}),
      nL: x0 => x0.value,
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      oC: x0 => x0.vendor,
      oD: x0 => x0.script,
      oE: (o, p, r) => o.replace(p, () => r),
      oF: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      oG: (x0,x1) => { x0.action = x1 },
      oH: (map, o, v) => map.set(o, v),
      oI: x0 => x0.close(),
      oJ: (x0,x1) => x0.getRandomValues(x1),
      oK: () => ({}),
      oL: x0 => x0.done,
      p: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      pB: Function.prototype.call.bind(DataView.prototype.getInt32),
      pC: (x0,x1) => x0.createTextNode(x1),
      pD: x0 => x0.language,
      pE: (o, p, r) => o.replaceAll(p, () => r),
      pF: x0 => x0.history,
      pG: (x0,x1) => { x0.method = x1 },
      pH: (map, o) => map.get(o),
      pI: x0 => x0.naturalHeight,
      pJ: () => globalThis.crypto,
      pK: (x0,x1,x2) => new File(x0,x1,x2),
      pL: x0 => x0.read(),
      q: (x0,x1,x2) => { x0[x1] = x2 },
      qB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      qC: (x0,x1) => { x0.id = x1 },
      qD: x0 => x0.languages,
      qE: x0 => x0.deltaMode,
      qF: x0 => x0.search,
      qG: (x0,x1) => { x0.noValidate = x1 },
      qH: () => new WeakMap(),
      qI: x0 => x0.naturalWidth,
      qJ: l => new DataView(new ArrayBuffer(l)),
      qK: (x0,x1) => { x0.type = x1 },
      qL: x0 => x0.body,
      r: (o, p) => o[p],
      rB: o => o instanceof Uint16Array,
      rC: (x0,x1) => { x0.nonce = x1 },
      rD: (x0,x1) => x0.observe(x1),
      rE: x0 => x0.deltaY,
      rF: x0 => x0.location,
      rG: x0 => x0.click(),
      rH: x0 => x0.debugSkipFontRetryDelay,
      rI: (x0,x1) => { x0.src = x1 },
      rJ: (x0,x1,x2) => x0.insertBefore(x1,x2),
      rK: x0 => x0.userAgent,
      rL: (x0,x1) => new OffscreenCanvas(x0,x1),
      s: () => globalThis,
      sB: Function.prototype.call.bind(DataView.prototype.getUint16),
      sC: x0 => x0.nonce,
      sD: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      sE: x0 => x0.deltaX,
      sF: x0 => x0.pathname,
      sG: (x0,x1) => x0.getElementsByClassName(x1),
      sH: (x0,x1,x2) => x0.set(x1,x2),
      sI: x0 => x0.displayHeight,
      sJ: x0 => x0.id,
      sK: (x0,x1) => x0.getItem(x1),
      sL: x0 => x0.assetBase,
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: o => o instanceof Int16Array,
      tC: () => globalThis.window.flutterConfiguration,
      tD: x0 => new ResizeObserver(x0),
      tE: x0 => x0.wheelDeltaY,
      tF: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      tG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      tH: x0 => x0.fontFallbackBaseUrl,
      tI: x0 => x0.displayWidth,
      tJ: x0 => x0.offsetHeight,
      tK: x0 => x0.localStorage,
      tL: x0 => x0.loader,
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: Function.prototype.call.bind(DataView.prototype.getInt16),
      uC: (x0,x1) => x0.attachShadow(x1),
      uD: (x0,x1) => x0.getPropertyValue(x1),
      uE: x0 => x0.wheelDeltaX,
      uF: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      uG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      uH: (handle) => clearInterval(handle),
      uI: x0 => x0.duration,
      uJ: x0 => x0.offsetWidth,
      uK: (x0,x1) => x0.key(x1),
      uL: () => globalThis._flutter,
      v: (x0,x1) => ({addView: x0,removeView: x1}),
      vB: o => o instanceof Uint8ClampedArray,
      vC: (x0,x1) => x0.createElement(x1),
      vD: x0 => globalThis.parseFloat(x0),
      vE: x0 => x0.bottom,
      vF: o => Object.keys(o),
      vG: (x0,x1) => x0.dispatchEvent(x1),
      vH: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      vI: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      vJ: x0 => x0.stopPropagation(),
      vK: x0 => x0.length,
      w: (l, r) => l === r,
      wB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      wC: x0 => x0.scale,
      wD: (x0,x1) => x0.getComputedStyle(x1),
      wE: x0 => x0.right,
      wF: x0 => x0.state,
      wG: (x0,x1) => x0.createEvent(x1),
      wH: () => Date.now(),
      wI: (x0,x1) => x0.decode(x1),
      wJ: x0 => x0.disabled,
      wK: (x0,x1) => x0.removeItem(x1),
      x: x0 => x0.random(),
      xB: Function.prototype.call.bind(DataView.prototype.setInt32),
      xC: x0 => x0.visualViewport,
      xD: x0 => x0.documentElement,
      xE: x0 => x0.clientY,
      xF: x0 => x0.hash,
      xG: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      xH: x0 => new WeakRef(x0),
      xI: x0 => x0.image,
      xJ: (x0,x1) => { x0.min = x1 },
      xK: (x0,x1,x2) => x0.setItem(x1,x2),
      y: () => globalThis.Math,
      yB: Function.prototype.call.bind(DataView.prototype.setUint32),
      yC: x0 => x0.devicePixelRatio,
      yD: x0 => x0.computedStyleMap(),
      yE: x0 => x0.clientX,
      yF: x0 => x0.state,
      yG: x0 => x0.readText(),
      yH: x0 => x0.deref(),
      yI: x0 => x0.close(),
      yJ: (x0,x1) => { x0.max = x1 },
      yK: (x0,x1) => x0.querySelector(x1),
      z: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      zB: Function.prototype.call.bind(DataView.prototype.setInt16),
      zC: x0 => x0.height,
      zD: (x0,x1) => x0.get(x1),
      zE: x0 => x0.changedTouches,
      zF: (x0,x1) => x0.go(x1),
      zG: x0 => x0.clipboard,
      zH: () => globalThis.WeakRef,
      zI: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      zJ: (x0,x1) => { x0.disabled = x1 },
      zK: (x0,x1) => x0.append(x1),

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
