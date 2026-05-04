import React, { useState } from 'react';
import axios from 'axios';
import './Videos.css';

const VideoUpload = ({ onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true,
    tags: []
  });
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideo(file);
    } else {
      alert('Please select a valid video file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!video) {
      alert('Please select a video');
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('video', video);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('isPublic', formData.isPublic);
    data.append('tags', JSON.stringify(formData.tags));

    try {
      const response = await axios.post('/api/videos', data, {
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        }
      });

      alert('Video uploaded successfully!');
      onUploadSuccess?.(response.data.data);
      setFormData({ title: '', description: '', isPublic: true, tags: [] });
      setVideo(null);
    } catch (error) {
      alert('Error uploading video');
    }
    setUploading(false);
  };

  return (
    <div className="video-upload">
      <h2>Upload Video</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            disabled={uploading}
          />
          {video && <p className="file-name">Selected: {video.name}</p>}
        </div>

        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
            />
            Make Public
          </label>
        </div>

        {uploading && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}>
              {progress}%
            </div>
          </div>
        )}

        <button type="submit" disabled={uploading || !video}>
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};

export default VideoUpload;
