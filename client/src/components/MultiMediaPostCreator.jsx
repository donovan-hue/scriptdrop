import React, { useState } from 'react';
import axios from 'axios';
import { FaImage, FaVideo, FaMusic } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function MultiMediaPostCreator({ onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [music, setMusic] = useState(null);
  const [visibility, setVisibility] = useState('public');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    image: 0,
    video: 0,
    music: 0
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'image') setImage(file);
      else if (type === 'video') setVideo(file);
      else if (type === 'music') setMusic(file);
    }
  };

  const uploadFile = async (file, type) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append(type, file);

    try {
      const response = await axios.post(
        `${API_URL}/multimedia/upload/${type}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress((prev) => ({ ...prev, [type]: progress }));
          }
        }
      );

      return response.data[`${type}Url`];
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image && !video && !music) {
      alert('Please add content or media');
      return;
    }

    setIsLoading(true);

    try {
      // Upload files
      const [imageUrl, videoUrl, musicUrl] = await Promise.all([
        uploadFile(image, 'image'),
        uploadFile(video, 'video'),
        uploadFile(music, 'music')
      ]);

      // Create post
      await axios.post(`${API_URL}/posts`, {
        content,
        image: imageUrl,
        video: videoUrl,
        music: musicUrl,
        visibility
      });

      // Reset form
      setContent('');
      setImage(null);
      setVideo(null);
      setMusic(null);
      setVisibility('public');
      setUploadProgress({ image: 0, video: 0, music: 0 });

      if (onPostCreated) onPostCreated();
      alert('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={user?.avatar || 'https://via.placeholder.com/48'}
          alt={user?.username}
          className="w-12 h-12 rounded-full"
        />
        <p className="text-gray-600">{user?.username}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          rows="4"
        />

        {/* Media Preview */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {image && (
            <div className="relative">
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="w-full h-24 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <span className="text-white text-xs">{uploadProgress.image}%</span>
              </div>
            </div>
          )}

          {video && (
            <div className="relative bg-black rounded-lg h-24 flex items-center justify-center">
              <FaVideo className="text-white text-2xl" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <span className="text-white text-xs">{uploadProgress.video}%</span>
              </div>
            </div>
          )}

          {music && (
            <div className="relative bg-blue-100 rounded-lg h-24 flex items-center justify-center">
              <FaMusic className="text-blue-600 text-2xl" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <span className="text-white text-xs">{uploadProgress.music}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <div className="flex space-x-3">
            <label className="cursor-pointer text-blue-500 hover:text-blue-700 flex items-center space-x-2">
              <FaImage /> <span>Foto</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'image')}
              />
            </label>

            <label className="cursor-pointer text-red-500 hover:text-red-700 flex items-center space-x-2">
              <FaVideo /> <span>Video</span>
              <input
                type="file"
                className="hidden"
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'video')}
              />
            </label>

            <label className="cursor-pointer text-green-500 hover:text-green-700 flex items-center space-x-2">
              <FaMusic /> <span>Música</span>
              <input
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={(e) => handleFileChange(e, 'music')}
              />
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="public">🌍 Public</option>
              <option value="followers">👥 Followers</option>
              <option value="private">🔒 Private</option>
            </select>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {isLoading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default MultiMediaPostCreator;
