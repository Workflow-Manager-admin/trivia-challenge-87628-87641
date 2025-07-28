import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchQuestions, submitAnswers, startMultiplayer, answerMulti } from "../services/api";

/**
 * QuizPage component: 
 * - Single/multiplayer quiz game UI.
 * - Shows questions, handles selection/timer, interacts with API, manages WebSocket for multiplayer.
 */
export default function QuizPage({ ws, connectWebSocket, onFinish }) {
  const { mode, category } = useParams();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]); // stores actual {question_id, answer}
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
      // Multiplayer (updating message shapes needed if backend is changed)
      setLoading(true);
      const wsInst = wsRef.current || connectWebSocket();
      wsRef.current = wsInst;
      wsInst.onopen = () => {
        // Must now use WebSocket protocol matching backend (backend expects action: "join", data: {category_id})
        // Get category id
        fetch("/categories")
          .then(res => res.json())
          .then(allCats => {
            const catObj = allCats.find(c => c.name === category);
            if (catObj)
              wsInst.send(JSON.stringify({ action: "join", data: { category_id: catObj.id } }));
          });
      };
      wsInst.onmessage = (event) => {
        const message = JSON.parse(event.data);
        // backend sends {type: "game_start", questions: [...]}
        if (message.type === "game_start" && message.questions) {
          setQuestions(
            message.questions.map(q => ({
              id: q.id,
              text: q.question,
              options: q.choices,
              answer: undefined,
            }))
          );
          setScores([]); // no initial scores
          setLoading(false);
        }
        if (message.type === "score_update" && message.scores) {
          setScores(
            Object.entries(message.scores).map(([username, score]) => ({ username, score }))
          );
        }
        if (message.type === "GAME_OVER" || message.type === "game_end") {
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
      // Just store the answer; we'll submit all at once at the end.
      setUserAnswers(ans => [
        ...ans, { question_id: questions[current].id, answer: option }
      ]);
      goNext();
    } else {
      // Multiplayer: send over WebSocket using backend's schema {action:"answer",data:{question_id,answer}}
      if (wsRef.current) {
        wsRef.current.send(
          JSON.stringify({
            action: "answer",
            data: { question_id: questions[current].id, answer: option }
          })
        );
      }
      setUserAnswers(ans => [...ans, { question_id: questions[current].id, answer: option }]);
      goNext();
    }
  };

  const handleNoAnswer = () => {
    setAnswered(true);
    setUserAnswers(ans => [
      ...ans, { question_id: questions[current]?.id, answer: "" }
    ]);
    goNext();
  };

  const goNext = () => {
    setTimeout(async () => {
      setTimer(20);
      setAnswered(false);
      if (current + 1 < questions.length) {
        setCurrent(cur => cur + 1);
      } else {
        if (mode === "single") {
          // SUBMIT batch of answers for this category
          try {
            const results = await submitAnswers(userAnswers, category);
            onFinish(results);
          } catch {
            onFinish({ error: "Failed to submit answers!" });
          }
        }
        // Multiplayer: onFinish is called via ws on game_end
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
