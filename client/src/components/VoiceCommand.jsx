import React, { useEffect, useState, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff } from 'lucide-react';

const VoiceCommand = ({ onComando }) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [modalitaAttiva, setModalitaAttiva] = useState(false);
  const hotwordListening = useRef(false);

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      setModalitaAttiva(true);
      SpeechRecognition.startListening({ language: 'it-IT', continuous: false });
    }
  };

  // Ascolto ciclico per hotword "ehi crio"
  useEffect(() => {
    if (!modalitaAttiva && !hotwordListening.current) {
      hotwordListening.current = true;
      const interval = setInterval(() => {
        if (!listening) {
          resetTranscript();
          SpeechRecognition.startListening({ language: 'it-IT', continuous: false });
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [modalitaAttiva, listening]);

  useEffect(() => {
    const lowerTranscript = transcript.toLowerCase();

    if (!modalitaAttiva && lowerTranscript.includes("ehi crio")) {
      resetTranscript();
      SpeechRecognition.stopListening();
      setModalitaAttiva(true);
    }

    if (modalitaAttiva && transcript && !listening) {
      const comando = interpretaComando(transcript);
      console.log("🎙️ Comando interpretato:", comando);
      if (comando && onComando) {
        onComando(comando);
      }
      setModalitaAttiva(false);
      resetTranscript();
    }
  }, [transcript, listening, modalitaAttiva, onComando]);

  if (!browserSupportsSpeechRecognition) return null;

  return (
    <div className="relative flex items-center">
      <button onClick={toggleListening} className="p-1 hover:opacity-80">
        {listening ? <MicOff className="text-red-500 w-6 h-6" /> : <Mic className="text-white w-6 h-6" />}
      </button>
      {transcript && (
        <div className="absolute top-full right-0 mt-1 text-xs text-white bg-gray-900 p-2 rounded shadow-lg max-w-xs">
          <span className="font-semibold">Hai detto:</span> {transcript}
        </div>
      )}
    </div>
  );
};

function interpretaComando(testo) {
  const lower = testo.toLowerCase();

  if (lower.includes('aggiungi spesa')) {
    const prodotto = lower.match(/(?:spesa di|di nome|di) ([\w\s]+)/)?.[1]?.trim();
    const prezzoRaw = lower.match(/(?:costo|prezzo|costa)\s*(\d+[,.]?\d*)/)?.[1];
    const prezzo = prezzoRaw?.replace(',', '.');
    const negozio = lower.match(/nel negozio ([\w\s]+)/)?.[1]?.trim();
    const dataMatch = lower.match(/(?:il|in data)?\s*(\d{1,2}(?:\/|\s)?[a-z]+(?:\s\d{4})?)/i)?.[1];
    return {
      tipo: 'spesa',
      dati: {
        nuovoProdotto: prodotto || '',
        prezzo: prezzo || '',
        nuovoNegozio: negozio || '',
        data: dataMatch || ''
      }
    };
  }

  if (lower.includes('aggiungi prodotto')) {
    const nome = lower.match(/di nome ([\w\s]+)/)?.[1]?.trim();
    const categoria = lower.match(/categoria ([\w\s]+)/)?.[1]?.trim();
    return { tipo: 'prodotto', dati: { nome: nome || '', nuovaCategoria: categoria || '' } };
  }

  if (lower.includes('aggiungi categoria')) {
    const nome = lower.match(/di nome ([\w\s]+)/)?.[1]?.trim();
    const tipoRaw = lower.match(/di tipo ([\w]+)/)?.[1]?.trim();
    const entrata = tipoRaw === 'entrata';
    return { tipo: 'categoria', dati: { nome: nome || '', entrata } };
  }

  if (lower.includes('aggiungi negozio')) {
    const via = lower.match(/in via ([\w\s]+)/)?.[1]?.trim();
    const citta = lower.match(/a ([\w\s]+)/)?.[1]?.trim();
    const nome = `${via || ''} ${citta || ''}`.trim();
    return { tipo: 'negozio', dati: { nome, via: via || '', citta: citta || '' } };
  }

  return null;
}

export default VoiceCommand;
