import React, { useState, useEffect } from 'react';

function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('title'); // 'title' or 'author'
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');

  // Fetch books from backend on load
  useEffect(() => {
    fetch('http://localhost:5000/books')
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error('Error fetching books:', err));
  }, []);

  // Add new book
  const handleAddBook = (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return alert('Please fill in both fields');

    fetch('http://localhost:5000/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author, read: false }),
    })
      .then(res => res.json())
      .then(newBook => {
        setBooks([...books, newBook]);
        setTitle('');
        setAuthor('');
      })
      .catch(err => console.error('Error adding book:', err));
  };

  // Delete book
  const handleDeleteBook = (id) => {
    fetch(`http://localhost:5000/books/${id}`, { method: 'DELETE' })
      .then(() => setBooks(books.filter(book => book.id !== id)))
      .catch(err => console.error('Error deleting book:', err));
  };

  // Start editing a book
  const startEditing = (book) => {
    setEditingId(book.id);
    setEditTitle(book.title);
    setEditAuthor(book.author);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditAuthor('');
  };

  // Save edited book
  const saveEdit = (id) => {
    if (!editTitle.trim() || !editAuthor.trim()) {
      alert('Please fill in both fields');
      return;
    }

    fetch(`http://localhost:5000/books/${id}`, {
      method: 'PUT', // You'll need to add this in backend too!
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle, author: editAuthor }),
    })
      .then(res => res.json())
      .then(updatedBook => {
        setBooks(books.map(book => (book.id === id ? updatedBook : book)));
        cancelEditing();
      })
      .catch(err => console.error('Error updating book:', err));
  };

  // Toggle Read status
  const toggleRead = (book) => {
    fetch(`http://localhost:5000/books/${book.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...book, read: !book.read }),
    })
      .then(res => res.json())
      .then(updatedBook => {
        setBooks(books.map(b => (b.id === book.id ? updatedBook : b)));
      })
      .catch(err => console.error('Error toggling read status:', err));
  };

  // Filter books by search term
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort books by selected field
  filteredBooks.sort((a, b) => {
    const aField = a[sortField].toLowerCase();
    const bField = b[sortField].toLowerCase();
    return aField < bField ? -1 : aField > bField ? 1 : 0;
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to right, #dbeafe, #f0fdf4)',
      padding: '3rem 1rem',
      fontFamily: `'Segoe UI', sans-serif`
    }}>
      <div style={{
        maxWidth: '750px',
        margin: '0 auto',
        background: 'white',
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          textAlign: 'center',
          fontSize: '2rem',
          color: '#2563eb',
          marginBottom: '2rem',
          fontWeight: '600'
        }}>
          📚 My Book Library
        </h1>

        {/* Add new book form */}
        <form onSubmit={handleAddBook} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <input
            type="text"
            placeholder="Book Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '1rem'
            }}
          />
          <input
            type="text"
            placeholder="Author"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '1rem'
            }}
          />
          <button type="submit" style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
            onMouseOver={e => e.target.style.backgroundColor = '#1e40af'}
            onMouseOut={e => e.target.style.backgroundColor = '#2563eb'}
          >
            ➕ Add Book
          </button>
        </form>

        {/* Search and sort controls */}
        <div style={{
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              flexGrow: 1,
              padding: '0.6rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '1rem',
              minWidth: '200px'
            }}
          />

          <select
            value={sortField}
            onChange={e => setSortField(e.target.value)}
            style={{
              padding: '0.6rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '1rem',
              minWidth: '140px'
            }}
          >
            <option value="title">Sort by Title</option>
            <option value="author">Sort by Author</option>
          </select>
        </div>

        {/* Book list */}
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
          {filteredBooks.length === 0 ? (
            <li style={{ textAlign: 'center', fontStyle: 'italic', color: '#888' }}>
              📭 No books found.
            </li>
          ) : (
            filteredBooks.map(book => (
              <li key={book.id} style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
              }}>
                <div style={{flex: 1}}>
                  {editingId === book.id ? (
                    <>
                      <input
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        style={{
                          padding: '0.5rem',
                          marginBottom: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #ccc',
                          width: '100%',
                          fontSize: '1rem'
                        }}
                      />
                      <input
                        value={editAuthor}
                        onChange={e => setEditAuthor(e.target.value)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #ccc',
                          width: '100%',
                          fontSize: '1rem'
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <strong style={{ fontSize: '1.1rem', color: book.read ? '#4ade80' : '#111' }}>
                        {book.title}
                      </strong>
                      <br />
                      <small style={{ color: '#555' }}>by {book.author}</small>
                      <br />
                      <small style={{ color: '#777', fontStyle: 'italic' }}>
                        {book.read ? '✅ Read' : '📖 Not read'}
                      </small>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                  {/* Toggle read */}
                  <button
                    onClick={() => toggleRead(book)}
                    title={book.read ? 'Mark as unread' : 'Mark as read'}
                    style={{
                      backgroundColor: book.read ? '#4ade80' : '#facc15',
                      border: 'none',
                      padding: '0.5rem 0.8rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseOver={e => e.target.style.filter = 'brightness(0.9)'}
                    onMouseOut={e => e.target.style.filter = 'brightness(1)'}
                  >
                    {book.read ? 'Read' : 'Unread'}
                  </button>

                  {/* Edit / Save / Cancel */}
                  {editingId === book.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(book.id)}
                        style={{
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 0.8rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          transition: 'background-color 0.3s'
                        }}
                        onMouseOver={e => e.target.style.backgroundColor = '#1e40af'}
                        onMouseOut={e => e.target.style.backgroundColor = '#2563eb'}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        style={{
                          backgroundColor: '#6b7280',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 0.8rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          transition: 'background-color 0.3s'
                        }}
                        onMouseOver={e => e.target.style.backgroundColor = '#4b5563'}
                        onMouseOut={e => e.target.style.backgroundColor = '#6b7280'}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEditing(book)}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        transition: 'background-color 0.3s'
                      }}
                      onMouseOver={e => e.target.style.backgroundColor = '#1e40af'}
                      onMouseOut={e => e.target.style.backgroundColor = '#3b82f6'}
                    >
                      Edit
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 0.8rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseOver={e => e.target.style.backgroundColor = '#b91c1c'}
                    onMouseOut={e => e.target.style.backgroundColor = '#ef4444'}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
