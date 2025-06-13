// src/components/TTSPlayer.jsx
import React from "react";

export default function TTSPlayer({ text }) {
  const playAudio = async () => {
    const response = await fetch("http://localhost:8000/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_input: text }),
    });

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <button onClick={playAudio} style={{ padding: "10px 20px", borderRadius: "12px" }}>
      🔊 음성 듣기
    </button>
  );
}
