import useAutoUpdateLocation from "../../hooks/useAutoUpdateLocation";
import { useState } from "react";
import "../../static/mybooks/BookModal.css"
export default function BookModal({
  book,
  onClose,
  onUpdateBook, 
  onDeleteBook, 
  isOwner = false,
}) {
  useAutoUpdateLocation();

  const [editing, setEditing] = useState(false);
  
  const [title, setTitle] = useState(book.title || "");
  const [author, setAuthor] = useState(book.author || "");
  const [description, setDescription] = useState(book.description || "");
  const [genre, setGenre] = useState(book.genre || "Fiction");
  const [condition, setCondition] = useState(book.condition || "Good");
  const [availability, setAvailability] = useState(
    book.availability || "Available"
  );
  const [coverBase64, setCoverBase64] = useState(book.coverBase64 || "");
  const [preview, setPreview] = useState(book.coverBase64 || "");
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      alert("Please enter both title and author.");
      return;
    }
    setIsSubmitting(true);
    const updatedData = {
      title,
      author,
      description,
      genre,
      condition,
      availability,
      coverBase64,
    };
    try {
      await onUpdateBook(book.id, updatedData);
      setIsSubmitting(false);
      setEditing(false);
    } catch (err) {
      console.error("Error updating book:", err);
      setIsSubmitting(false);
      alert("Failed to update book.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this book? This cannot be undone.")) return;
    try {
      await onDeleteBook(book.id);
      
    } catch (err) {
      console.error("Error deleting book:", err);
      alert("Failed to delete book.");
    }
  };
  
  if (!editing) {
    return (
      <div className="form-modal-overlay" onClick={onClose}>
        <div
          className="book-modal-container"
          onClick={(e) => e.stopPropagation()}
        >

          <div className="modal-content">
            <div style={{ textAlign: "center" }}>
              <img
                src={book.coverBase64 || "/static/images/default-book.jpg"}
                alt={book.title}
                style={{
                  width: 160,
                  height: 220,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
            </div>

            <h2 style={{ textAlign: "center", marginTop: 12 }}>{book.title}</h2>
            <p
              style={{
                textAlign: "center",
                fontStyle: "italic",
                color: "#666",
              }}
            >
              {book.author}
            </p>

            <div style={{ marginTop: 12 }}>
              <p>
                <strong>Condition:</strong> {book.condition}
              </p>
              <p>
                <strong>Availability:</strong> {book.availability}
              </p>
              <p>
                <strong>Genre:</strong> {book.genre}
              </p>
              <p>
                <strong>Description:</strong>
              </p>
              <p style={{ whiteSpace: "pre-wrap", color: "#444" }}>
                {book.description || "No description provided."}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              {isOwner && (
                <>
                  <button
                    className="submit-button"
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </button>
                  <button
                    className="submit-button"
                    style={{ background: "#e74c3c", color: "#fff" }}
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </>
              )}
              <button
                className="submit-button"
                style={{ background: "#ccc", color: "#000" }}
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="form-modal-overlay" onClick={onClose}>
      <div
        className="form-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <form className="book-upload-form" onSubmit={handleSave}>

          <h2 className="form-title">Edit Book Details</h2>

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
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

          <div
            className="form-actions"
            style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
          >
            <button
              type="button"
              className="submit-button"
              onClick={() => setEditing(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
