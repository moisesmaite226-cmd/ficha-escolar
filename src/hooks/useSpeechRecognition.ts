import { useState, useEffect, useRef, useCallback } from 'react';

// Declarations for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore stop errors if already stopped
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setActiveTargetId(null);
  }, []);

  const startListening = useCallback(
    (targetId: string, onText: (text: string) => void) => {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setError('O reconhecimento de voz não é suportado pelo seu navegador atual. Recomendamos o Google Chrome ou Microsoft Edge.');
        return;
      }

      // Stop previous instance if running
      if (recognitionRef.current) {
        stopListening();
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setActiveTargetId(targetId);
          setError(null);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let chunk = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              chunk += event.results[i][0].transcript;
            }
          }
          if (chunk.trim()) {
            onText(chunk.trim());
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setError('Permissão de microfone negada. Por favor, permita o acesso ao microfone no navegador.');
          } else if (event.error === 'no-speech') {
            // normal timeout if user stopped talking
          } else {
            setError(`Aviso de voz: ${event.error}`);
          }
          setIsListening(false);
          setActiveTargetId(null);
        };

        recognition.onend = () => {
          setIsListening(false);
          setActiveTargetId(null);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err: any) {
        console.error('Error starting speech recognition:', err);
        setError('Não foi possível iniciar o microfone. Verifique as permissões.');
        setIsListening(false);
        setActiveTargetId(null);
      }
    },
    [stopListening]
  );

  return {
    isListening,
    activeTargetId,
    error,
    isSupported,
    startListening,
    stopListening,
    clearError: () => setError(null),
  };
}
