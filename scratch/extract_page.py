import json

LOG_PATH = "/Users/youssefmahir/.gemini/antigravity-ide/brain/936800b0-a891-45d6-9b64-a85562f926a8/.system_generated/logs/transcript.jsonl"

target_line = 1943

with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line_str in enumerate(f):
        if idx + 1 == target_line:
            try:
                data = json.loads(line_str)
                print(f"Loaded line {idx + 1}")
                print(f"Keys: {list(data.keys())}")
                print(f"Type: {data.get('type')}")
                content = data.get("content", "")
                print(f"Content length: {len(content)}")
                # Let's check first 200 chars
                print("First 200 chars:")
                print(content[:200])
                # Write to file
                with open("/Users/youssefmahir/Developer/ecom/scratch/recovered_page.tsx", "w", encoding="utf-8") as out:
                    out.write(content)
                print("Wrote to /Users/youssefmahir/Developer/ecom/scratch/recovered_page.tsx")
            except Exception as e:
                print(f"Error: {e}")
            break
