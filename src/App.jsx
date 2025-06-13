import React, { useState, useEffect } from "react";

const FOLLOW_UPS = [
  { label: "💡 빠져나갈 구멍은 없을까?", prompt: "이 상황에서 혐의를 피할 수 있는 전략이 있을까요?" },
  { label: "📚 비슷한 사건 더 알려줘", prompt: "비슷한 사건의 실제 판례를 3개 더 알려줘." },
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
        body: JSON.stringify({ user_input: content, context: initialQuestion })
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
        placeholder="자세히 적어주실수록 더 정확한 조언을 드릴 수 있어요."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        rows={4}
        style={styles.textarea}
      />

      <button onClick={() => handleSubmit()} disabled={isLoading} style={styles.button}>
        {isLoading ? "🧠 생각 중..." : "질문하기"}
      </button>

      {aiResponse && (
        <div style={styles.responseBox}>
          <p style={styles.responseLabel}>🧑‍⚖️ AI 조언</p>
          <p style={styles.responseText}>{aiResponse}</p>
          <div style={styles.buttonGroup}>
            {FOLLOW_UPS.map(({ label, prompt }, idx) => {
              if (label === "⚖️ 변호사 추천해줘") {
                return (
                  <a
                    key={idx}
                    href="http://korea-lawyer.com/new_html_file.php?file=new_member_ranking.html&file2=new_default_member_ranking.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.followUpButton}
                  >
                    {label}
                  </a>
                );
              } else {
                return (
                  <button key={idx} onClick={() => handleSubmit(prompt)} style={styles.followUpButton}>
                    {label}
                  </button>
                );
              }
            })}
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
};

export default App;
