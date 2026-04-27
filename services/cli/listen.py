import websocket
import requests
import json
import sys
import time
import threading
import os

# ---------------- CONFIG ----------------

PORT = sys.argv[1]
TOKEN = sys.argv[2]

WS_URL = f"ws://localhost:8000/ws/{TOKEN}"
LOCAL_URL = f"http://localhost:{PORT}"

# ---------------- STATE ----------------

paused = False
provider_filter = None
event_filter = None

# ---------------- COLORS ----------------

RESET = "\033[0m"
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"

# ---------------- HELP ----------------

def print_help():
    print(f"""
{BOLD}Commands:{RESET}
  pause               → stop forwarding
  resume              → resume forwarding
  filter <provider>   → filter by provider
  event <keyword>     → filter by event name
  clear               → clear screen
  help                → show commands
  exit                → quit
""")

# ---------------- INPUT THREAD ----------------

def input_listener():
    global paused, provider_filter, event_filter

    while True:
        cmd = input().strip()

        if cmd == "pause":
            paused = True
            print(f"{YELLOW}Paused{RESET}")

        elif cmd == "resume":
            paused = False
            print(f"{GREEN}Resumed{RESET}")

        elif cmd.startswith("filter "):
            provider_filter = cmd.split(" ", 1)[1]
            print(f"{CYAN}Filtering provider: {provider_filter}{RESET}")

        elif cmd.startswith("event "):
            event_filter = cmd.split(" ", 1)[1]
            print(f"{CYAN}Filtering event: {event_filter}{RESET}")

        elif cmd == "clear":
            os.system("cls" if os.name == "nt" else "clear")

        elif cmd == "help":
            print_help()

        elif cmd == "exit":
            print("Bye 👋")
            os._exit(0)

        else:
            print("Unknown command. Type 'help'")

# ---------------- START ----------------

ws = websocket.WebSocket()
ws.connect(WS_URL)

print(f"{CYAN}{BOLD}Hooktrace CLI (interactive){RESET}")
print(f"→ Forwarding to {LOCAL_URL}")
print("Type 'help' for commands\n")

# Start input thread
threading.Thread(target=input_listener, daemon=True).start()

# ---------------- MAIN LOOP ----------------

while True:
    message = ws.recv()
    event = json.loads(message)

    payload = event.get("payload", {})
    headers = event.get("headers", {})
    provider = event.get("provider", "unknown")
    event_name = payload.get("event", "webhook.event")

    # ---------------- FILTERS ----------------

    if provider_filter and provider_filter not in provider:
        continue

    if event_filter and event_filter not in event_name:
        continue

    print(f"{CYAN}→ Event:{RESET} {BOLD}{event_name}{RESET} ({provider})")

    if paused:
        print(f"{YELLOW}⏸ Skipped (paused){RESET}\n")
        continue

    start = time.time()

    try:
        res = requests.post(
            f"{LOCAL_URL}/webhook/{provider}",
            json=payload,
            headers=headers,
        )

        duration = int((time.time() - start) * 1000)

        if 200 <= res.status_code < 300:
            print(f"{GREEN}✓ Delivered{RESET} [{res.status_code}] {duration}ms\n")
        else:
            print(f"{YELLOW}⚠ Failed{RESET} [{res.status_code}] {duration}ms")
            print(f"{YELLOW}{res.text[:200]}{RESET}\n")

    except Exception as e:
        duration = int((time.time() - start) * 1000)
        print(f"{RED}✗ Error{RESET} {duration}ms")
        print(f"{RED}{str(e)}{RESET}\n")