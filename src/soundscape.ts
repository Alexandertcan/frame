export type SoundPreset = "coast" | "noise" | "jazz" | "rnb";
export const soundPresets: {
  id: SoundPreset;
  name: string;
  detail: string;
  mark: string;
}[] = [
  { id: "coast", name: "自然海岸", detail: "缓慢起落的合成海浪", mark: "≈" },
  { id: "noise", name: "白噪音", detail: "柔化高频，留一点安静", mark: "∿" },
  { id: "jazz", name: "Jazz", detail: "暖电钢琴 · 轻摇摆", mark: "♩" },
  { id: "rnb", name: "R&B", detail: "柔软和弦 · 慢节拍", mark: "♫" },
];

// Original procedural soundscapes. No third-party tracks or remote requests.
// Quiet output, rounded note envelopes, no continuous high-pitched drone.
export function createSoundscape(initial: SoundPreset) {
  const Audio =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Audio) throw Error("这个浏览器暂不支持背景声音。");
  const context = new Audio();
  const master = context.createGain(),
    limiter = context.createDynamicsCompressor();
  master.gain.value = 0;
  limiter.threshold.value = -18;
  limiter.knee.value = 12;
  limiter.ratio.value = 6;
  limiter.attack.value = 0.01;
  limiter.release.value = 0.3;
  master.connect(limiter).connect(context.destination);

  const buffers = new Map<boolean, AudioBuffer>();
  function noiseBuffer(pink: boolean) {
    const existing = buffers.get(pink);
    if (existing) return existing;
    const buffer = context.createBuffer(
      2,
      context.sampleRate * 8,
      context.sampleRate,
    );
    let seed = pink ? 87031 : 19079;
    for (let channel = 0; channel < 2; channel++) {
      const samples = buffer.getChannelData(channel);
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
      for (let i = 0; i < samples.length; i++) {
        seed = (seed * 16807) % 2147483647;
        const white = (seed / 2147483647) * 2 - 1;
        if (!pink) {
          samples[i] = white * 0.5;
          continue;
        }
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        samples[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.1;
        b6 = white * 0.115926;
      }
    }
    buffers.set(pink, buffer);
    return buffer;
  }

  function layer(mode: SoundPreset) {
    const inlet = context.createGain(),
      lowpass = context.createBiquadFilter(),
      highpass = context.createBiquadFilter();
    const sources = new Set<AudioScheduledSourceNode>(),
      nodes = new Set<AudioNode>([inlet, lowpass, highpass]);
    let clock: ReturnType<typeof setInterval> | undefined;
    inlet.gain.value = 0;
    lowpass.type = "lowpass";
    lowpass.frequency.value =
      mode === "coast" ? 650 : mode === "noise" ? 1600 : 1900;
    lowpass.Q.value = 0.3;
    highpass.type = "highpass";
    highpass.frequency.value = 38;
    inlet.connect(lowpass).connect(highpass).connect(master);
    const keep = <T extends AudioNode>(node: T): T => {
      nodes.add(node);
      return node;
    };
    function start(
      source: AudioScheduledSourceNode,
      when = context.currentTime,
      duration?: number,
    ) {
      sources.add(source);
      source.onended = () => {
        source.disconnect();
        sources.delete(source);
      };
      source.start(when);
      if (duration !== undefined) source.stop(when + duration);
    }
    function modulation(target: AudioParam, frequency: number, depth: number) {
      const lfo = context.createOscillator(),
        gain = keep(context.createGain());
      lfo.frequency.value = frequency;
      gain.gain.value = depth;
      lfo.connect(gain).connect(target);
      start(lfo);
    }
    if (mode === "coast" || mode === "noise") {
      const source = context.createBufferSource(),
        level = keep(context.createGain());
      source.buffer = noiseBuffer(mode === "coast");
      source.loop = true;
      level.gain.value = mode === "coast" ? 0.8 : 0.5;
      source.connect(level).connect(inlet);
      if (mode === "coast") {
        modulation(level.gain, 0.085, 0.36);
        modulation(level.gain, 0.027, 0.16);
        modulation(lowpass.frequency, 0.043, 180);
      } else modulation(level.gain, 0.035, 0.025);
      start(source);
    } else {
      const midi = (note: number) => 440 * 2 ** ((note - 69) / 12);
      function key(
        note: number,
        when: number,
        duration: number,
        amplitude: number,
        pan = 0,
      ) {
        const envelope = keep(context.createGain()),
          stereo = keep(context.createStereoPanner());
        stereo.pan.value = pan;
        envelope.gain.setValueAtTime(0, when);
        envelope.gain.linearRampToValueAtTime(amplitude, when + 0.045);
        envelope.gain.exponentialRampToValueAtTime(
          amplitude * 0.24,
          when + duration * 0.45,
        );
        envelope.gain.exponentialRampToValueAtTime(0.00001, when + duration);
        envelope.connect(stereo).connect(inlet);
        for (const [ratio, amount] of [
          [1, 1],
          [2.005, 0.12],
        ]) {
          const voice = context.createOscillator(),
            harmonic = keep(context.createGain());
          voice.frequency.value = midi(note) * ratio;
          harmonic.gain.value = amount;
          voice.connect(harmonic).connect(envelope);
          start(voice, when, duration + 0.02);
          voice.onended = () => {
            voice.disconnect();
            harmonic.disconnect();
            sources.delete(voice);
            nodes.delete(harmonic);
          };
        }
        // Notes disconnect after their envelopes end, keeping long sessions bounded.
        const cleanup = context.createConstantSource();
        cleanup.offset.value = 0;
        start(cleanup, when, duration + 0.05);
        cleanup.onended = () => {
          cleanup.disconnect();
          sources.delete(cleanup);
          envelope.disconnect();
          stereo.disconnect();
          nodes.delete(envelope);
          nodes.delete(stereo);
        };
      }
      function brush(when: number, snare: boolean) {
        const source = context.createBufferSource(),
          envelope = context.createGain(),
          tone = context.createBiquadFilter();
        source.buffer = noiseBuffer(false);
        tone.type = "bandpass";
        tone.frequency.value = snare ? 800 : 1800;
        tone.Q.value = 0.4;
        envelope.gain.setValueAtTime(0, when);
        envelope.gain.linearRampToValueAtTime(
          snare ? 0.07 : 0.026,
          when + 0.02,
        );
        envelope.gain.exponentialRampToValueAtTime(0.00001, when + 0.24);
        source.connect(tone).connect(envelope).connect(inlet);
        start(source, when, 0.27);
        source.onended = () => {
          source.disconnect();
          tone.disconnect();
          envelope.disconnect();
          sources.delete(source);
        };
      }
      function kick(when: number) {
        const voice = context.createOscillator(),
          envelope = context.createGain();
        voice.frequency.setValueAtTime(80, when);
        voice.frequency.exponentialRampToValueAtTime(43, when + 0.22);
        envelope.gain.setValueAtTime(0, when);
        envelope.gain.linearRampToValueAtTime(0.16, when + 0.018);
        envelope.gain.exponentialRampToValueAtTime(0.00001, when + 0.38);
        voice.connect(envelope).connect(inlet);
        start(voice, when, 0.4);
        voice.onended = () => {
          voice.disconnect();
          envelope.disconnect();
          sources.delete(voice);
        };
      }
      const chords =
        mode === "jazz"
          ? [
              [53, 60, 64, 69, 72],
              [55, 62, 65, 69, 76],
              [52, 59, 62, 67, 71],
              [57, 61, 67, 71, 74],
            ]
          : [
              [56, 60, 63, 67, 70],
              [53, 60, 63, 67, 72],
              [48, 55, 58, 62, 67],
              [51, 58, 62, 65, 70],
            ];
      const beatLength = 60 / (mode === "jazz" ? 78 : 68);
      let beat = 0,
        next = context.currentTime + 0.06;
      const schedule = () => {
        while (next < context.currentTime + 1.5) {
          const chord = chords[Math.floor(beat / 8) % chords.length];
          if (beat % 8 === 0)
            chord.forEach((note, i) =>
              key(
                note,
                next + i * 0.018,
                beatLength * 5.8,
                0.065,
                (i - 2) * 0.16,
              ),
            );
          if (beat % 4 === 0 || beat % 4 === 2)
            key(
              chord[0] - 12 + (beat % 4 === 2 ? 7 : 0),
              next,
              beatLength * 1.5,
              0.16,
            );
          if (mode === "jazz") {
            brush(next + beatLength * 0.63, false);
            if (beat % 8 === 3 || beat % 8 === 6)
              key(
                chord[3] + 12,
                next + beatLength * 0.12,
                beatLength * 1.5,
                0.025,
                0.2,
              );
          } else {
            if (beat % 4 === 0 || beat % 4 === 2) kick(next);
            if (beat % 4 === 1 || beat % 4 === 3) brush(next, true);
            brush(next + beatLength * 0.56, false);
          }
          beat++;
          next += beatLength;
        }
      };
      schedule();
      clock = setInterval(schedule, 250);
    }
    inlet.gain.setTargetAtTime(1, context.currentTime, 0.22);
    return {
      fade() {
        inlet.gain.setTargetAtTime(0, context.currentTime, 0.16);
      },
      dispose() {
        clearInterval(clock);
        sources.forEach((source) => {
          try {
            source.stop();
          } catch {
            /* already ended */
          }
          source.disconnect();
        });
        sources.clear();
        nodes.forEach((node) => node.disconnect());
        nodes.clear();
      },
    };
  }
  let preset = initial,
    current = layer(initial);
  const layers = new Set([current]),
    timeouts = new Set<ReturnType<typeof setTimeout>>();
  return {
    context,
    preset(next: SoundPreset) {
      if (next === preset) return;
      preset = next;
      const previous = current;
      previous.fade();
      current = layer(next);
      layers.add(current);
      const timer = setTimeout(() => {
        previous.dispose();
        layers.delete(previous);
        timeouts.delete(timer);
      }, 1000);
      timeouts.add(timer);
    },
    volume(value: number) {
      master.gain.setTargetAtTime(
        Math.max(0, Math.min(1, value)) * 0.28,
        context.currentTime,
        value ? 0.2 : 0.06,
      );
    },
    close() {
      timeouts.forEach(clearTimeout);
      layers.forEach((active) => active.dispose());
      layers.clear();
      master.disconnect();
      limiter.disconnect();
      void context.close();
    },
  };
}
