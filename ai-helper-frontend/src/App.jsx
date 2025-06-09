import React, { useState, useEffect } from "react";

const FOLLOW_UPS = [
  {
    label: "💡 빠져나갈 구멍은 없을까?",
    prompt: "이 상황에서 혐의를 피할 수 있는 전략이 있을까요?"
  },
  {
    label: "📚 비슷한 사건 더 알려줘",
    prompt: "비슷한 사건의 실제 판례를 3개 더 알려줘."
  },
  {
    label: "⚖️ 변호사 추천해줘",
    prompt: "이런 사건을 잘 다루는 변호사 유형은 어떤가요?"
  }
];

const App = () => {
  const [userInput, setUserInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = sessionStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    sessionStorage.setItem("chatHistory", JSON.stringify(history));
  }, [history]);

  const handleSubmit = async (input) => {
    const content = input || userInput;
    if (!content.trim()) return;
    setIsLoading(true);
    setUserInput("");

    if (!initialQuestion) {
      setInitialQuestion(content); // 첫 질문 저장
    }

    const messages = [
      ...history,
      { role: "user", content }
    ];

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_input: content,
          context: initialQuestion
        }),
      });

      const data = await response.json();
      let index = 0;
      setAiResponse("");

      const interval = setInterval(() => {
        setAiResponse((prev) => prev + data.response.charAt(index));
        index++;
        if (index >= data.response.length) clearInterval(interval);
      }, 30);

      setHistory([...messages, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Error:", error);
      setAiResponse("문제가 발생했어요.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    setInitialQuestion(null);
    setHistory([]);
    setAiResponse("");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚖️ 법률 상담 도우미</h1>

      <textarea
        placeholder="당한 상황이나 궁금한 점을 자세히 적어주세요"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        rows={4}
        style={styles.textarea}
      />

      <button onClick={() => handleSubmit()} disabled={isLoading} style={styles.button}>
        {isLoading ? "생각 중..." : "질문하기"}
      </button>

      {aiResponse && (
        <div style={styles.responseBox}>
          <p style={styles.responseLabel}>🧑‍⚖️ AI 조언</p>
          <p style={styles.responseText}>{aiResponse}</p>
          <div style={styles.buttonGroup}>
            {FOLLOW_UPS.map(({ label, prompt }, idx) => (
              <button
                key={idx}
                onClick={() => handleSubmit(prompt)}
                style={styles.followUpButton}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {initialQuestion && (
        <button onClick={resetConversation} style={styles.resetButton}>
          🔄 새 사건 시작하기
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 16px",
    fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#1f2937",
  },
  textarea: {
    width: "100%",
    maxWidth: "540px",
    padding: "14px",
    fontSize: "15px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    marginBottom: "14px",
    backgroundColor: "#fff",
    color: "#111827",
    resize: "vertical",
    boxSizing: "border-box",
  },
  button: {
    backgroundColor: "#2563eb",
    color: "#fff",
    fontSize: "15px",
    padding: "10px 20px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.15)",
  },
  responseBox: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "18px",
    maxWidth: "540px",
    width: "100%",
    boxSizing: "border-box",
  },
  responseLabel: {
    fontWeight: "600",
    marginBottom: "10px",
    color: "#111827",
  },
  responseText: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#374151",
    marginBottom: "12px",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  followUpButton: {
    padding: "10px",
    backgroundColor: "#f3f4f6",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    textAlign: "left",
    color: "#1f2937",
  },
  resetButton: {
    marginTop: "16px",
    fontSize: "14px",
    color: "#4b5563",
    backgroundColor: "transparent",
    border: "none",
    textDecoration: "underline",
    cursor: "pointer",
  },
};

export default App;
