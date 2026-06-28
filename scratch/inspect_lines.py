import json

LOG_PATH = "/Users/youssefmahir/.gemini/antigravity-ide/brain/936800b0-a891-45d6-9b64-a85562f926a8/.system_generated/logs/transcript.jsonl"

lines_to_inspect = [2062, 2063, 2078, 2082]
with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line_str in enumerate(f):
        if idx + 1 in lines_to_inspect:
            try:
                data = json.loads(line_str)
                print(f"Line {idx+1}: Type: {data.get('type')}, Source: {data.get('source')}")
                tool_calls = data.get("tool_calls", [])
                if tool_calls:
                    for tc in tool_calls:
                        print(f"  Tool Call Name: {tc.get('name')}")
                        print(f"  Arguments: {tc.get('arguments')}")
                # Also print content or other keys
                print(f"  Keys: {list(data.keys())}")
                if "content" in data and data["content"]:
                    print(f"  Content preview: {data['content'][:200]}")
            except Exception as e:
                print(f"  Error on line {idx+1}: {e}")
