import React from "react";
import styles from "../static/css/ChatBubble.module.css";

// Using codepen example https://codepen.io/t_afif/pen/eYMbrJN

function ChatBubble({ text, alignment }) {
  return <div className={`${styles.bubble} ${styles[alignment]}`}>{text}</div>;
}

export default ChatBubble;
