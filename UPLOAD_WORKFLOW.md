# 📁 Immigration CRM - File Upload & AI Processing Workflow

## 🔄 Complete Upload Process

### 1. **File Upload** (`POST /api/upload`)

- **Input**: Multiple files via form-data
- **Files Supported**: PDF, DOCX, images, text files
- **Processing**: Multer handles file uploads to temporary storage

### 2. **AI Document Processing** 🤖

- **Text Extraction**:
  - PDF files → `pdf-parse` library
  - DOCX files → `mammoth` library
  - Images → Vision API (if text extraction fails)
- **AI Analysis**: OpenAI GPT-4o-mini extracts important fields:
  - Name, Date of Birth, UCI, Application Number
  - Passport Number, Program, College, Country
  - Email, Phone, and other relevant information
- **Output**: Structured JSON profile data

### 3. **Google Drive Integration** 📁

- **Folder Creation**: Creates student-specific folder in Google Drive
- **File Upload**: Uploads all files to the student's folder
- **Cleanup**: Removes temporary local files
- **Access**: Provides web view links for file access

### 4. **Database Storage** 💾

- **Student Record**: Creates/updates student in MongoDB
- **Profile Data**: Stores AI-extracted information
- **Drive Info**: Links to Google Drive folder
- **Metadata**: Tracks upload timestamps and file information

## 🚀 How to Test the Complete Workflow

### Prerequisites

1. **Backend running** on `http://localhost:4000`
2. **Valid API keys** in `.env` file:
   - `OPENAI_API_KEY`
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `DRIVE_PARENT_FOLDER_ID`
3. **MongoDB running**
4. **Google Drive API enabled**

### Test Commands

#### 1. **Quick Test** (using test script)

```bash
cd "/Users/trupeshmandani/Desktop/Immigration CRM"
node test-upload.js
```

#### 2. **Manual Test** (using curl)

```bash
# Create a test file
echo "Name: John Doe
Date of Birth: 1990-05-15
UCI: 1234567890
Program: Computer Science" > test-doc.txt

# Upload file
curl -X POST http://localhost:4000/api/upload \
  -F "files=@test-doc.txt" \
  -F "aiKey=test-student-123"
```

#### 3. **Frontend Test** (using browser)

1. Go to `http://localhost:5173`
2. Login as admin
3. Navigate to student management
4. Upload documents through the UI

## 📊 Expected Results

### Successful Upload Response

```json
{
  "message": "Successfully processed 2 files with AI and uploaded to Google Drive",
  "aiKey": "student-1234567890",
  "driveFolder": "https://drive.google.com/drive/folders/...",
  "uploaded": [
    {
      "id": "file-id",
      "name": "document.pdf",
      "webViewLink": "https://drive.google.com/file/..."
    }
  ],
  "student": {
    "_id": "student-id",
    "aiKey": "student-1234567890",
    "profile": {
      "Name": "John Doe",
      "DateOfBirth": "1990-05-15",
      "UCI": "1234567890",
      "Program": "Computer Science"
    },
    "drive": {
      "folderId": "folder-id",
      "webViewLink": "https://drive.google.com/drive/folders/..."
    }
  },
  "extractedFields": 4,
  "profile": {
    "Name": "John Doe",
    "DateOfBirth": "1990-05-15",
    "UCI": "1234567890",
    "Program": "Computer Science"
  }
}
```

## 🔧 Troubleshooting

### Common Issues

1. **"Missing credentials" error**

   - Check your `.env` file has correct API keys
   - Verify OpenAI API key is valid and has credits

2. **"Google Drive API error"**

   - Check Google Cloud credentials
   - Verify Drive API is enabled
   - Ensure parent folder ID is correct

3. **"AI extraction failed"**

   - Check OpenAI API key and model
   - Verify file format is supported
   - Check file content is readable

4. **"MongoDB connection error"**
   - Ensure MongoDB is running
   - Check connection string in `.env`

### Debug Steps

1. **Check backend logs** for detailed error messages
2. **Test API health** with `curl http://localhost:4000/api/`
3. **Verify environment variables** are loaded correctly
4. **Test individual components** (AI, Drive, Database)

## 📈 Performance Notes

- **AI Processing**: 2-5 seconds per document
- **Drive Upload**: 1-3 seconds per file
- **Database Operations**: < 1 second
- **Total Time**: 5-15 seconds for typical upload

## 🎯 Next Steps

1. **Test the workflow** with real immigration documents
2. **Verify AI extraction** accuracy
3. **Check Drive folder** organization
4. **Test student profile** display in frontend
5. **Monitor performance** with larger files

---

**✅ Your Immigration CRM now has a complete AI-powered document processing workflow!**
