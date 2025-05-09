# MCQ Generation and Test Checking System

This project combines an MCQ generation app with an OpenCV-based OMR sheet processing system.

## OpenCV OMR Integration

The MCQ-for-schools app integrates with the OpenCV OMR sheet processing system through a webhook API. This enables automatic scanning and grading of student answer sheets.

### Setup Instructions

1. **Configure Environment Variables**:
   Create a `.env` file in the `mcq-for-schools` directory with the following variables:
   ```
   # Supabase Configuration
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   
   # OpenCV OMR API Configuration
   VITE_OPENCV_API_URL=http://localhost:8000
   ```

2. **Start the OpenCV Server**:
   ```
   cd opencv
   python app.py
   ```
   The server will run on port 8000 by default.

3. **Start the MCQ-for-schools app**:
   ```
   cd mcq-for-schools
   npm install
   npm run dev
   ```

### How the Integration Works

1. In the Test Checking page, teachers upload OMR sheet images.
2. The app sends these images to Supabase storage and gets public URLs.
3. The webhook endpoint in the OpenCV app receives these URLs and processes the OMR sheets.
4. The app retrieves the results and displays them to the teacher.

### Technical Details

- The OpenCV app exposes a webhook endpoint at `/api/webhook` that accepts POST requests.
- The webhook accepts event types:
  - `process_omr`: Process a single OMR sheet
  - `batch_process`: Process multiple OMR sheets
  - `extract_student_info`: Extract only student information

- Example webhook payload:
  ```json
  {
    "event_type": "process_omr",
    "data": {
      "image_url": "https://example.com/image.jpg",
      "answer_key": "ABCDBACDA"
    },
    "timestamp": "2023-06-15T10:30:00Z",
    "source": "mcq-for-schools"
  }
  ```

- The OpenCV app processes the image and returns the results with:
  - Marked answers
  - Score if answer key was provided
  - Student information (if detected)
  - Result image showing graded answers

For more details, refer to the documentation in the OpenCV app. #   m c q g e n - o p e n c v  
 