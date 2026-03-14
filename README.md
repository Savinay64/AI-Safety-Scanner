# 🛡️ AI Safety Scanner

A lightweight, client-side web application designed to detect unsafe content in both **Images** and **Text**. This project leverages the **Microsoft Azure Computer Vision API** to perform real-time analysis for adult content, violence, and hate speech, wrapped in a modern, responsive interface.

Built with pure HTML, CSS, and JavaScript, this tool demonstrates practical integration of cloud AI services without requiring a complex backend setup.

## 🚀 Key Features

### 1. Dual-Mode Analysis
- **🖼️ Image Scan:** Analyzes an image URL for visual safety (Adult/Racy/Violence) AND performs OCR (Optical Character Recognition) to extract and scan embedded text for inappropriate language.
- **⌨️ Text Scan:** A dedicated mode to directly input and analyze text strings against a customizable filter list for instant feedback.

### 2. Advanced AI Integration
- Utilizes **Azure Computer Vision v3.2** for industry-leading image categorization.
- Implements the **Read API** for high-accuracy text extraction from complex images (posters, memes, documents).

### 3. Modern UI/UX
- Features a custom **Glassmorphism design** with 3D animations and smooth transitions.
- Fully responsive layout that adapts seamlessly to desktop and mobile devices.
- Real-time loading states and detailed result reporting with confidence scores.

### 4. Security First
- **Zero Hardcoded Secrets:** The application does not store any API keys in the source code.
- Users provide their own Azure credentials via a secure session-based input form, ensuring the repository remains safe for public sharing.

---

## 📸 Project Preview

*(Below are screenshots of the application interface)*

### 🖼️ Image Scanning Interface

### ⌨️ Text Scanning Interface
![Text Scan Demo](https://via.placeholder.com/800x450/0f0c29/00f2ff?text=Insert+Screenshot+of+Text+Scan+Here)
*> Screenshot showing the Text Scan tab detecting unwanted words.*

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **AI Service** | Microsoft Azure Computer Vision API (v3.2) |
| **Design** | Custom CSS (Glassmorphism, Flexbox, Grid) |
| **Version Control** | Git & GitHub |

---

## 💻 How to Run Locally

Getting started is simple. No Node.js or server installation required.

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Savinay64/AI-Safety-Scanner.git
    cd AI-Safety-Scanner
    ```

2.  **Open in Browser:**
    Simply double-click `index.html` or open it via a local server (e.g., VS Code Live Server).

3.  **Configure Credentials:**
    - Upon first load, you will be prompted to enter your **Azure Endpoint** and **API Key**.
    - These can be obtained from your [Azure Portal](https://portal.azure.com/) under the "Computer Vision" resource.
    - *Note: Credentials are stored only in your browser's memory for the current session.*

---

## 📖 Usage Guide

### Scenario A: Scanning an Image
1. Navigate to the **"Image Scan"** tab.
2. Paste a direct link to an image (e.g., `https://example.com/image.jpg`).
3. Click **"Full Scan"**.
4. The system will return a report on visual safety and any text detected within the image.

### Scenario B: Scanning Text
1. Navigate to the **"Text Scan"** tab.
2. Type or paste the text you wish to analyze.
3. Click **"Analyze Text"**.
4. The system will instantly highlight any flagged keywords based on the internal safety list.

---

## 🔐 Security & Privacy

This project follows security best practices for client-side applications:
- **No Backend Storage:** API keys are never sent to any server other than Microsoft Azure.
- **Session Only:** Keys are cleared immediately upon page refresh or closure.
- **Public Safe:** Since no secrets are committed to the repository, this codebase is safe to fork and share publicly.

---

## 🤝 Contributing

Feel free to fork this repository and submit pull requests if you have improvements or new feature ideas!

## 📄 License

This project is open-source and available under the MIT License.

---
*Developed by **Savinay64** as part of an exploration into Cloud AI and Responsible AI practices.*
