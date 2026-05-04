import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StoryList.css';

const StoryList = ({ userOnly = false }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('-createdAt');

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const url = userOnly ? '/api/stories/user/my-stories' : '/api/stories/published';
        const params = userOnly ? {} : { genre: genre || undefined, sort };
        const response = await axios.get(url, { params });
        setStories(response.data.data);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, [userOnly, genre, sort]);

  return (
    <div className="story-list">
      {!userOnly && (
        <div className="filters">
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="">All Genres</option>
            <option value="adventure">Adventure</option>
            <option value="fantasy">Fantasy</option>
            <option value="sci-fi">Sci-Fi</option>
            <option value="mystery">Mystery</option>
            <option value="romance">Romance</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="-createdAt">Newest</option>
            <option value="-stats.plays">Most Played</option>
            <option value="-rating.average">Top Rated</option>
          </select>
        </div>
      )}
      {loading ? <p>Loading...</p> : (
        <div className="stories-grid">
          {stories.map(story => (
            <div key={story._id} className="story-card">
              {story.cover && <img src={story.cover} alt={story.title} />}
              <h3>{story.title}</h3>
              <p className="genre">{story.genre}</p>
              <p className="description">{story.description}</p>
              <div className="stats">
                <span>👁️ {story.stats.views}</span>
                <span>▶️ {story.stats.plays}</span>
                <span>⭐ {story.rating.average.toFixed(1)}</span>
              </div>
              <a href={`/story/${story._id}`} className="play-btn">Play Story</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoryList;
