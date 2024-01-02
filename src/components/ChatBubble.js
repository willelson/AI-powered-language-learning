import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLanguage,
  faEyeSlash,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../static/css/ChatBubble.module.css";

function ChatBubble({ message, alignment, translation }) {
  const showTranslationIcon = () => alignment === "left";
  return (
    <div className={`chat-bubble ${styles.bubble} ${styles[alignment]}`}>
      <div className={styles.controls}>
        <span title="listen" style={{ cursor: "pointer" }}>
          <FontAwesomeIcon icon={faVolumeHigh} />
        </span>
        {showTranslationIcon() && (
          <span title={translation} style={{ cursor: "pointer" }}>
            <FontAwesomeIcon icon={faLanguage} />
          </span>
        )}
        <span title="hide text" style={{ cursor: "pointer" }}>
          <FontAwesomeIcon icon={faEyeSlash} />
        </span>
      </div>
      {message}
    </div>
  );
}

export default ChatBubble;
