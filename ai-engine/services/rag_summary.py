from core.document_loader import extract_text_from_file
from core.prompt_templates import get_summarization_prompt
from core.llm import ask_groq, ask_gemini_vision

def summarize_document(file_path: str) -> str:
    """
    Extracts text from a document and generates a summary using the Groq LLM.
    Falls back to Gemini if Groq fails or is not configured.
    """
    text = extract_text_from_file(file_path)
    if not text.strip():
        return "The document does not contain any text to summarize."
        
    # Standard context window truncation if text is too large for prompt
    # Llama 3.3 supports 128k tokens, but we truncate to 30,000 characters (~7500 words)
    # for speed and rate limiting safety.
    max_chars = 30000
    if len(text) > max_chars:
        text = text[:max_chars] + "\n\n...[Content truncated for summarization]..."
        
    prompt = get_summarization_prompt(text)
    
    try:
        summary = ask_groq(prompt)
    except Exception as e:
        print(f"Groq summarization failed: {e}. Trying Gemini fallback...")
        try:
            summary = ask_gemini_vision(prompt, [])
        except Exception as gemini_err:
            raise RuntimeError(f"Summarization failed for both Groq and Gemini. Groq error: {e}, Gemini error: {gemini_err}")
            
    return summary
