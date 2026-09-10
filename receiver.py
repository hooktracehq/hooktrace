from http.server import BaseHTTPRequestHandler, HTTPServer


class WebhookReceiver(BaseHTTPRequestHandler):

    def do_POST(self):
        content_length = int(
            self.headers.get("Content-Length", 0)
        )

        body = self.rfile.read(content_length)

        print("\n========== WEBHOOK RECEIVED ==========")
        print("Method:", self.command)
        print("Path:", self.path)
        print("Headers:")

        for key, value in self.headers.items():
            print(f"  {key}: {value}")

        print("Body:", body.decode("utf-8", errors="replace"))
        print("======================================\n")

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()

        self.wfile.write(
            b'{"received":true}'
        )

    def log_message(self, format, *args):
        return


server = HTTPServer(
    ("0.0.0.0", 8000),
    WebhookReceiver,
)

print("Webhook receiver listening on http://localhost:8000")

server.serve_forever()