import { useRef, useState, useCallback, useEffect } from "react";

function getSpeechRecognitionCtor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function useSpeechToText({ onResult, onError } = {}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const finalBufferRef = useRef("");
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  });

  const isSupported = !!getSpeechRecognitionCtor();

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) {
      onErrorRef.current?.(
        "Voice input isn't supported in this browser. Try Chrome or Edge.",
      );
      return;
    }

    recognitionRef.current?.stop();
    finalBufferRef.current = "";

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";

    recognition.onresult = (e) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalBufferRef.current += `${text} `;
        } else {
          interimText += text;
        }
      }
      onResultRef.current?.(`${finalBufferRef.current}${interimText}`.trim());
    };

    recognition.onerror = (e) => {
      if (e.error === "no-speech") return;
      setIsListening(false);
      onErrorRef.current?.(
        e.error === "not-allowed"
          ? "Microphone access was denied. Allow it in your browser's site settings to use voice input."
          : `Voice input error: ${e.error}`,
      );
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return { isSupported, isListening, startListening, stopListening };
}
