import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import styles from "../static/css/MicrophoneButton.module.css";

function MicrophoneButton({ listening, handleListening }) {
  return (
    <div
      onClick={handleListening}
      className={
        "centered " +
        `${styles.button}` +
        " " +
        `${listening ? styles.pulse : ""}`
      }
    >
      <FontAwesomeIcon
        icon={listening ? faPaperPlane : faMicrophone}
        size="2x"
      />
    </div>
  );
}

export default MicrophoneButton;
