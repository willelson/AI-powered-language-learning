import { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./static/css/App.css";

import ChatBubble from "./components/ChatBubble";
import MicrophoneButton from "./components/MicrophoneButton";

function App() {
  const { transcript, resetTranscript } = useSpeechRecognition();
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [utterance, setUtterance] = useState(null);

  useEffect(() => {
    setMessages([
      {
        role: "system",
        content:
          "You are helping me practice conversational german at the A1 level",
      },
    ]);

    const utterance = new SpeechSynthesisUtterance();
    utterance.lang = "de";
    utterance.rate = 0.8;
    utterance.voice = window.speechSynthesis
      .getVoices()
      .filter((voice) => voice.lang.startsWith("de"))[0];
    setUtterance(utterance);

    return () => console.log("unmounted");
  }, []);

  useEffect(() => {
    const getChatGPTResponse = async () => {
      const GPTmessage = await openAIRequest(transcript);
      setMessages([...messages, GPTmessage]);
      playBackRecognition(GPTmessage.content);
    };
    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      getChatGPTResponse();
    }
  }, [messages]);

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return (
      <div className="mircophone-container">
        Browser is not Support Speech Recognition.
      </div>
    );
  }

  const openAIRequest = async (message) => {
    const body = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [...messages, { role: "user", content: message }],
    });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
      },
      body,
    });

    const data = await res.json();

    const msg = data.choices[0].message;
    return msg;
  };

  const handleListening = async () => {
    if (!isListening) {
      setIsListening(true);

      SpeechRecognition.startListening({
        continuous: false,
        language: "de",
      });
    } else {
      const userMessage = { role: "user", content: transcript };
      stopListening();
      if (!transcript) return;

      setMessages([...messages, userMessage]);
    }
  };
  const stopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
  };

  function playBackRecognition(message) {
    utterance.text = message;
    window.speechSynthesis.speak(utterance);
  }

  const messagesList = messages.map((msg) => {
    if (msg.role !== "system") {
      return (
        <ChatBubble
          alignment={msg.role === "assistant" ? "left" : "right"}
          text={msg.content}
        />
      );
    }
  });

  return (
    <div className="application">
      <div className="container header">ChatGPT</div>
      <div className="container messages">
        {messages && <div className="message-container">{messagesList}</div>}
      </div>
      <div className="container chat-input centered">
        <MicrophoneButton
          listening={isListening}
          handleListening={handleListening}
        />
      </div>
    </div>
  );
}

export default App;
