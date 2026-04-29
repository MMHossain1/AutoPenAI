from .ollama_config import (
    BASE_MODEL,
    CONTEXT_LENGTH,
    MODEL_NAME,
    OLLAMA_BASE_URL,
    TEMPERATURE,
)
import re
import requests
import json
from requests.exceptions import RequestException
from .prompts import COMPUTE_METRICS_PROMPT

"""
Call a local LLM model via Ollama API and return the generated response.
Args:
    text (str): The prompt text to send to the LLM model.
    system (str | None, optional): Sets the behavior/context of the model.
        Defaults to None.
Returns:
    str: The generated response text from the LLM model.
Raises:
    requests.exceptions.HTTPError: Request returns an HTTP error status.
    requests.exceptions.Timeout: If the request times out after 120 seconds
    requests.exceptions.RequestException: For other request-related errors.
    KeyError: If the response JSON doesn't contain a "response" field.
Example:
    >>> response = call_llm("What is Python?")
    >>> print(response)
    >>> response = call_llm("Translate to French", system="You are a translator")
    >>> print(response)
"""


def call_llm(text: str, system: str | None = None) -> str:

    payload = {
        "model": MODEL_NAME,
        "prompt": text,
        "stream": False,
        "think": False,
        "options": {"num_ctx": CONTEXT_LENGTH},
    }

    if system:
        payload["system"] = system

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate", json=payload, timeout=(10, 600)
        )
        response.raise_for_status()
    except requests.HTTPError as exc:
        raise RuntimeError(
            f"Ollama HTTP error {exc.response.status_code}: {exc.response.text[:200]}"
        ) from exc
    except RequestException as exc:
        raise RuntimeError(
            f"LLM service unavailable at {OLLAMA_BASE_URL}. Start Ollama with 'ollama serve'."
        ) from exc

    return response.json()["response"]


def compute_risk_level(scan_results: str) -> dict:
    prompt = COMPUTE_METRICS_PROMPT.replace("{{SCAN_RESULTS}}", scan_results)
    response = call_llm(prompt)

    # Extract JSON from <answer> tags
    match = re.search(r"<answer>\s*```(?:json)?\s*(.*?)\s*```\s*</answer>", response, re.DOTALL)
    if not match:
        match = re.search(r"<answer>\s*(.*?)\s*</answer>", response, re.DOTALL)
    if not match:
        # Fall back: find first JSON object in response
        match = re.search(r"\{[^{}]*\"risk_score\"[^{}]*\}", response, re.DOTALL)
        raw_json = match.group(0) if match else "{}"
    else:
        raw_json = match.group(1)

    data = json.loads(raw_json)
    return {
        "total_risk_score": int(data.get("risk_score", 0)),
        "overall_risk_level": str(data.get("risk_label", "Low")),
    }


def stream_llm(text: str, system: str | None = None):
    payload = {
        "model": MODEL_NAME,
        "prompt": text,
        "stream": True,
        "think": False,
        "options": {"num_ctx": CONTEXT_LENGTH},
    }

    if system:
        payload["system"] = system

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate", json=payload, stream=True, timeout=(10, 600)
        )
        response.raise_for_status()
    except RequestException as exc:
        raise RuntimeError(
            f"LLM service unavailable at {OLLAMA_BASE_URL}. Start Ollama with 'ollama serve'."
        ) from exc

    for line in response.iter_lines():
        if line:
            try:
                chunk = json.loads(line)
            except json.JSONDecodeError:
                continue
            if chunk.get("response"):
                yield chunk["response"]
            if chunk.get("done", False):
                break


def stream_chat_llm(messages: list[dict], system: str | None = None):
    ollama_messages = []
    if system:
        ollama_messages.append({"role": "system", "content": system})
    ollama_messages.extend(messages)

    payload = {
        "model": MODEL_NAME,
        "messages": ollama_messages,
        "stream": True,
        "options": {"num_ctx": CONTEXT_LENGTH},
    }

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/chat", json=payload, stream=True, timeout=(10, 600)
        )
        response.raise_for_status()
    except RequestException as exc:
        raise RuntimeError(
            f"LLM service unavailable at {OLLAMA_BASE_URL}. Start Ollama with 'ollama serve'."
        ) from exc

    for line in response.iter_lines():
        if line:
            try:
                chunk = json.loads(line)
            except json.JSONDecodeError:
                continue
            content = chunk.get("message", {}).get("content", "")
            if content:
                yield content
            if chunk.get("done", False):
                break


"""
Ensure that the required model is available locally in Ollama.

Fetches the list of available models from the Ollama API. If the configured
MODEL_NAME is not found in the available models, automatically pulls it from
the Ollama repository with streaming disabled.

The function will:
1. Query the Ollama API for the list of available models
2. Check if MODEL_NAME exists in the retrieved models
3. If not found, initiate a create request to build the model
    with configs from a base model
4. Raise an HTTPError if the pull request fails

Raises:
    requests.exceptions.HTTPError: If the model pull request fails.
    requests.exceptions.Timeout: If API requests exceed the timeout limits.
    requests.exceptions.RequestException: If network requests fail.
"""


def ensure_model_available() -> bool:
    try:
        models_request = requests.get(
            f"{OLLAMA_BASE_URL}/api/tags",
            timeout=10,
        )
        models_request.raise_for_status()
        models = {model["name"] for model in models_request.json().get("models", [])}

        if MODEL_NAME not in models:
            print(f"Creating {MODEL_NAME} from {BASE_MODEL}")

            pull_model_req = requests.post(
                f"{OLLAMA_BASE_URL}/api/create",
                timeout=600,
                json={
                    "model": MODEL_NAME,
                    "from": BASE_MODEL,
                    "parameters": {
                        "num_ctx": CONTEXT_LENGTH,
                        "temperature": TEMPERATURE,
                    },
                    "stream": False,
                },
            )
            pull_model_req.raise_for_status()
            print(f"{MODEL_NAME} ready!")

        return True
    except RequestException as exc:
        print(
            f"Warning: Ollama is unreachable at {OLLAMA_BASE_URL}. "
            "Continuing without LLM features until Ollama is started."
        )
        print(f"Details: {exc}")
        return False
