import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './miniapps.css';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('miniAppNotes');
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('miniAppNotes', JSON.stringify(notes));
  }, [notes]);

  const createNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'New Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setCurrentNote(newNote.id);
    setTitle(newNote.title);
    setContent(newNote.content);
  };

  const updateNote = (title, content) => {
    setTitle(title);
    setContent(content);

    if (currentNote) {
      setNotes(notes.map(note =>
        note.id === currentNote
          ? { ...note, title, content, updatedAt: new Date().toISOString() }
          : note
      ));
    }
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
    if (currentNote === id) {
      setCurrentNote(null);
      setTitle('');
      setContent('');
    }
  };

  const selectNote = (note) => {
    setCurrentNote(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today.setDate(today.getDate() - 1));

    if (date.toDateString() === new Date().toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      className="notes-app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="notes-container">
        {/* Sidebar */}
        <motion.div
          className="notes-sidebar"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <motion.button
            className="new-note-btn"
            onClick={createNewNote}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + New Note
          </motion.button>

          <div className="notes-search">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="notes-list">
            {filteredNotes.length === 0 ? (
              <div className="empty-notes">No notes yet</div>
            ) : (
              <AnimatePresence>
                {filteredNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    className={`note-item ${currentNote === note.id ? 'active' : ''}`}
                    onClick={() => selectNote(note)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="note-preview">
                      <h4>{note.title || 'Untitled'}</h4>
                      <p>{note.content.substring(0, 50)}...</p>
                    </div>
                    <span className="note-date">{formatDate(note.updatedAt)}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>

        {/* Editor */}
        <motion.div
          className="notes-editor"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {currentNote ? (
            <>
              <div className="editor-header">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => updateNote(e.target.value, content)}
                  className="editor-title"
                  placeholder="Note title..."
                />
                <button
                  className="delete-btn"
                  onClick={() => deleteNote(currentNote)}
                  title="Delete note"
                >
                  🗑
                </button>
              </div>

              <textarea
                value={content}
                onChange={(e) => updateNote(title, e.target.value)}
                className="editor-content"
                placeholder="Start typing..."
              />

              <div className="editor-footer">
                <span className="edit-time">
                  Edited {formatDate(notes.find(n => n.id === currentNote)?.updatedAt)}
                </span>
                <span className="char-count">{content.length} characters</span>
              </div>
            </>
          ) : (
            <div className="editor-empty">
              <span className="empty-icon">📝</span>
              <p>Create a new note to get started</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Notes;
