import socket
import uvicorn

def get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

if __name__ == "__main__":
    lan_ip = get_lan_ip()
    print("=" * 62)
    print("  Adda FastAPI Backend Running on 0.0.0.0:8000")
    print("  'Adda' - Smart Conversation, Anywhere.")
    print(f"  Local Access:           http://localhost:8000")
    print(f"  Cross-Device Access:    http://{lan_ip}:8000")
    print(f"  Interactive API Docs:   http://localhost:8000/docs")
    print("=" * 62)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
