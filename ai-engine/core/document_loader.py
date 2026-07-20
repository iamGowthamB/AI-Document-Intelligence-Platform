import os
import pandas as pd
from docx import Document
from pypdf import PdfReader

def extract_text_from_file(file_path: str) -> str:
    """
    Loads a document and extracts all text content based on the file extension.
    Supported extensions: .pdf, .docx, .csv, .xlsx, .xls, .txt
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    ext = os.path.splitext(file_path)[1].lower()
    text_content = ""

    if ext == ".pdf":
        reader = PdfReader(file_path)
        pages = []
        for page in reader.pages:
            txt = page.extract_text()
            if txt:
                pages.append(txt)
        text_content = "\n".join(pages)

    elif ext == ".docx":
        doc = Document(file_path)
        text_content = "\n".join([para.text for para in doc.paragraphs])

    elif ext == ".csv":
        df = pd.read_csv(file_path)
        text_content = df.to_string(index=False)

    elif ext in [".xlsx", ".xls"]:
        excel = pd.ExcelFile(file_path)
        sheet_text = []
        for sheet in excel.sheet_names:
            df = pd.read_excel(file_path, sheet_name=sheet)
            sheet_text.append(f"\nSheet: {sheet}\n{df.to_string(index=False)}")
        text_content = "\n".join(sheet_text)

    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            text_content = f.read()

    else:
        raise ValueError(f"Unsupported file type: {ext}")

    return text_content.strip()
