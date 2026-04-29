import os
from dotenv import load_dotenv

load_dotenv()

MODEL_MAP = {
    "fast": {
        "base_model": "qwen3.5:0.8b",
        "num_ctx": 8192,
        "temperature": 0.1,
    },  # 1gb
    "small": {
        "base_model": "qwen3.5:2b",
        "num_ctx": 16384,
        "temperature": 0.1,
    },  # 2.7gb
    "medium": {
        "base_model": "qwen3.5:9b",
        "num_ctx": 32768,
        "temperature": 0.1,
    },  # 6.6gb
    "large": {
        "base_model": "qwen3.5:27b",
        "num_ctx": 65536,
        "temperature": 0.1,
    },  # 17gb
}

LLM_PROFILE = os.getenv("LLM_PROFILE", "fast")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

llm_profile = MODEL_MAP[LLM_PROFILE]

MODEL_NAME = LLM_PROFILE
BASE_MODEL = llm_profile["base_model"]
CONTEXT_LENGTH = llm_profile["num_ctx"]
TEMPERATURE = llm_profile["temperature"]
