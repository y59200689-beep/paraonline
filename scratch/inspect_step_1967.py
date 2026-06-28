import json

LOG_PATH = "/Users/youssefmahir/.gemini/antigravity-ide/brain/936800b0-a891-45d6-9b64-a85562f926a8/.system_generated/logs/transcript.jsonl"

with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line_str in enumerate(f):
        try:
            data = json.loads(line_str)
            if data.get("step_index") == 1967:
                print(f"Log line: {idx+1}")
                print(f"Keys: {list(data.keys())}")
                content = data.get("content", "")
                print(f"Content length: {len(content)}")
                print("Content preview:")
                print(content[:500])
                print("...")
                print(content[-500:])
        except Exception as e:
            pass
