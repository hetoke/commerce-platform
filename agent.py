# ------------------------------------------------------------
# agent.py  – automatic, read‑only command execution with safety lock
# ------------------------------------------------------------
import subprocess
import re
from pathlib import Path
import ctypes
import platform
import shutil   # to verify that `ollama` is on PATH
import sys
import os

def enable_ansi():
    kernel32 = ctypes.windll.kernel32
    handle = kernel32.GetStdHandle(-11)            # STD_OUTPUT_HANDLE
    mode = ctypes.c_uint()
    kernel32.GetConsoleMode(handle, ctypes.byref(mode))
    kernel32.SetConsoleMode(handle, mode.value | 0x0004)

enable_ansi()

# ------------------------------------------------------------
# Helper – verify command stays within BASE_DIR
# ------------------------------------------------------------
def is_command_safe(command: str) -> bool:
    """
    Reject any command that references a path outside BASE_DIR.
    Extracts all quoted and unquoted path-like tokens and checks them.
    """
    # Pull out anything that looks like a path (has a slash, backslash, or colon)
    tokens = re.findall(r'["\']?([A-Za-z]:\\[^\s"\']+|\.{0,2}[/\\][^\s"\']*)["\']?', command)
    
    for token in tokens:
        try:
            resolved = Path(token).resolve()
            if not str(resolved).startswith(str(BASE_DIR.resolve())):
                return False
        except Exception:
            return False  # if we can't resolve it, reject it

    return True

# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------
MODEL = "gpt-oss:120b-cloud"          # <-- change if you use a different model
BASE_DIR = Path.cwd()                 # working directory (default is the folder where the script lives)

# ------------------------------------------------------------
# Helper – LLM interface (CLI version)
# ------------------------------------------------------------
def build_prompt(messages):
    """Create the plain‑text prompt for the LLM."""
    parts = []
    for m in messages:
        parts.append(f"{m['role'].upper()}:\n{m['content']}")
    return "\n\n".join(parts)

def clean_model_text(text: str) -> str:
    text = text.replace("\r\n", "\n")
    # Remove everything from the first "Thinking..." line up to and including "...done thinking." line
    cleaned = re.sub(
        r"(?i)^[^\n]*thinking[^\n]*\n.*?\n[^\n]*done thinking[^\n]*\n?",
        "",
        text,
        flags=re.DOTALL,
    )
    return cleaned.strip()

def call_llm(messages: list) -> str:
    """
    Run the model via the `ollama` CLI.

    The CLI is invoked as:
        ollama run <MODEL> --no-stream

    The built prompt is fed to the process' stdin and the final
    response (stdout) is returned.
    """
    # Make sure the CLI is available
    if shutil.which("ollama") is None:
        raise RuntimeError("❗️ `ollama` executable not found in PATH. Install Ollama first.")

    prompt = build_prompt(messages)

    # Use the non‑streaming mode so we get one clean response string.
    cmd = ["ollama", "run", MODEL]

    try:
        proc = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        stdout, stderr = proc.communicate(input=prompt, timeout=300)  # 5‑min safety net
    except subprocess.TimeoutExpired:
        proc.kill()
        raise RuntimeError("❗️ Ollama CLI timed out while generating a response.")
    except Exception as exc:
        raise RuntimeError(f"❗️ Unexpected error when calling Ollama CLI: {exc}")

    if proc.returncode != 0:
        raise RuntimeError(
            f"❗️ Ollama CLI returned error code {proc.returncode}\n"
            f"stderr:\n{stderr.strip()}"
        )

    # The CLI prints the raw response; we just strip it and return.
    return stdout.strip()

# ------------------------------------------------------------
# Helper – execute a shell command (read‑only)
# ------------------------------------------------------------
def run_shell(command: str) -> str:
    """
    Execute a *read‑only* command and return its combined stdout+stderr.
    On Windows we enable `shell=True` so built‑ins like `dir` work.
    """
    use_shell = platform.system() == "Windows"
    result = subprocess.run(
        command,
        cwd=BASE_DIR,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        shell=use_shell,
        timeout=30,               # safety: no command hangs forever
    )
    return result.stdout + result.stderr



# ------------------------------------------------------------
# NEW: parse the COMMAND_REQUEST line from the LLM reply
# ------------------------------------------------------------
from typing import Optional

def extract_command_request(text: str) -> Optional[str]:
    """
    Extract everything after 'COMMAND_REQUEST:' (multi‑line allowed).
    Strips optional markdown fences.
    """
    match = re.search(
        r"COMMAND_REQUEST:\s*(.*)",
        text,
        re.IGNORECASE | re.DOTALL,
    )
    if not match:
        return None

    cmd = match.group(1).strip()
    cmd = re.sub(r"^```.*?\n", "", cmd, flags=re.DOTALL)   # remove leading ```…
    cmd = re.sub(r"\n```$", "", cmd, flags=re.DOTALL)      # remove trailing ```
    return cmd

# ------------------------------------------------------------
# Main loop (v1.2 Protocol with safety lock)
# ------------------------------------------------------------
def main():
    COMMAND_SYSTEM_PROMPT = {
        "role": "system",
        "content": """You are a command planner. Your ONLY job is to determine if a command needs to be run.

If the user's request requires inspecting the local system, output exactly:
COMMAND_REQUEST: <valid Windows CMD or PowerShell command>

If no command is needed (observations already contain enough info, or it's a general question), output exactly:
DONE

No other output. No explanations."""
    }

    ANSWER_SYSTEM_PROMPT = {
        "role": "system",
        "content": """You are a helpful Windows coding assistant.
The user asked a question. You have been given observations from running commands on their machine.
Answer the user's question clearly and concisely based on the observations provided."""
    }

    print("🧠 Local Coding Agent v1.3 (type 'exit' to quit)\n")

    while True:
        user_text = input("You> ")
        if user_text.lower() in ("exit", "quit"):
            break

        # Build a fresh context for this turn
        context = [COMMAND_SYSTEM_PROMPT, {"role": "user", "content": user_text}]
        observations = []

        # --- Phase 1: collect all needed command observations ---
        while True:
            reply = clean_model_text(call_llm(context))

            cmd = extract_command_request(reply)
            if not cmd:
                # Either DONE or empty — stop requesting commands
                break

            # Safety lock
            confirm = input(f"\n⚠️  Execute command `{cmd}`? (y/n): ").strip().lower()
            if confirm not in ("y", "yes"):
                print("❌  Command aborted by user.")
                observation = f"Command `{cmd}` was skipped by the user."
            elif not is_command_safe(cmd):
                print(f"🚫  Command rejected: references a path outside {BASE_DIR}")
                observation = f"Command `{cmd}` was rejected because it references a path outside the working directory."
            else:
                cmd_output = run_shell(cmd)
                print("\n--- Command output start ---")
                print(cmd_output.rstrip())
                print("--- Command output end ---\n")
                observation = f"Result of `{cmd}`:\n{cmd_output}"

            observations.append(observation)
            context.append({
                "role": "system",
                "content": f"OBSERVATION:\n{observation}"
            })

        # --- Phase 2: generate the human-readable answer ---
        answer_context = [ANSWER_SYSTEM_PROMPT, {"role": "user", "content": user_text}]
        if observations:
            answer_context.append({
                "role": "system",
                "content": "OBSERVATIONS:\n" + "\n\n".join(observations)
            })

        final_answer = clean_model_text(call_llm(answer_context))
        print("\n🤖 " + final_answer + "\n")


if __name__ == "__main__":
    if shutil.which("ollama") is None:
        sys.exit("❗️ `ollama` executable not found. Install Ollama and ensure it is on your PATH.")
    main()
