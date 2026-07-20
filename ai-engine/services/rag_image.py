import pytesseract
from PIL import Image
from core.llm import ask_gemini_vision

def analyze_image(image_path: str, question: str) -> str:
    """
    Performs OCR on the image to extract any embedded text,
    combines it with the user's question, and queries Google Gemini.
    Fails over gracefully to visual-only Gemini analysis if Tesseract is not installed.
    """
    try:
        img = Image.open(image_path)
    except Exception as e:
        raise ValueError(f"Failed to open image file: {e}")

    ocr_text = ""
    import shutil
    if shutil.which("tesseract"):
        try:
            ocr_text = pytesseract.image_to_string(img)
        except Exception as e:
            print(f"Warning: OCR extraction failed ({e}). Proceeding with visual analysis only.")
    else:
        print("Tesseract binary not found in PATH. Skipping OCR stage.")

    full_question = question
    if ocr_text.strip():
        full_question = (
            f"Question: {question}\n\n"
            f"Extracted text from image (via OCR):\n"
            f"-----------------------------------\n"
            f"{ocr_text.strip()}\n"
            f"-----------------------------------"
        )

    # Invoke Gemini Vision model with the image and question context
    return ask_gemini_vision(full_question, [img])
