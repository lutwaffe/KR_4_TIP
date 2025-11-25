import React from "react";
import "./styles.css";

function WordCard({ wordObj, showTranslation, onShowTranslation, onNext }) {
  if (!wordObj) return null;

  return (
    <div className="card">
      <h2 className="word">{wordObj.word}</h2>

      {showTranslation && (
        <p className="translation">{wordObj.translation}</p>
      )}

      <div className="buttons">
        {!showTranslation && (
          <button className="btn primary" onClick={onShowTranslation}>
            Показать перевод
          </button>
        )}

        <button className="btn secondary" onClick={onNext}>
          Следующее слово
        </button>
      </div>
    </div>
  );
}

export default WordCard;
