from core.document_loader import extract_text_from_file
from core.chunking import split_text_into_chunks
from core.vector_store import add_documents_to_store, get_retriever, get_vector_store
from core.prompt_templates import get_rag_qa_prompt
from core.llm import ask_groq

def ingest_document(file_path: str, filename: str, metadata: dict = None):
    """
    Reads a document, splits it into chunks, embeds them,
    and indexes them in the shared Chroma vector store with metadata.
    """
    print(f"Ingesting document: {filename} from {file_path}")
    
    # 1. Extract text content
    text = extract_text_from_file(file_path)
    if not text:
        print(f"No text extracted from {filename}.")
        return
        
    # 2. Chunk text
    chunks = split_text_into_chunks(text)
    
    # 3. Inject metadata (source file name + any optional metadata)
    for chunk in chunks:
        chunk.metadata["source"] = filename
        if metadata:
            for key, val in metadata.items():
                chunk.metadata[key] = val
        
    # 4. Store in Chroma
    add_documents_to_store(chunks)
    print(f"Finished ingesting {filename}")

def query_documents(question: str, filter_dict: dict = None) -> str:
    """
    Retrieves context for a question from the vector database,
    and runs Q&A via Groq.
    """
    # 1. Get retriever and invoke query
    retriever = get_retriever(filter=filter_dict)
    relevant_docs = retriever.invoke(question)
    
    # 2. Extract and concatenate context
    context = "\n\n".join([doc.page_content for doc in relevant_docs])
    if not context.strip():
        return "No relevant context found in the uploaded documents."
        
    # 3. Format RAG prompt
    prompt = get_rag_qa_prompt(context, question)
    
    # 4. Generate answer
    return ask_groq(prompt)

def semantic_search(query: str, filter_dict: dict = None):
    """
    Directly queries similarity matching documents in Chroma.
    """
    db = get_vector_store()
    results = db.similarity_search(query, k=5, filter=filter_dict)
    serialized = []
    for doc in results:
        serialized.append({
            "page_content": doc.page_content,
            "metadata": doc.metadata
        })
    return serialized
