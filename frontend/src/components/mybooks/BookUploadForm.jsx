import { useState } from "react";
import "../../static/mybooks/BookUploadForm.css";

export default function BookUploadForm({ onClose, onAddBook }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Fiction");
  const [condition, setCondition] = useState("Good");
  const [availability, setAvailability] = useState("Available"); // 🆕
  const [coverBase64, setCoverBase64] = useState("");
  const [preview, setPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverBase64(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      alert("Please enter both title and author.");
      return;
    }

    setIsSubmitting(true);
    const bookData = {
      title,
      author,
      description,
      genre,
      condition,
      availability, // 🆕 include availability in payload
      coverBase64,
    };

    try {
      await onAddBook(bookData);
      setIsSubmitting(false);
    } catch (err) {
      console.error("Error adding book:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-modal-overlay" onClick={onClose}>
      <form className="book-upload-form" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="close-modal-button"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="form-title">List a New Book</h2>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Author *</label>
            <input
              type="text"
              className="form-input"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-textarea"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a brief description of the book..."
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Genre</label>
              <select
                className="form-select"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              >
                <option>Fiction</option>
                <option>Non-Fiction</option>
                <option>Fantasy</option>
                <option>Romance</option>
                <option>Thriller</option>
                <option>Science</option>
              </select>
            </div>

            <div className="form-group half">
              <label>Condition</label>
              <select
                className="form-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
              </select>
            </div>
          </div>

          {/* 🆕 Availability */}
          <div className="form-group">
            <label>Availability</label>
            <select
              className="form-select"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option>Available</option>
              <option>Lent Out</option>
              <option>Not Available</option>
            </select>
          </div>

          <div className="form-group">
            <label>Cover Image</label>
            <div className="image-upload-container">
              {preview ? (
                <img src={preview} alt="Preview" className="image-preview" />
              ) : (
                <div className="image-upload-placeholder">
                  Click to upload an image
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="image-upload-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Book"}
            </button>
          </div>
        </form>
    </div>
  );
}
