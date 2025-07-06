import React, { useState, useEffect, useRef } from "react";

const FOLLOW_UPS = [
  { label: "💡 빠져나갈 구멍은 없을까?", prompt: "이 상황에서 혐의를 피할 수 있는 전략이 있을까요?" },
  { label: "💰 AI 추천 합의금", prompt: "이 형사사건에서 합의금은 어느 정도가 적절할까요?" },
  { label: "📚 비슷한 사건 더 알려줘", prompt: "비슷한 사건의 실제 판례를 3개 더 알려줘요." },
  { label: "⚖️ 변호사 추천해줘", prompt: "이런 사건을 잘 다루는 변호사 유형은 어떤가요?" }
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

  const typingIntervalRef = useRef(null);
  const responseEndRef = useRef(null); // ✅ 스크롤용 ref

  useEffect(() => {
    sessionStorage.setItem("chatHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiResponse]);

  const handleSubmit = async (input) => {
    if (isLoading) return;

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    const content = input || userInput;
    if (!content.trim()) return;
    setIsLoading(true);
    setUserInput("");

    if (!initialQuestion) setInitialQuestion(content);

    const messages = [...history, { role: "user", content }];

    try {
      const response = await fetch("https://ai-helper-mvp.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: content, context: initialQuestion })
      });
      const data = await response.json();
      let index = 0;
      const fullResponse = "💬 " + data.response; // ✅ 첫 글자 보장용
      setAiResponse("");

      typingIntervalRef.current = setInterval(() => {
        setAiResponse((prev) => prev + fullResponse.charAt(index));
        index++;
        if (index >= fullResponse.length) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
      }, 30);

      setHistory([...messages, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Error:", error);
      setAiResponse("문제가 발생했어요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
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
        onKeyDown={handleKeyDown}
        rows={4}
        style={styles.textarea}
      />

      <button
        onClick={() => handleSubmit()}
        disabled={isLoading}
        style={{
          ...styles.button,
          opacity: isLoading ? 0.5 : 1,
          pointerEvents: isLoading ? "none" : "auto"
        }}
      >
        {isLoading ? "생각 중..." : "질문하기"}
      </button>

      {aiResponse && (
        <div style={styles.responseBox}>
          {initialQuestion && (
            <div style={styles.userQuestion}>
              <p style={styles.questionLabel}>🙋 사용자 질문</p>
              <p style={styles.questionText}>{initialQuestion}</p>
            </div>
          )}

          <p style={styles.responseLabel}>🧑‍⚖️ AI 조언</p>
          <p style={styles.responseText}>{aiResponse}</p>

          <div style={styles.buttonGroup}>
            {FOLLOW_UPS.map(({ label, prompt }, idx) => (
              <button
                key={idx}
                onClick={() => !isLoading && handleSubmit(prompt)}
                disabled={isLoading}
                style={{
                  ...styles.followUpButton,
                  opacity: isLoading ? 0.5 : 1,
                  pointerEvents: isLoading ? "none" : "auto"
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div ref={responseEndRef} /> {/* ✅ 스크롤 포인트 */}
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
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "24px 16px 60px", // ✅ 하단 여백 확보
    fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
    width: "100vw",
    maxWidth: "100vw",
    overflowX: "hidden",
    boxSizing: "border-box",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#222",
  },
  textarea: {
    width: "100%",
    maxWidth: "94vw",
    padding: "16px",
    fontSize: "15px",
    borderRadius: "12px",
    border: "1px solid #ccc",
    marginBottom: "16px",
    backgroundColor: "#fff",
    color: "#222",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  button: {
    backgroundColor: "#2563eb",
    color: "#fff",
    fontSize: "16px",
    padding: "12px 24px",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "0.2s ease",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  responseBox: {
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    padding: "18px",
    maxWidth: "94vw",
    width: "100%",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  userQuestion: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },
  questionLabel: {
    fontWeight: "600",
    marginBottom: "8px",
    color: "#333",
  },
  questionText: {
    fontSize: "15px",
    color: "#111",
    whiteSpace: "pre-wrap",
  },
  responseLabel: {
    fontWeight: "600",
    marginBottom: "12px",
    color: "#1e1e1e",
  },
  responseText: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#333",
    marginBottom: "12px",
    whiteSpace: "pre-wrap",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  followUpButton: {
    padding: "10px 14px",
    backgroundColor: "#f3f4f6",
    border: "1px solid #ddd",
    borderRadius: "10px",
    fontSize: "14px",
    cursor: "pointer",
    textAlign: "left",
    color: "#111",
  },
  resetButton: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#666",
    backgroundColor: "transparent",
    border: "none",
    textDecoration: "underline",
    cursor: "pointer",
  },
};

export default App;
