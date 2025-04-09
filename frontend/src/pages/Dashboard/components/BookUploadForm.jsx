import { useState, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../../../firebase/firebase';

export default function BookUploadForm() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverBase64, setCoverBase64] = useState('');
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image (under 1MB)
    if (file.size > 1_000_000) {
      alert('Please select an image smaller than 1MB');
      fileInputRef.current.value = ''; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverBase64(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Submit to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      await setDoc(doc(db, 'books', Date.now().toString()), {
        title,
        author,
        coverBase64,
        owner: auth.currentUser.uid,
        ownerUsername: auth.currentUser.displayName,
        createdAt: new Date()
      });
      alert('Book listed successfully!');
      // Reset form
      setTitle('');
      setAuthor('');
      setCoverBase64('');
      setPreview('');
      fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Failed to list book');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-form">
      <h2>List Your Book</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Book Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Book Cover (Max 1MB)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            required
          />
          {preview && (
            <div className="preview">
              <img src={preview} alt="Cover preview" />
            </div>
          )}
        </div>

        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'List Book'}
        </button>
      </form>
    </div>
  );
}