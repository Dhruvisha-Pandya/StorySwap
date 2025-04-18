// // src/pages/Dashboard/components/BookUploadForm.jsx
// import { useState } from 'react';
// import '../../../static/home/BookUploadForm.css';

// export default function BookUploadForm({ onClose, onAddBook }) {
//   const [formData, setFormData] = useState({
//     title: '',
//     author: '',
//     condition: 'Good',
//     genre: 'Fiction',
//     price: '',
//     cover: null,
//     previewImage: ''
//   });

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData({
//         ...formData,
//         cover: file,
//         previewImage: URL.createObjectURL(file)
//       });
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!formData.cover) {
//       alert('Please upload a book cover');
//       return;
//     }
//     onAddBook(formData);
//   };

//   return (
//     <div className="form-modal-overlay">
//       <div className="book-upload-form">
//         <button className="close-modal-button" onClick={onClose}>×</button>
//         <h2>Add New Book</h2>
        
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Book Cover</label>
//             <div className="image-upload-container">
//               {formData.previewImage ? (
//                 <img src={formData.previewImage} alt="Preview" className="image-preview" />
//               ) : (
//                 <div className="image-upload-placeholder">
//                   <span>Click to upload cover</span>
//                 </div>
//               )}
//               <input
//                 type="file"
//                 onChange={handleImageUpload}
//                 accept="image/*"
//                 className="image-upload-input"
//                 required
//               />
//             </div>
//           </div>

//           <div className="form-group">
//             <input
//               type="text"
//               placeholder="Book Title"
//               value={formData.title}
//               onChange={(e) => setFormData({...formData, title: e.target.value})}
//               required
//               className="form-input"
//             />
//           </div>

//           <div className="form-group">
//             <input
//               type="text"
//               placeholder="Author"
//               value={formData.author}
//               onChange={(e) => setFormData({...formData, author: e.target.value})}
//               required
//               className="form-input"
//             />
//           </div>

//           <div className="form-row">
//             <select
//               value={formData.condition}
//               onChange={(e) => setFormData({...formData, condition: e.target.value})}
//               className="form-select"
//             >
//               <option value="New">New</option>
//               <option value="Like New">Like New</option>
//               <option value="Good">Good</option>
//               <option value="Fair">Fair</option>
//               <option value="Poor">Poor</option>
//             </select>

//             <select
//               value={formData.genre}
//               onChange={(e) => setFormData({...formData, genre: e.target.value})}
//               className="form-select"
//             >
//               <option value="Fiction">Fiction</option>
//               <option value="Non-Fiction">Non-Fiction</option>
//               <option value="Fantasy">Fantasy</option>
//               <option value="Sci-Fi">Sci-Fi</option>
//               <option value="Mystery">Mystery</option>
//             </select>
//           </div>

//           <div className="form-group">
//             <input
//               type="number"
//               placeholder="Rental Price (₹/month)"
//               value={formData.price}
//               onChange={(e) => setFormData({...formData, price: e.target.value})}
//               className="form-input"
//               min="0"
//             />
//           </div>

//           <div className="form-actions">
//             <button type="submit" className="submit-button">List Book</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }





import { useState } from 'react';
import '../../../static/home/BookUploadForm.css';

export default function BookUploadForm({ onClose, onAddBook }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    condition: 'Good',
    genre: 'Fiction',
    price: '',
    coverBase64: '',
    previewImage: ''
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          coverBase64: reader.result,
          previewImage: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.coverBase64) {
      alert('Please upload a book cover');
      return;
    }
    onAddBook(formData);
  };

  return (
    <div className="form-modal-overlay">
      <div className="book-upload-form">
        <button className="close-modal-button" onClick={onClose}>×</button>
        <h2>Add New Book</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Book Cover</label>
            <div className="image-upload-container">
              {formData.previewImage ? (
                <img src={formData.previewImage} alt="Preview" className="image-preview" />
              ) : (
                <div className="image-upload-placeholder">
                  <span>Click to upload cover</span>
                </div>
              )}
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="image-upload-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Book Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
              className="form-input"
            />
          </div>

          <div className="form-row">
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="form-select"
            >
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>

            <select
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="form-select"
            >
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Mystery">Mystery</option>
            </select>
          </div>

          <div className="form-group">
            <input
              type="number"
              placeholder="Rental Price (₹/month)"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="form-input"
              min="0"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">List Book</button>
          </div>
        </form>
      </div>
    </div>
  );
}
