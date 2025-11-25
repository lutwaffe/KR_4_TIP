import { useState } from "react";
import WordCard from "./WordCard";
import { words } from "./data";
import "./styles.css";

function App() {
  const [currentWord, setCurrentWord] = useState(null);
  const [showTranslation, setShowTranslation] = useState(false);

  const getRandomWord = () => {
    const index = Math.floor(Math.random() * words.length);
    setCurrentWord(words[index]);
    setShowTranslation(false);
  };

  return (
    <div>
      <h1>Тренажёр слов</h1>

      {!currentWord ? (
        <div className="start-screen">
          <button className="btn primary" onClick={getRandomWord}>
            Показать слово
          </button>
        </div>
      ) : (
        <WordCard
          wordObj={currentWord}
          showTranslation={showTranslation}
          onShowTranslation={() => setShowTranslation(true)}
          onNext={getRandomWord}
        />
      )}
    </div>
  );
}

export default App;
