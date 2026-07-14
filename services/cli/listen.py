# import websocket
# import requests
# import json
# import sys
# import time
# import threading
# import os

# # ---------------- CONFIG ----------------

# PORT = sys.argv[1]
# TOKEN = sys.argv[2]

# WS_URL = f"ws://localhost:8000/ws/{TOKEN}"
# LOCAL_URL = f"http://localhost:{PORT}"

# # ---------------- STATE ----------------

# paused = False
# provider_filter = None
# event_filter = None

# # ---------------- COLORS ----------------

# RESET = "\033[0m"
# GREEN = "\033[92m"
# RED = "\033[91m"
# YELLOW = "\033[93m"
# CYAN = "\033[96m"
# BOLD = "\033[1m"

# # ---------------- HELP ----------------

# def print_help():
#     print(f"""
# {BOLD}Commands:{RESET}
#   pause               → stop forwarding
#   resume              → resume forwarding
#   filter <provider>   → filter by provider
#   event <keyword>     → filter by event name
#   clear               → clear screen
#   help                → show commands
#   exit                → quit
# """)


# # =========================
# # HEARTBEATS
# # =========================

# def heartbeat_loop():
#     while True:
#         try:
#             ws.send(json.dumps({
#                 "type": "heartbeat",
#                 "token": TOKEN,
#             }))

#         except Exception:
#             break

#         time.sleep(15)


# threading.Thread(
#     target=heartbeat_loop,
#     daemon=True,
# ).start()


# # =========================
# # MAIN LOOP
# # =========================

# while True:
#     raw = ws.recv()

#     data = json.loads(raw)

#     if data.get("type") != "request":
#         continue

#     request_id = data["request_id"]

#     method = data["method"]
#     path = data["path"]
#     query = data.get("query")
#     }))














# # ---------------- INPUT THREAD ----------------

# def input_listener():
#     global paused, provider_filter, event_filter

#     while True:
#         cmd = input().strip()

#         if cmd == "pause":
#             paused = True
#             print(f"{YELLOW}Paused{RESET}")

#         elif cmd == "resume":
#             paused = False
#             print(f"{GREEN}Resumed{RESET}")

#         elif cmd.startswith("filter "):
#             provider_filter = cmd.split(" ", 1)[1]
#             print(f"{CYAN}Filtering provider: {provider_filter}{RESET}")

#         elif cmd.startswith("event "):
#             event_filter = cmd.split(" ", 1)[1]
#             print(f"{CYAN}Filtering event: {event_filter}{RESET}")

#         elif cmd == "clear":
#             os.system("cls" if os.name == "nt" else "clear")

#         elif cmd == "help":
#             print_help()

#         elif cmd == "exit":
#             print("Bye 👋")
#             os._exit(0)

#         else:
#             print("Unknown command. Type 'help'")

# # ---------------- START ----------------

# ws = websocket.WebSocket()
# ws.connect(WS_URL)

# print(f"{CYAN}{BOLD}Hooktrace CLI (interactive){RESET}")
# print(f"→ Forwarding to {LOCAL_URL}")
# print("Type 'help' for commands\n")

# # Start input thread
# threading.Thread(target=input_listener, daemon=True).start()

# # ---------------- MAIN LOOP ----------------

# while True:
#     message = ws.recv()
#     event = json.loads(message)

#     payload = event.get("payload", {})
#     headers = event.get("headers", {})
#     provider = event.get("provider", "unknown")
#     event_name = payload.get("event", "webhook.event")

#     # ---------------- FILTERS ----------------

#     if provider_filter and provider_filter not in provider:
#         continue

#     if event_filter and event_filter not in event_name:
#         continue

#     print(f"{CYAN}→ Event:{RESET} {BOLD}{event_name}{RESET} ({provider})")

#     if paused:
#         print(f"{YELLOW}⏸ Skipped (paused){RESET}\n")
#         continue

#     start = time.time()

#     try:
#         res = requests.post(
#             f"{LOCAL_URL}/webhook/{TOKEN}",
#             json=payload,
#             headers=headers,
#         )

#         duration = int((time.time() - start) * 1000)

#         if 200 <= res.status_code < 300:
#             print(f"{GREEN}✓ Delivered{RESET} [{res.status_code}] {duration}ms\n")
#         else:
#             print(f"{YELLOW}⚠ Failed{RESET} [{res.status_code}] {duration}ms")
#             print(f"{YELLOW}{res.text[:200]}{RESET}\n")

#     except Exception as e:
#         duration = int((time.time() - start) * 1000)
#         print(f"{RED}✗ Error{RESET} {duration}ms")
#         print(f"{RED}{str(e)}{RESET}\n")









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

API_URL = os.getenv(
    "HOOKTRACE_API_URL",
    "ws://localhost:3001",
)

WS_URL = f"{API_URL}/ws/tunnel/{TOKEN}"
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


# ---------------- START ----------------

ws = websocket.WebSocket()
ws.connect(WS_URL)

print(f"{CYAN}{BOLD}Hooktrace CLI (interactive){RESET}")
print(f"→ Forwarding to {LOCAL_URL}")
print("Type 'help' for commands\n")


# =========================
# HEARTBEATS
# =========================

def heartbeat_loop():

    while True:

        try:

            ws.send(json.dumps({
                "type": "heartbeat",
                "token": TOKEN,
            }))

        except Exception:
            break

        time.sleep(15)


threading.Thread(
    target=heartbeat_loop,
    daemon=True,
).start()


# ---------------- INPUT THREAD ----------------

def input_listener():

    global paused
    global provider_filter
    global event_filter

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

            print(
                f"{CYAN}Filtering provider: "
                f"{provider_filter}{RESET}"
            )

        elif cmd.startswith("event "):

            event_filter = cmd.split(" ", 1)[1]

            print(
                f"{CYAN}Filtering event: "
                f"{event_filter}{RESET}"
            )

        elif cmd == "clear":

            os.system(
                "cls"
                if os.name == "nt"
                else "clear"
            )

        elif cmd == "help":

            print_help()

        elif cmd == "exit":

            print("Bye 👋")

            os._exit(0)

        else:

            print(
                "Unknown command. "
                "Type 'help'"
            )


threading.Thread(
    target=input_listener,
    daemon=True,
).start()


# =========================
# MAIN LOOP
# =========================

while True:

    raw = ws.recv()

    data = json.loads(raw)

    # ------------------------
    # TUNNEL REQUESTS
    # ------------------------

    if data.get("type") == "request":

        request_id = data["request_id"]

        method = data["method"]

        path = data["path"]

        query = data.get("query")

        headers = data.get("headers") or {}

        body = data.get("body")

        url = f"{LOCAL_URL}{path}"

        if query:
            url += f"?{query}"

        print(
            f"{CYAN}→ HTTP:{RESET} "
            f"{BOLD}{method}{RESET} "
            f"{url}"
        )

        if paused:

            print(
                f"{YELLOW}"
                f"⏸ Skipped (paused)"
                f"{RESET}\n"
            )

            continue

        start = time.time()

        try:

            response = requests.request(
                method,
                url,
                data=body,
                headers=headers,
                timeout=20,
            )

            duration = int(
                (time.time() - start) * 1000
            )

            ws.send(json.dumps({
                "type": "response",
                "request_id": request_id,
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "body": response.text,
            }))

            print(
                f"{GREEN}✓ Forwarded{RESET} "
                f"[{response.status_code}] "
                f"{duration}ms\n"
            )

        except Exception as e:

            duration = int(
                (time.time() - start) * 1000
            )

            ws.send(json.dumps({
                "type": "response",
                "request_id": request_id,
                "status_code": 500,
                "headers": {},
                "body": str(e),
            }))

            print(
                f"{RED}✗ Error{RESET} "
                f"{duration}ms"
            )

            print(
                f"{RED}{str(e)}{RESET}\n"
            )

        continue

    # ------------------------
    # LEGACY WEBHOOK EVENTS
    # ------------------------

    event = data

    payload = event.get("payload", {})

    headers = event.get("headers", {})

    provider = event.get(
        "provider",
        "unknown",
    )

    event_name = payload.get(
        "event",
        "webhook.event",
    )

    # ---------------- FILTERS ----------------

    if (
        provider_filter
        and provider_filter not in provider
    ):
        continue

    if (
        event_filter
        and event_filter not in event_name
    ):
        continue

    print(
        f"{CYAN}→ Event:{RESET} "
        f"{BOLD}{event_name}{RESET} "
        f"({provider})"
    )

    if paused:

        print(
            f"{YELLOW}"
            f"⏸ Skipped (paused)"
            f"{RESET}\n"
        )

        continue

    start = time.time()

    try:

        res = requests.post(
            f"{LOCAL_URL}/webhook/{TOKEN}",
            json=payload,
            headers=headers,
        )

        duration = int(
            (time.time() - start) * 1000
        )

        if 200 <= res.status_code < 300:

            print(
                f"{GREEN}✓ Delivered{RESET} "
                f"[{res.status_code}] "
                f"{duration}ms\n"
            )

        else:

            print(
                f"{YELLOW}⚠ Failed{RESET} "
                f"[{res.status_code}] "
                f"{duration}ms"
            )

            print(
                f"{YELLOW}"
                f"{res.text[:200]}"
                f"{RESET}\n"
            )

    except Exception as e:

        duration = int(
            (time.time() - start) * 1000
        )

        print(
            f"{RED}✗ Error{RESET} "
            f"{duration}ms"
        )

        print(
            f"{RED}{str(e)}{RESET}\n"
        )