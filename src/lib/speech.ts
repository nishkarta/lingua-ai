export interface SpeechOptions {
  voiceURI?: string;
  rate?: number;
  pitch?: number;
  lang?: string;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

// Speaks text using the browser's native SpeechSynthesis
export const speakText = (text: string, options: SpeechOptions = {}): boolean => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate ?? 1.0;
  utterance.pitch = options.pitch ?? 1.0;
  utterance.lang = options.lang || 'en-US';

  if (options.voiceURI) {
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.voiceURI === options.voiceURI);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  if (options.onEnd) {
    utterance.onend = () => options.onEnd?.();
  }

  if (options.onError) {
    utterance.onerror = (e) => options.onError?.(e);
  }

  window.speechSynthesis.speak(utterance);
  return true;
};

// Stops any current speech
export const stopSpeech = (): void => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// Retrieves all English voices available in the browser
export const getEnglishVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
      return englishVoices.length > 0 ? englishVoices : voices;
    };

    const initial = loadVoices();
    if (initial.length > 0) {
      resolve(initial);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      resolve(loadVoices());
    };

    // Timeout fallback if onvoiceschanged doesn't trigger
    setTimeout(() => {
      resolve(loadVoices());
    }, 500);
  });
};

// Interface for Browser Web Speech Recognition
export interface SpeechRecognitionListener {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onStart: () => void;
  onEnd: () => void;
}

export interface SpeechRecognizerController {
  start: () => void;
  stop: () => void;
  abort: () => void;
  isSupported: boolean;
}

// Web Speech API recognition interface declarations
interface IWindowSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

// Factory for creating a Speech Recognizer
export const createSpeechRecognizer = (
  listener: SpeechRecognitionListener,
  lang: string = 'en-US'
): SpeechRecognizerController => {
  if (typeof window === 'undefined') {
    return {
      start: () => {},
      stop: () => {},
      abort: () => {},
      isSupported: false,
    };
  }

  // Cross-browser compatibility for webkitSpeechRecognition
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionAPI) {
    return {
      start: () => listener.onError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'),
      stop: () => {},
      abort: () => {},
      isSupported: false,
    };
  }

  const recognition: IWindowSpeechRecognition = new SpeechRecognitionAPI();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = lang;

  recognition.onstart = () => {
    listener.onStart();
  };

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const fullTranscript = finalTranscript || interimTranscript;
    listener.onResult(fullTranscript, Boolean(finalTranscript));
  };

  recognition.onerror = (event: { error: string }) => {
    listener.onError(event.error);
  };

  recognition.onend = () => {
    listener.onEnd();
  };

  return {
    start: () => {
      try {
        recognition.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (err) {
        console.warn('Recognition stop error:', err);
      }
    },
    abort: () => {
      try {
        recognition.abort();
      } catch (err) {
        console.warn('Recognition abort error:', err);
      }
    },
    isSupported: true,
  };
};

// Calculates Levenshtein distance between two strings
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Clean and normalize words for linguistic comparison
function cleanWord(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Evaluates pronunciation accuracy word-by-word
export interface WordComparison {
  word: string;
  matched: boolean;
  status: 'correct' | 'near' | 'missed';
  recognized?: string;
}

export function evaluatePronunciationAccuracy(
  targetSentence: string,
  spokenSentence: string
): { score: number; words: WordComparison[]; feedback: string } {
  const targetTokens = targetSentence.split(/\s+/).filter(Boolean);
  const spokenTokens = spokenSentence.split(/\s+/).filter(Boolean);

  if (targetTokens.length === 0) {
    return { score: 0, words: [], feedback: 'No sentence specified.' };
  }

  let totalScore = 0;
  const words: WordComparison[] = [];
  let spokenIndex = 0;

  for (let i = 0; i < targetTokens.length; i++) {
    const rawTarget = targetTokens[i];
    const cleanedTarget = cleanWord(rawTarget);

    let bestMatchStatus: 'correct' | 'near' | 'missed' = 'missed';
    let recognizedWord = '';
    let matchPoints = 0;

    // Search ahead up to 2 positions in spoken tokens for alignment
    for (let lookahead = 0; lookahead <= 2 && spokenIndex + lookahead < spokenTokens.length; lookahead++) {
      const candidate = spokenTokens[spokenIndex + lookahead];
      const cleanedCandidate = cleanWord(candidate);

      if (cleanedTarget === cleanedCandidate) {
        bestMatchStatus = 'correct';
        recognizedWord = candidate;
        matchPoints = 1.0;
        spokenIndex = spokenIndex + lookahead + 1;
        break;
      } else {
        const dist = levenshteinDistance(cleanedTarget, cleanedCandidate);
        const maxLen = Math.max(cleanedTarget.length, cleanedCandidate.length);
        const similarity = maxLen > 0 ? (maxLen - dist) / maxLen : 0;

        if (similarity >= 0.7) {
          bestMatchStatus = 'near';
          recognizedWord = candidate;
          matchPoints = 0.7;
          spokenIndex = spokenIndex + lookahead + 1;
          break;
        }
      }
    }

    words.push({
      word: rawTarget,
      matched: bestMatchStatus === 'correct',
      status: bestMatchStatus,
      recognized: recognizedWord || undefined,
    });

    totalScore += matchPoints;
  }

  const finalScore = Math.round((totalScore / targetTokens.length) * 100);

  let feedback = 'Keep practicing!';
  if (finalScore >= 90) {
    feedback = 'Outstanding pronunciation! Clear, natural, and accurately articulated.';
  } else if (finalScore >= 75) {
    feedback = 'Great job! Most words were articulated clearly with minor accent variations.';
  } else if (finalScore >= 50) {
    feedback = 'Good attempt. Pay attention to the highlighted words and listen to the reference audio.';
  } else {
    feedback = 'Try listening to the native sample audio first, then speak slowly and distinctly.';
  }

  return {
    score: finalScore,
    words,
    feedback,
  };
}
