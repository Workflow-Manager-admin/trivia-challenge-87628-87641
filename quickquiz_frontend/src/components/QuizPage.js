import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchQuestions, submitAnswer, startMultiplayer, answerMulti } from "../services/api";

/**
 * QuizPage component: 
 * - Single/multiplayer quiz game UI.
 * - Shows questions, handles selection/timer, interacts with API, manages WebSocket for multiplayer.
 */
export default function QuizPage({ ws, connectWebSocket, onFinish }) {
  const { mode, category } = useParams();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timer, setTimer] = useState(20);
  const [scores, setScores] = useState([]); // for multiplayer
  const [loading, setLoading] = useState(true);
  const [answered, setAnswered] = useState(false);
  const wsRef = useRef(ws);

  useEffect(() => {
    if (mode === "single") {
      fetchQuestions(category).then(qs => {
        setQuestions(qs);
        setLoading(false);
      });
    } else {
      // Multiplayer:
      setLoading(true);
      const wsInst = wsRef.current || connectWebSocket();
      wsRef.current = wsInst;
      wsInst.onopen = () => {
        wsInst.send(JSON.stringify({ type: "JOIN", category }));
      };
      wsInst.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "QUESTIONS") {
          setQuestions(message.questions);
          setScores(message.scores || []);
          setLoading(false);
        }
        if (message.type === "SCORES") {
          setScores(message.scores);
        }
        if (message.type === "GAME_OVER") {
          onFinish(message.results);
        }
      };
      return () => wsInst.close();
    }
  }, [category, mode, connectWebSocket, onFinish]);

  // Timer effect
  useEffect(() => {
    if (loading || answered) return;
    if (timer === 0) {
      handleNoAnswer();
      return;
    }
    const t = setTimeout(() => setTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, loading, answered]);

  const handleSelect = (option) => {
    if (answered) return;
    setAnswered(true);
    if (mode === "single") {
      submitAnswer(questions[current].id, option).then(() => {
        setUserAnswers(ans => [...ans, option]);
        goNext();
      });
    } else {
      // Multiplayer: send over WebSocket
      answerMulti(wsRef.current, questions[current].id, option);
      setUserAnswers(ans => [...ans, option]);
      goNext();
    }
  };

  const handleNoAnswer = () => {
    setAnswered(true);
    setUserAnswers(ans => [...ans, null]);
    goNext();
  };

  const goNext = () => {
    setTimeout(() => {
      setTimer(20);
      setAnswered(false);
      if (current + 1 < questions.length) {
        setCurrent(cur => cur + 1);
      } else {
        if (mode === "single") {
          onFinish({ answers: userAnswers });
        }
        // multiplayer calls onFinish via ws on GAME_OVER message
      }
    }, 700);
  };

  if (loading) return (<div style={{ margin: 60 }}>Loading quiz…</div>);
  if (!questions.length) return (<div>No questions found for this category.</div>);

  const question = questions[current];

  return (
    <div className="quiz-container" style={{
      maxWidth: 520,
      margin: "0 auto",
      background: "var(--bg-secondary)",
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.10)"
    }}>
      <h3 style={{ marginBottom: 10 }}>Question {current + 1} / {questions.length}</h3>
      <div style={{ fontWeight: 600, fontSize: 19, marginBottom: 16 }}>{question.text}</div>
      <div>
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            className="btn"
            style={{
              ...optionBtnStyle,
              background: answered && question.answer === opt ? "#34a853" : "var(--bg-primary)",
              color: answered ? "#fff" : "var(--text-primary)"
            }}
            disabled={answered}
            onClick={() => handleSelect(opt)}
          >{opt}</button>
        ))}
      </div>
      <div style={{ margin: "18px 0", color: "#e23c3c", fontWeight: 500 }}>
        Time left: {timer}s
      </div>
      {mode === "multi" && (
        <div style={{ marginTop: 20 }}>
          <strong>Realtime Leaderboard</strong>
          {scores.map(user => (
            <div key={user.username}>
              {user.username}: {user.score}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const optionBtnStyle = {
  display: "block",
  width: "100%",
  padding: "10px 0",
  borderRadius: 8,
  border: "1px solid var(--border-color)",
  margin: "10px 0",
  fontWeight: 500,
  fontSize: 16,
  cursor: "pointer"
};
