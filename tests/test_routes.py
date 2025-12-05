import pytest
from unittest.mock import MagicMock

#  TESTS FOR BOOKS.PY (Firestore CRUD)

def test_add_book_success(client, mock_db):
    """Test adding a book with valid data."""
    payload = {
        "title": "Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "genre": "Classic",
        "condition": "New",
        "description": "A story of wealth.",
        "coverBase64": "image_string",
        "ownerId": "user123"
    }

    # Execute request
    response = client.post('/add-book', json=payload)

    # Assertions
    assert response.status_code == 200
    assert response.json['success'] is True
    # Verify Firestore add was called
    mock_db.collection.assert_called_with('books')
    mock_db.collection().add.assert_called()

def test_add_book_missing_fields(client):
    """Test adding a book with missing required fields."""
    payload = {
        "title": "Missing Author Book"
        # Missing other fields
    }
    
    response = client.post('/add-book', json=payload)
    
    assert response.status_code == 400
    assert "Missing fields" in response.json['message']

def test_get_books_by_owner(client, mock_db):
    """Test fetching books for a specific owner."""
    # Setup Mock Data
    mock_doc = MagicMock()
    mock_doc.to_dict.return_value = {"title": "Test Book", "ownerId": "user123"}
    mock_doc.id = "doc_id_1"
    
    # Chain: db.collection().where().stream()
    mock_db.collection().where().stream.return_value = [mock_doc]

    response = client.get('/get-books?ownerId=user123')

    assert response.status_code == 200
    assert len(response.json['books']) == 1
    assert response.json['books'][0]['id'] == "doc_id_1"

def test_update_book_success(client, mock_db):
    """Test updating a book that exists."""
    # Setup Mock: Document exists
    mock_ref = MagicMock()
    mock_ref.get().exists = True
    mock_db.collection().document.return_value = mock_ref

    payload = {"title": "Updated Title"}
    response = client.put('/update-book/book123', json=payload)

    assert response.status_code == 200
    mock_ref.update.assert_called_with({"title": "Updated Title"})

def test_delete_book_not_found(client, mock_db):
    """Test deleting a book that does not exist."""
    # Setup Mock: Document does NOT exist
    mock_ref = MagicMock()
    mock_ref.get().exists = False
    mock_db.collection().document.return_value = mock_ref

    response = client.delete('/delete-book/book123')

    assert response.status_code == 404
    assert "Not found" in response.json['message']

def test_delete_book_success(client, mock_db):
    """Test successfully deleting a book."""
    # Setup Mock: Document exists
    mock_ref = MagicMock()
    mock_ref.get().exists = True
    mock_db.collection().document.return_value = mock_ref

    response = client.delete('/delete-book/book123')

    assert response.status_code == 200
    assert response.json['success'] is True
    mock_ref.delete.assert_called_once()

def test_update_book_not_found(client, mock_db):
    """Test updating a book that doesn't exist (should return 404)."""
    mock_ref = MagicMock()
    mock_ref.get().exists = False  # Document missing
    mock_db.collection().document.return_value = mock_ref

    response = client.put('/update-book/fake_id', json={"title": "New"})
    
    assert response.status_code == 404

def test_get_books_missing_param(client):
    """Test fetching books without the required ownerId param."""
    response = client.get('/get-books') # No query params
    
    assert response.status_code == 400
    assert "Missing ownerId" in response.json['message']

def test_add_book_db_failure(client, mock_db):
    """Test how the app handles a database crash (500 Error)."""
    # Simulate a crash
    mock_db.collection.side_effect = Exception("Firebase Down")
    
    payload = {
        "title": "Crash Test", "author": "Dummy", "genre": "Test",
        "condition": "New", "description": "Desc", 
        "coverBase64": "img", "ownerId": "u1"
    }

    response = client.post('/add-book', json=payload)
    
    assert response.status_code == 500
    assert "Firebase Down" in response.json['message']
#  TESTS FOR EMAIL.PY (Logic & SendGrid)

def test_send_request_email_success(client, mock_send_email):
    """Test that the correct email logic fires."""
    mock_send_email.return_value = True # Simulate success from SendGrid

    payload = {
        "lenderEmail": "lender@test.com",
        "lenderName": "Lender",
        "borrowerName": "Borrower",
        "borrowerEmail": "borrower@test.com",
        "bookTitle": "Python 101"
    }

    response = client.post('/api/send-request', json=payload)

    assert response.status_code == 200
    assert response.json['success'] is True
    
    # Verify email contents
    call_args = mock_send_email.call_args[1]
    assert call_args['to_email'] == "lender@test.com"
    assert "Python 101" in call_args['subject']

def test_respond_request_accept(client, mock_send_email):
    """Test the acceptance link logic."""
    params = {
        "action": "accept",
        "borrowerEmail": "borrower@test.com",
        "bookTitle": "Python 101",
        "lenderName": "Lender"
    }

    response = client.get('/api/respond-request', query_string=params)

    assert response.status_code == 200
    assert b"Response Recorded" in response.data
    
    # Check if correct email sent to Borrower
    call_args = mock_send_email.call_args[1]
    assert call_args['to_email'] == "borrower@test.com"
    assert "ACCEPTED" in call_args['html_body']

def test_send_request_missing_fields(client):
    """Test sending an email request with missing data."""
    payload = {"lenderEmail": "test@test.com"} # Missing other fields
    
    response = client.post('/api/send-request', json=payload)
    
    assert response.status_code == 400
    assert "Missing required fields" in response.json['message']

def test_respond_request_decline(client, mock_send_email):
    """Test the 'Decline' variation of the response."""
    params = {
        "action": "decline",
        "borrowerEmail": "borrower@test.com",
        "bookTitle": "Python 101",
        "lenderName": "Lender"
    }

    response = client.get('/api/respond-request', query_string=params)

    assert response.status_code == 200
    
    # Verify we sent the DECLINED email
    call_args = mock_send_email.call_args[1]
    assert "DECLINED" in call_args['html_body']
    assert "❌" in call_args['html_body']