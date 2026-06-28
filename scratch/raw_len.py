with open("/Users/youssefmahir/.gemini/antigravity-ide/brain/936800b0-a891-45d6-9b64-a85562f926a8/.system_generated/logs/transcript.jsonl", "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx + 1 == 1943:
            print(f"Raw line length: {len(line)}")
            break
