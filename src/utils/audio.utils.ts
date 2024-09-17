interface AnalyzerJob {
  targetEl: HTMLElement;
  lastAnalyzed?: DOMHighResTimeStamp;
  requestAnimationFrameId?: ReturnType<typeof requestAnimationFrame>;
  audioActivityDelayTimeoutId?: NodeJS.Timeout;
}

const AUDIO_ACTIVITY_THRESHOLD = 0.025;

const analyzerJobs = new Map<string, AnalyzerJob>();
let globalAudioContext: AudioContext;

function getAudioContext() {
  function handleAudioContextStateChange() {
    if (globalAudioContext?.state !== 'running') {
      globalAudioContext.resume();
    }
  }

  if (!globalAudioContext) {
    globalAudioContext = new AudioContext();
    globalAudioContext.addEventListener(
      'statechange',
      handleAudioContextStateChange
    );
  }

  return globalAudioContext;
}

function createAudioDestinationNode() {
  return getAudioContext().createMediaStreamDestination();
}

function createAnalyzer(id: string, audioStream: MediaStream) {
  // Create an analyzer node
  const audioContext = getAudioContext();
  const analyzer = audioContext.createAnalyser();
  analyzer.fftSize = 1024;

  // Create a MediaStreamAudioSourceNode and connect it to the analyzer node
  function onMediaStreamSourceEnded() {
    source.disconnect();
    stopAnalyzer(id);
  }

  const source = globalAudioContext.createMediaStreamSource(audioStream);
  source.connect(analyzer);
  source.addEventListener('ended', onMediaStreamSourceEnded);

  return analyzer;
}

function startAnalyzer({
  id,
  targetEl,
  analyzer,
  mediaStream,
  targetRefreshRate
}: {
  id: string;
  targetEl: HTMLElement;
  analyzer: AnalyserNode;
  mediaStream: MediaStream;
  targetRefreshRate: number;
}) {
  const [audioTrack] = mediaStream.getAudioTracks();
  const bufferLength = analyzer.frequencyBinCount; // frequencyBinCount is half the value of fftSize
  const pcmData = new Float32Array(bufferLength); // "Pulse-code modulation" data with value domain [-1, 1]

  function analyze(timestamp: DOMHighResTimeStamp) {
    const job = analyzerJobs.get(id);

    if (!job) {
      return;
    }

    let { lastAnalyzed = timestamp, audioActivityDelayTimeoutId } = job;
    const delta = timestamp - lastAnalyzed;
    const targetRefreshInterval = 1000 / targetRefreshRate;

    if (delta > targetRefreshInterval) {
      lastAnalyzed = timestamp - (delta % targetRefreshInterval);

      if (audioTrack.readyState === 'ended') {
        stopAnalyzer(id);
        analyzeAudio(mediaStream, targetEl, targetRefreshRate);

        return;
      }

      analyzer.getFloatTimeDomainData(pcmData);

      let sumOfSquares = 0;
      for (let i = 0; i < bufferLength; i += 1) {
        sumOfSquares += pcmData[i] ** 2;
      }

      const rootMeanSquare = Math.sqrt(sumOfSquares / bufferLength);
      const isActive = rootMeanSquare > AUDIO_ACTIVITY_THRESHOLD;
      const audioIndicatorEl = targetEl.querySelector(
        '.audio-indicator'
      ) as HTMLElement;
      const audioPingEl = targetEl.querySelector('.audio-ping') as HTMLElement;

      if (isActive) {
        clearTimeout(audioActivityDelayTimeoutId);
        audioActivityDelayTimeoutId = undefined;

        // Add animation classes to the ping element
        audioPingEl.classList.remove('animate-none');
        audioPingEl.classList.add('animate-ping');

        const scale = Math.min(1.25 + rootMeanSquare * 10, 3);
        audioIndicatorEl.style.transform = `scale(${scale})`;
      } else if (!audioActivityDelayTimeoutId) {
        // Add the stop animation class to end the animation once the animation iteration ends
        audioPingEl.classList.add('stop-animation');
        // Remove the transform css to stop the animation
        audioIndicatorEl.style.removeProperty('transform');
      }
    }

    const requestAnimationFrameId = requestAnimationFrame(analyze);

    analyzerJobs.set(id, {
      targetEl,
      lastAnalyzed,
      requestAnimationFrameId,
      audioActivityDelayTimeoutId
    });
  }

  requestAnimationFrame(analyze);
}

function stopAnalyzer(id: string) {
  const job = analyzerJobs.get(id);

  if (job) {
    const { requestAnimationFrameId } = job;

    if (requestAnimationFrameId) {
      cancelAnimationFrame(requestAnimationFrameId);
    }

    analyzerJobs.delete(id);
  }
}

function analyzeAudio(
  mediaStream: MediaStream,
  targetEl: HTMLElement,
  targetRefreshRate = 30
) {
  const [audioTrack] = mediaStream.getAudioTracks();
  const { id } = mediaStream || {};

  if (!audioTrack || analyzerJobs.has(id)) {
    return;
  }

  const analyzer = createAnalyzer(id, mediaStream);
  analyzerJobs.set(id, { targetEl });

  startAnalyzer({
    id,
    targetEl,
    analyzer,
    mediaStream,
    targetRefreshRate
  });

  return () => stopAnalyzer(id);
}

export { analyzeAudio, createAudioDestinationNode, getAudioContext };