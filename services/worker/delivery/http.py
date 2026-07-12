import time
import httpx
from httpx import URL


async def deliver_http(config, payload):
    url = config.get("url", "")

   

    # Remove invisible unicode characters
    url = (
        str(url)
        .replace("\u200b", "")
        .replace("\u200c", "")
        .replace("\u200d", "")
        .replace("\u2060", "")
        .replace("\ufeff", "")
        .strip()
    )

    

    if not url:
        raise ValueError("Missing HTTP target URL")

    # Validate URL
    try:
        parsed = URL(url)
        
    except Exception as e:
       
        raise

    method = (config.get("method") or "POST").upper()

    headers = config.get("headers") or {}
    headers["Content-Type"] = "application/json"

    timeout = int(config.get("timeout") or 10)

    start = time.time()

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.request(
                method=method,
                url=url,
                json=payload,
                headers=headers,
            )

        duration = int((time.time() - start) * 1000)

        print("STATUS:", resp.status_code)

        return {
            "status_code": resp.status_code,
            "body": resp.text[:2000],
            "duration_ms": duration,
        }

    except Exception as e:
        
        raise