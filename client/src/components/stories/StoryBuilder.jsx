import React, { useState } from 'react';
import axios from 'axios';
import './StoryBuilder.css';

const StoryBuilder = ({ onStoryCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'adventure',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/api/stories', formData);
      setError(null);
      setFormData({ title: '', description: '', genre: 'adventure', tags: [] });
      onStoryCreated?.(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="story-builder">
      <h2>Create New Story</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Story Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Story Description"
          value={formData.description}
          onChange={handleChange}
        />
        <select name="genre" value={formData.genre} onChange={handleChange}>
          <option value="adventure">Adventure</option>
          <option value="fantasy">Fantasy</option>
          <option value="sci-fi">Sci-Fi</option>
          <option value="mystery">Mystery</option>
          <option value="romance">Romance</option>
          <option value="horror">Horror</option>
          <option value="comedy">Comedy</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Story'}
        </button>
      </form>
    </div>
  );
};

export default StoryBuilder;
