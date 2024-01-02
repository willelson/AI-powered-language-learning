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

  const responseInstructions = `
    Respond with a JSON object following this format.

    {
      "content": "your response to my message",
      "translation": "your response translated to English",
      "formatted": "previous user's message with corrected punctuation"
    }`;

  const initialSystemMessage = {
    role: "system",
    content: `Help me practice conversational German at the A1 level. Use vocabulary and phrases suitable for this level. \n${responseInstructions}`,
  };

  useEffect(() => {
    const chatHistory = window.localStorage.getItem("chatHistory");
    if (chatHistory) {
      setMessages(JSON.parse(chatHistory));
    } else {
      setMessages([initialSystemMessage]);
    }
    scrollToBottom();

    const utterance = new SpeechSynthesisUtterance();
    utterance.lang = "de";
    utterance.rate = 0.6;
    utterance.voice = window.speechSynthesis
      .getVoices()
      .filter((voice) => voice.lang.startsWith("de"))[0];
    setUtterance(utterance);

    return () => console.log("unmounted");
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      const element = document.getElementById("listOfMessages");
      if (!element) return;
      element.scrollIntoView({ block: "end", behavior: "smooth" });
    }, 100);
  };

  const clearChat = () => {
    localStorage.setItem("chatHistory", "");
    setMessages([initialSystemMessage]);
  };

  const openAIRequest = async (message) => {
    const chatMessages = messages.map((msg) => {
      const { role, content } = msg;
      return { role, content };
    });

    const body = JSON.stringify({
      model: "gpt-3.5-turbo-1106",
      messages: [...chatMessages, { role: "user", content: message }],
      response_format: {
        type: "json_object",
      },
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
    const { role, content } = msg;

    try {
      const response = { role, ...JSON.parse(content) };
      return response;
    } catch (err) {
      return {
        role,
        content,
        translation: "",
        formatted: "",
      };
    }
  };

  const formatUserMessage = (userMessage, ChatGPTResponse) => {
    if (ChatGPTResponse.role === "assistant" && ChatGPTResponse?.formatted) {
      return {
        ...userMessage,
        formatted: ChatGPTResponse.formatted,
      };
    } else return userMessage;
  };

  const handleListening = async () => {
    if (!isListening) {
      setIsListening(true);

      SpeechRecognition.startListening({
        continuous: true,
        language: "de",
      });
    } else {
      let userMessage = {
        role: "user",
        content: transcript,
        translation: "",
        formatted: "",
      };
      resetTranscript();
      stopListening();
      if (!transcript || transcript === "") return;

      setMessages((prev) => [...prev, userMessage]);

      const GPTmessage = await openAIRequest(transcript);
      const formattedUserMessage = formatUserMessage(userMessage, GPTmessage);
      window.localStorage.setItem(
        "chatHistory",
        JSON.stringify([...messages, formattedUserMessage, GPTmessage])
      );

      // Replace last user message with formatted version
      setMessages((prev) => [
        ...prev.slice(0, prev.length - 1),
        formattedUserMessage,
        GPTmessage,
      ]);

      scrollToBottom();
      playBackRecognition(GPTmessage.content);
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
      let message = msg.content;
      if (msg.role === "user" && msg.formatted !== "") {
        message = msg.formatted;
      }
      return (
        <ChatBubble
          alignment={msg.role === "assistant" ? "left" : "right"}
          message={message}
          translation={msg.translation}
        />
      );
    }
  });

  return (
    <div className="application">
      <div className="container header">
        <div className="title">ChatGPT</div>
        <div className="clear-chat-btn" onClick={clearChat}>
          Clear chat
        </div>
      </div>
      <div className="container messages">
        {messages && (
          <div className="message-container" id="listOfMessages">
            {messagesList}
            {/* <div id="anchor"></div> */}
          </div>
        )}
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
