from typing import List, Union
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document as LangChainDocument

def split_text_into_chunks(
    text: Union[str, List[str]], 
    chunk_size: int = 500, 
    chunk_overlap: int = 50
) -> List[LangChainDocument]:
    """
    Splits text content into a list of LangChain Document chunks.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    
    if isinstance(text, str):
        return splitter.create_documents([text])
    elif isinstance(text, list):
        return splitter.create_documents(text)
    else:
        raise TypeError("Input must be a string or a list of strings")
