/* ============================================================
   For Sandra — a quiet letter
   Vanilla JS. No dependencies. Mobile-first.

   Flow: intro (skippable, ~7s) → cover → chapters → ending
   The Continue button/tap appears only after a screen's lines have
   finished fading in (plus a short hold) — text is never cut off.

   3D scene: perspective rig with layered depth planes (nebula,
   glass panes, dust at 3 depths). The rig tilts toward the pointer
   / device tilt and takes a soft "breath" on every chapter change.

   Ambient sound: generated live with WebAudio — no audio files.
   Off by default; toggled with the small button (bottom right).

   Navigation: Continue button · tap anywhere · swipe up/left to go
   forward, swipe down/right to go back · Space / Enter / → / ↓
   forward, ← / ↑ back (desktop)
   ============================================================ */

(function () {
  "use strict";

  /* ---------- data ---------- */
  var DATA = window.LETTER;
  var chapters = DATA.sections.filter(function (s) { return s.type === "chapter"; });
  var total = chapters.length;

  /* ---------- elements ---------- */
  var el = {
    intro: document.getElementById("intro"),
    stage: document.getElementById("stage"),
    cover: document.getElementById("cover"),
    begin: document.getElementById("begin"),
    hud: document.getElementById("hud"),
    bar: document.getElementById("progress-bar"),
    label: document.getElementById("progress-label"),
    next: document.getElementById("next"),
    ending: document.getElementById("ending"),
    tone: document.getElementById("tone"),
    stars: document.getElementById("stars"),
    tilt: document.getElementById("tilt"),
    sound: document.getElementById("sound"),
    song: document.getElementById("song")
  };

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     3D scene rig — pointer/tilt parallax + chapter "breath"
     Sets --rx/--ry on .scene__tilt; CSS rotates the whole depth
     scene. Layers at different translateZ shift at different rates.
     ============================================================ */
  var tiltRaf = 0, tiltPx = 0.5, tiltPy = 0.5;
  var PULSE_DEG = 2.4;
  var PULSE_MS = 1600;
  var pulseUntil = 0;
  var curRx = 0, curRy = 0;

  /* The scene NEVER sits still: a perpetual slow Lissajous sway runs
     every frame, layered with pointer/device tilt and chapter pulses.
     Smoothing is done here (lerp), so CSS needs no transition.
     On small screens the sway rate halves (HALF_RATE) so the rig's
     per-frame style writes stay cheap on mid-range phones. */
  var HALF_RATE = Math.min(innerWidth, innerHeight) < 720 ? 0.5 : 1;

  function sceneLoop(now) {
    if (!el.tilt) return;
    var t = now / 1000;
    var swayX = Math.sin(t * 0.45 * HALF_RATE) * 0.9 + Math.sin(t * 0.13 * HALF_RATE) * 0.7;
    var swayY = Math.cos(t * 0.34 * HALF_RATE) * 1.1 + Math.sin(t * 0.21 * HALF_RATE) * 0.6;

    var pulse = 0;
    if (now < pulseUntil) {
      var k = (pulseUntil - now) / PULSE_MS;            // 1 → 0
      pulse = PULSE_DEG * Math.sin(k * Math.PI);        // out and back
    }

    var tRx = (tiltPy - 0.5) * -5 + swayX + pulse;
    var tRy = (tiltPx - 0.5) * 7 + swayY - pulse;
    curRx += (tRx - curRx) * 0.045;
    curRy += (tRy - curRy) * 0.045;

    el.tilt.style.setProperty("--rx", curRx.toFixed(3) + "deg");
    el.tilt.style.setProperty("--ry", curRy.toFixed(3) + "deg");
    starPx = 0.5 + (curRy / 7);   // dust parallax follows the rig
    starPy = 0.5 - (curRx / 5);
    requestAnimationFrame(sceneLoop);
  }

  function pulseScene() {
    if (reducedMotion) return;
    pulseUntil = performance.now() + PULSE_MS;
  }

  function initTilt() {
    if (!el.tilt) return;
    if (reducedMotion) return;   // static scene for reduced motion

    window.addEventListener("pointermove", function (e) {
      tiltPx = e.clientX / Math.max(innerWidth, 1);
      tiltPy = e.clientY / Math.max(innerHeight, 1);
    }, { passive: true });

    // phones: subtle response to physical device tilt
    var baseBeta = null;
    window.addEventListener("deviceorientation", function (e) {
      if (e.gamma == null || e.beta == null) return;
      if (baseBeta === null) baseBeta = e.beta;
      var gx = Math.max(-1, Math.min(1, e.gamma / 24));
      var gy = Math.max(-1, Math.min(1, (e.beta - baseBeta) / 20));
      tiltPx = 0.5 + gx * 0.4;
      tiltPy = 0.5 + gy * 0.4;
    }, { passive: true });

    requestAnimationFrame(sceneLoop);   // runs forever
  }

  /* ============================================================
     Ambient particles — depth-sorted dust in 3 planes.
     Far: tiny, slow, dim. Near: larger, faster, softly glowing.
     Each plane parallax-shifts against the scene tilt.
     ============================================================ */
  var starPx = 0.5, starPy = 0.5;

  function initStars() {
    var canvas = el.stars;
    if (!canvas) return;
    if (reducedMotion) { canvas.style.display = "none"; return; }

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var particles = [];

    var PLANES = [
      { share: 0.45, rMax: 1.0, speed: 0.45, aMax: 0.42, par: 22 },  // far
      { share: 0.35, rMax: 1.6, speed: 0.8,  aMax: 0.55, par: 48 },  // mid
      { share: 0.2,  rMax: 2.6, speed: 1.35, aMax: 0.7,  par: 88 }   // near
    ];

    function build() {
      canvas.width = Math.floor(innerWidth * dpr);
      canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width = innerWidth + "px";
      canvas.style.height = innerHeight + "px";

      var base = Math.min(130, Math.max(42, Math.round((innerWidth * innerHeight) / 11000)));
      if (window.matchMedia("(min-width: 720px)").matches) {
        base = Math.round(base * 1.3);
      } else {
        base = Math.round(base * 0.7);   // ~30% fewer particles on phones
      }
      particles = [];

      PLANES.forEach(function (pl, pi) {
        var count = Math.round(base * pl.share);
        for (var i = 0; i < count; i++) {
          particles.push({
            plane: pi,
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: (0.35 + Math.random() * pl.rMax) * dpr,
            vx: (Math.random() - 0.5) * 0.055 * pl.speed * dpr,
            vy: (-0.02 - Math.random() * 0.055) * pl.speed * dpr,
            a: 0.1 + Math.random() * pl.aMax,
            tw: Math.random() * Math.PI * 2,
            ts: 0.004 + Math.random() * 0.012,
            warm: Math.random() < 0.16
          });
        }
      });
    }

    function step() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var ox = starPx - 0.5, oy = starPy - 0.5;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy; p.tw += p.ts;
        if (p.y < -12) { p.y = canvas.height + 12; p.x = Math.random() * canvas.width; }
        if (p.x < -12) p.x = canvas.width + 12;
        if (p.x > canvas.width + 12) p.x = -12;

        var par = PLANES[p.plane].par * dpr;
        var dx = p.x + ox * par;      // per-plane parallax offset
        var dy = p.y + oy * par;
        var alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));

        ctx.fillStyle = p.warm
          ? "rgba(212, 180, 124, " + alpha.toFixed(3) + ")"
          : "rgba(230, 235, 245, " + alpha.toFixed(3) + ")";

        if (p.plane === 2) {          // near plane: faint halo, feels close
          ctx.globalAlpha = alpha * 0.22;
          ctx.beginPath();
          ctx.arc(dx, dy, p.r * 3, 0, 6.2832);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.arc(dx, dy, p.r, 0, 6.2832);
        ctx.fill();
      }
      requestAnimationFrame(step);
    }

    build();
    step();

    var t;
    addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(build, 220);
    });
  }

  /* ============================================================
     Ambient sound — generated live with WebAudio (no files).
     A still, warm chord: two low sines + a fifth, heavily softened,
     with filtered air and a ~20s breathing swell. Off by default.
     ============================================================ */
  var audio = null;

  function initAudio() {
    if (audio) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    var ctx = new AC();
    var master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    var pad = ctx.createGain();
    pad.gain.value = 0.16;
    pad.connect(master);

    [110, 164.81, 220.5].forEach(function (f, i) {   // A2 · E3 · near-A3
      var osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      osc.detune.value = (i - 1) * 4;
      var g = ctx.createGain();
      g.gain.value = 0.5 - i * 0.12;
      osc.connect(g);
      g.connect(pad);
      osc.start();
    });

    var len = ctx.sampleRate * 2;                    // soft "air"
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    var lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    lp.Q.value = 0.6;
    var ng = ctx.createGain();
    ng.gain.value = 0.05;
    noise.connect(lp); lp.connect(ng); ng.connect(master);
    noise.start();

    var lfo = ctx.createOscillator();                // breathing swell
    lfo.frequency.value = 0.05;
    var lfoG = ctx.createGain();
    lfoG.gain.value = 0.05;
    lfo.connect(lfoG); lfoG.connect(pad.gain);
    lfo.start();

    audio = { ctx: ctx, master: master, on: false };
  }

  function toggleSound() {
    initAudio();
    if (!audio) return;
    if (audio.ctx.state === "suspended") audio.ctx.resume();
    audio.on = !audio.on;
    var now = audio.ctx.currentTime;
    audio.master.gain.cancelScheduledValues(now);
    audio.master.gain.linearRampToValueAtTime(audio.on ? 0.5 : 0, now + 1.8);
    if (el.sound) {
      el.sound.classList.toggle("is-on", audio.on);
      el.sound.setAttribute("aria-pressed", audio.on ? "true" : "false");
      el.sound.setAttribute("aria-label", audio.on ? "Mute ambient sound" : "Play ambient sound");
    }
  }

  if (el.sound) {
    el.sound.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleSound();
    });
  }

  /* ============================================================
     Intro — the boot sequence (~7s, tap to skip)
     CSS runs the dot/timings; JS only advances the states.
     Timeline (ms from load): dot 350–2750 → text 2800 → leave 6500
     ============================================================ */
  var skipIntro = null; // set while the intro is running

  function runIntro() {
    var introDone = false;

    skipIntro = function () { finishIntro(true); };

    var finishIntro = function (skipped) {
      if (introDone) return;
      introDone = true;
      document.removeEventListener("pointerdown", skipIntro);
      skipIntro = null;
      el.intro.classList.add("is-leaving");
      setTimeout(function () { el.intro.style.display = "none"; }, 1150);
      if (!skipped) setTimeout(enterCover, 900);
      else enterCover();
    };

    document.addEventListener("pointerdown", skipIntro);

    setTimeout(function () { el.intro.classList.add("is-ready"); }, 2800);
    setTimeout(function () { finishIntro(false); }, 6500);
  }

  /* ============================================================
     Cover
     ============================================================ */
  function enterCover() {
    currentStage = "cover";
    document.body.classList.add("is-cover");
    el.intro.style.display = "none";
    el.cover.classList.remove("is-hidden");
    el.begin.focus({ preventScroll: true });
  }

  function leaveCover() {
    el.cover.classList.add("is-hidden");
    el.hud.classList.add("is-shown");
    document.body.classList.remove("is-cover");
    document.body.classList.add("tone-0");   // base tone behind chapters
    updateHud(0);
    showChapter(0);
  }

  /* ============================================================
     Chapters — built once from content.js
     ============================================================ */
  /* Pacing: line reveal duration lives in styles.css (.chapter__line).
     The Continue button appears after the last line lands + a short hold. */
  var LINE_MS = 1250;   // must match the CSS transition duration
  var STAGGER_MS = 1150;
  var HOLD_MS = 500;
  var nextTimer = null;

  function scheduleNext(numLines) {
    clearTimeout(nextTimer);
    var delay = LINE_MS + (Math.max(numLines - 1, 0) * STAGGER_MS) + HOLD_MS;
    nextTimer = setTimeout(function () {
      if (currentStage === "chapter") el.next.classList.add("is-shown");
    }, delay);
  }

  var currentStage = "intro";   // "intro" | "cover" | "chapter" | "ending"
  var chapterIndex = -1;
  var locked = false;           // one transition at a time

  /* Ghost photo switch: her.png through part 3, poster from part 4 on.
     is-cover doubles as "her photo" state (splash AND parts 1–3). */
  var HER_UNTIL = 4;            // poster starts at this part number

  function photoClassFor(partNum) {
    return partNum >= HER_UNTIL ? "mem-poster" : "is-cover";
  }

  function buildChapters() {
    chapters.forEach(function (sec, i) {
      var node = document.createElement("section");
      node.className = "chapter " + sec.tone;
      node.id = "chapter-" + i;
      node.setAttribute("role", "group");
      node.setAttribute("aria-label", "Part " + (i + 1) + " of " + total);

      var num = document.createElement("p");
      num.className = "chapter__num";
      num.textContent = "— " + pad(i + 1) + " —";
      num.setAttribute("aria-hidden", "true");

      var text = document.createElement("div");
      text.className = "chapter__text";

      sec.lines.forEach(function (line, j) {
        var p = document.createElement("p");
        p.className = "chapter__line";
        p.style.setProperty("--d", (0.2 + j * 1.15).toFixed(2) + "s");
        p.innerHTML = line;   // trusted: authored in content.js
        text.appendChild(p);
      });

      node.appendChild(num);
      node.appendChild(text);
      el.stage.appendChild(node);
    });
  }

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  // Announce progress politely for screen readers
  var announcer = document.createElement("p");
  announcer.className = "sr-only";
  announcer.setAttribute("aria-live", "polite");
  document.body.appendChild(announcer);

  function showChapter(i, dir) {
    chapterIndex = i;
    currentStage = "chapter";

    var sec = chapters[i];
    var node = document.getElementById("chapter-" + i);
    var prev = document.querySelector(".chapter.is-active");

    if (prev && prev !== node) {
      prev.classList.remove("is-active");
      prev.classList.add(dir === "back" ? "is-leaving--back" : "is-leaving");
      setTimeout(function () { prev.classList.remove("is-leaving", "is-leaving--back"); }, 800);
    }

    document.body.className = "no-scroll " + sec.tone + " " + photoClassFor(i + 1);
    updateHud(i);

    // Re-entry: replay the line stagger. Snap lines to their hidden base
    // state instantly (transitions off), restore, then activate so the
    // staggered fade-in runs cleanly even if we return mid-fade-out.
    var lines = node.querySelectorAll(".chapter__line");
    if (dir === "back") {
      node.classList.remove("is-active");
      for (var l = 0; l < lines.length; l++) lines[l].style.transition = "none";
      void node.offsetHeight;                       // force reflow
      for (l = 0; l < lines.length; l++) lines[l].style.transition = "";
    }

    clearTimeout(nextTimer);
    el.next.classList.remove("is-shown");   // hide while the new text fades in
    node.classList.add("is-active");
    if (dir === "back") {
      node.classList.add("stage-nudge-b");
      setTimeout(function () { node.classList.remove("stage-nudge-b"); }, 1200);
    }

    scheduleNext(sec.lines.length);   // Continue appears after the text settles
    pulseScene();                     // the scene takes a soft breath
    announcer.textContent = "Part " + (i + 1) + " of " + total + ". " +
      sec.lines.join(" ").replace(/<[^>]*>/g, "");
  }

  /* ============================================================
     Ending
     ============================================================ */
  function showEnding() {
    currentStage = "ending";
    chapterIndex = total;

    var node = document.querySelector(".chapter.is-active");
    if (node) {
      node.classList.remove("is-active");
      node.classList.add("is-leaving");
      setTimeout(function () { node.classList.remove("is-leaving"); }, 800);
    }

    document.body.className = "no-scroll tone-end mem-poster";
    clearTimeout(nextTimer);
    el.next.classList.remove("is-shown");
    el.hud.classList.remove("is-shown");
    el.ending.hidden = false;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.ending.classList.add("is-shown");
      });
    });
    pulseScene();
  }

  /* ============================================================
     Progress
     ============================================================ */
  function updateHud(i) {
    el.bar.style.width = ((i + 1) / total) * 100 + "%";
    el.label.textContent = pad(i + 1) + " / " + pad(total);
  }

  /* ============================================================
     Navigation
     ============================================================ */
  function advance() {
    if (locked) return;
    if (currentStage === "intro") { if (skipIntro) skipIntro(); return; }
    if (currentStage === "cover") { startLetter(); return; }
    if (currentStage === "chapter") {
      locked = true;
      setTimeout(function () { locked = false; }, 700);
      if (chapterIndex < total - 1) showChapter(chapterIndex + 1);
      else showEnding();
    }
  }

  var songStarted = false;

  function startLetter() {
    if (currentStage !== "cover") return;
    // The song begins with her first Continue and plays once, to the end.
    if (el.song && !songStarted) {
      songStarted = true;
      var p = el.song.play();
      if (p && p.catch) {
        p.catch(function () { /* autoplay refused — stay silent, letter continues */ });
      }
    }
    leaveCover();
  }

  // Close — deliberately does not close; nudges her to the other button
  var closeBtn = document.getElementById("close");
  var closeError = document.getElementById("close-error");
  var closeErrorTimer = null;
  if (closeBtn && closeError) {
    closeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      closeError.hidden = false;
      requestAnimationFrame(function () {
        closeError.classList.add("is-shown");
      });
      clearTimeout(closeErrorTimer);
      closeErrorTimer = setTimeout(function () {
        closeError.classList.remove("is-shown");
      }, 3800);
    });
  }

  /* ---------- ghost photographs (always-on: her on splash, poster on all chapters) ---------- */

  /* ---------- back navigation ---------- */
  function goBack() {
    if (locked) return;

    if (currentStage === "ending") {
      locked = true;
      setTimeout(function () { locked = false; }, 700);
      el.ending.classList.remove("is-shown");
      el.hud.classList.add("is-shown");
      showChapter(total - 1, "back");
      return;
    }

    if (currentStage === "chapter") {
      if (chapterIndex <= 0) { backToCover(); return; }
      locked = true;
      setTimeout(function () { locked = false; }, 700);
      showChapter(chapterIndex - 1, "back");
    }
  }

  function backToCover() {
    locked = true;
    setTimeout(function () { locked = false; }, 700);

    var node = document.querySelector(".chapter.is-active");
    if (node) {
      node.classList.remove("is-active");
      node.classList.add("is-leaving--back");
      setTimeout(function () { node.classList.remove("is-leaving", "is-leaving--back"); }, 800);
    }
    currentStage = "cover";
    chapterIndex = -1;
    document.body.classList.add("is-cover");
    el.next.classList.remove("is-shown");
    el.hud.classList.remove("is-shown");
    document.body.className = "no-scroll is-cover";
    el.cover.classList.remove("is-hidden");
    el.begin.focus({ preventScroll: true });
  }

  /* ---------- interactions ---------- */
  el.begin.addEventListener("click", function () { startLetter(); });

  el.next.addEventListener("click", function (e) {
    e.stopPropagation();
    advance();
  });

  // Tap anywhere (cover & chapters). Ignore taps on controls and
  // drags that are actually swipes.
  var downXY = null;
  document.addEventListener("pointerdown", function (e) {
    downXY = { x: e.clientX, y: e.clientY };
  });

  document.addEventListener("pointerup", function (e) {
    if (!downXY) return;
    var dx = Math.abs(e.clientX - downXY.x);
    var dy = Math.abs(e.clientY - downXY.y);
    downXY = null;
    if (dx + dy > 24) return;           // it was a swipe / drag
    if (e.target.closest("button, a")) return;  // real controls handle themselves

    if (currentStage === "cover") { startLetter(); return; }
    if (currentStage === "chapter") advance();
  });

  // Swipe up/left → forward · swipe down/right → back
  var touchY = null, touchX = null;
  document.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) return;
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener("touchend", function (e) {
    if (touchY === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    var dy = e.changedTouches[0].clientY - touchY;
    touchX = touchY = null;
    if (Math.abs(dx) > Math.abs(dy) && dx < -46) { tryAdvanceFromGesture(); return; }
    if (dy < -46) { tryAdvanceFromGesture(); return; }
    if (Math.abs(dx) > Math.abs(dy) && dx > 46) { tryBackFromGesture(); return; }
    if (dy > 46) tryBackFromGesture();
  }, { passive: true });

  function tryAdvanceFromGesture() {
    if (currentStage === "cover") { startLetter(); return; }
    if (currentStage === "chapter") advance();
  }

  function tryBackFromGesture() {
    if (currentStage === "chapter" || currentStage === "ending") goBack();
  }

  // Keyboard
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight" || e.key === "ArrowDown") {
      var t = e.target;
      if (t && (t.tagName === "BUTTON" || t.tagName === "A")) return; // let the button's own handler run
      e.preventDefault();
      advance();
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      var t2 = e.target;
      if (t2 && (t2.tagName === "BUTTON" || t2.tagName === "A")) return;
      e.preventDefault();
      goBack();
    }
  });

  /* ---------- boot ---------- */
  buildChapters();
  el.label.textContent = pad(1) + " / " + pad(total);   // real count from content.js
  document.body.classList.add("is-cover");   // her photo faded in before the intro lifts
  initTilt();     // scene rig first — the intro already sits inside it
  initStars();
  runIntro();
})();
