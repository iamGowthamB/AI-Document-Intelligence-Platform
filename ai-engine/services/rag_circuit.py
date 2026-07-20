from PIL import Image
from core.llm import ask_qwen_local

def analyze_circuit(image_path: str, question: str) -> str:
    """
    Loads the circuit image, routes it to the local Qwen2.5-VL model
    with the question, and returns the generated explanation.
    """
    try:
        img = Image.open(image_path).convert("RGB")
    except Exception as e:
        raise ValueError(f"Failed to open circuit image file: {e}")

    try:
        # Ask local Qwen model
        response = ask_qwen_local(question, img)
        return response
    except Exception as e:
        print(f"Error running local Qwen model: {e}")
        raise RuntimeError(
            f"Circuit analysis execution failed: {e}. "
            "Please ensure system has sufficient resources and GPU/CUDA is configured if needed."
        )
