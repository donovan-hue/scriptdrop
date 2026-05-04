import React, { useState, useEffect } from 'react';
import { useStory } from '../../hooks/useStory';
import './StoryPlayer.css';

const StoryPlayer = ({ storyId }) => {
  const { loading, error, story, progress, getStory, startStory, makeChoice } = useStory();
  const [currentNode, setCurrentNode] = useState(null);
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    getStory(storyId);
  }, [storyId, getStory]);

  useEffect(() => {
    if (!progress) {
      startStory(storyId).then(setCurrentNode);
    }
  }, [storyId, progress, startStory]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChoice = async (choiceIndex) => {
    const nextNode = await makeChoice(storyId, choiceIndex, sessionTime);
    if (nextNode) {
      setCurrentNode(nextNode);
      setSessionTime(0);
    }
  };

  if (loading) return <div className="story-player loading">Loading...</div>;
  if (error) return <div className="story-player error">{error}</div>;
  if (!currentNode) return <div className="story-player loading">Initializing...</div>;

  return (
    <div className="story-player">
      {currentNode.image && (
        <img src={currentNode.image} alt={currentNode.title} className="story-image" />
      )}
      <div className="story-content">
        <h2>{currentNode.title}</h2>
        <p>{currentNode.content}</p>
      </div>
      {!currentNode.isEnding ? (
        <div className="choices">
          {currentNode.choices.map((choice, idx) => (
            <button
              key={idx}
              className="choice-btn"
              onClick={() => handleChoice(idx)}
            >
              {choice.text}
            </button>
          ))}
        </div>
      ) : (
        <div className="ending-message">
          <p>Story Ended - {currentNode.endingType}</p>
        </div>
      )}
      <div className="session-timer">{Math.floor(sessionTime / 60)}:{sessionTime % 60}</div>
    </div>
  );
};

export default StoryPlayer;
