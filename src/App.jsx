import React, { useState, useEffect } from "react";

const FOLLOW_UPS = [
  {
    label: "💡 빠져나갈 구멍은 없을까?",
    prompt: "이 상황에서 혐의를 피할 수 있는 전략이 있을까요?",
    external: false,
  },
  {
    label: "📚 비슷한 사건 더 알려줘",
    prompt: "비슷한 사건의 실제 판례를 3개 더 알려줘.",
    external: false,
  },
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

    if (!initialQuestion) setInitialQuestion(content);

    const messages = [...history, { role: "user", content }];

    try {
      const response = await fetch("https://ai-helper-mvp.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: content, context: initialQuestion }),
      });
      const data = await response.json();
      setAiResponse(data.response);
      setHistory([...messages, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Error:", error);
      setAiResponse("문제가 발생했어요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpClick = (item) => {
    if (isLoading) return;
    handleSubmit(item.prompt);
  };

  const resetConversation = () => {
    setInitialQuestion(null);
    setHistory([]);
    setAiResponse("");
  };

  const handleLawyerLink = () => {
    window.open(
      "http://korea-lawyer.com/new_html_file.php?file=new_member_ranking.html&file2=new_default_member_ranking.html",
      "_blank"
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚖️ 법률 상담 도우미</h1>

      <textarea
        placeholder="자세히 이야기할수록 더 정확한 조언을 받을 수 있어요"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        rows={4}
        style={styles.textarea}
      />

      <button
        onClick={() => handleSubmit()}
        disabled={isLoading}
        style={{ ...styles.button, opacity: isLoading ? 0.5 : 1 }}
      >
        {isLoading ? "생각 중..." : "질문하기"}
      </button>

      {aiResponse && (
        <div style={styles.responseBox}>
          <p style={styles.responseLabel}>🧑‍⚖️ AI 조언</p>
          <p style={styles.responseText}>{aiResponse}</p>
          <div style={styles.buttonGroup}>
            {FOLLOW_UPS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleFollowUpClick(item)}
                disabled={isLoading}
                style={{
                  ...styles.followUpButton,
                  opacity: isLoading ? 0.6 : 1,
                  pointerEvents: isLoading ? "none" : "auto",
                }}
              >
                {item.label}
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

      <button onClick={handleLawyerLink} style={styles.lawyerLinkButton}>
        👩‍⚖️ 변호사 쉽게 모아보기
      </button>
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
    fontFamily: "'Noto Sans KR', sans-serif",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#1f2937",
  },
  textarea: {
    width: "100%",
    maxWidth: "500px",
    padding: "16px",
    fontSize: "15px",
    borderRadius: "12px",
    border: "1px solid #ccc",
    marginBottom: "16px",
    backgroundColor: "#fff",
    color: "#111",
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
    marginBottom: "24px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  },
  responseBox: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "20px",
    maxWidth: "500px",
    width: "100%",
    boxSizing: "border-box",
    marginBottom: "16px",
    whiteSpace: "pre-wrap",
  },
  responseLabel: {
    fontWeight: "600",
    marginBottom: "12px",
    fontSize: "16px",
    color: "#111827",
  },
  responseText: {
    fontSize: "15px",
    lineHeight: "1.7",
    color: "#333",
    marginBottom: "12px",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  followUpButton: {
    padding: "12px 16px",
    backgroundColor: "#f3f4f6",
    border: "1px solid #ddd",
    borderRadius: "12px",
    fontSize: "15px",
    cursor: "pointer",
    textAlign: "left",
    color: "#111",
    boxShadow: "inset 0 1px 0 #fff",
    transition: "all 0.2s ease",
  },
  resetButton: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#6b7280",
    backgroundColor: "transparent",
    border: "none",
    textDecoration: "underline",
    cursor: "pointer",
  },
  lawyerLinkButton: {
    marginTop: "30px",
    fontSize: "15px",
    backgroundColor: "#10b981",
    color: "#fff",
    padding: "14px 20px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  },
};

export default App;
