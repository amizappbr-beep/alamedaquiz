import React, { useState } from "react";
import axios from "axios";
import "@/App.css";
import Intro from "./components/Intro";
import Quiz from "./components/Quiz";
import LeadForm from "./components/LeadForm";
import Result from "./components/Result";
import { classifyAnswers, QUIZ_QUESTIONS } from "./lib/quizData";
import { Toaster, toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function App() {
  const [stage, setStage] = useState("intro"); // intro | quiz | form | result
  const [answers, setAnswers] = useState({});
  const [classification, setClassification] = useState(null);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const startQuiz = () => setStage("quiz");

  const onQuizComplete = (quizAnswers) => {
    setAnswers(quizAnswers);
    setClassification(classifyAnswers(quizAnswers));
    setStage("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onLeadSubmit = async ({ name: n, phone }) => {
    setSubmitting(true);
    const cls = classification || classifyAnswers(answers);
    const payloadAnswers = QUIZ_QUESTIONS.map((q) => ({
      question_id: q.id,
      question: q.prompt,
      answer: answers[q.id]?.label || "",
    }));
    try {
      await axios.post(`${API}/leads`, {
        name: n,
        phone,
        answers: payloadAnswers,
        classification: cls,
      });
      setName(n);
      setClassification(cls);
      setStage("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      toast.error("Não conseguimos salvar seus dados agora. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setAnswers({});
    setClassification(null);
    setName("");
    setStage("intro");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="App" data-testid="app-root">
      <Toaster position="top-center" richColors />
      {stage === "intro" && <Intro onStart={startQuiz} />}
      {stage === "quiz" && (
        <Quiz onComplete={onQuizComplete} onBack={() => setStage("intro")} />
      )}
      {stage === "form" && (
        <LeadForm onSubmit={onLeadSubmit} submitting={submitting} />
      )}
      {stage === "result" && (
        <Result
          classification={classification}
          name={name}
          onRestart={restart}
        />
      )}
    </div>
  );
}
