def get_rag_qa_prompt(context: str, question: str) -> str:
    """
    Returns the formatted text Q&A prompt.
    """
    return f"""Based ONLY on the following context, answer the question below.
If the answer cannot be found in the context, please state that clearly.

Context:
{context}

Question: {question}
Answer:"""

def get_summarization_prompt(text: str) -> str:
    """
    Returns the prompt for document summarization.
    """
    return f"""You are an expert document summarizer.
Please write a clear, comprehensive, and structured summary of the following text.
Make sure to emphasize the main arguments, key facts, and final conclusions.
Use clean formatting, headers, and bullet points.

Text Content:
{text}

Summary:"""
