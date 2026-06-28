import os
import subprocess

print("Scanning .git/objects...")
blobs = []
# Walk through .git/objects
git_dir = "/Users/youssefmahir/Developer/ecom/.git"
objects_dir = os.path.join(git_dir, "objects")

for root, dirs, files in os.walk(objects_dir):
    for f in files:
        if len(f) == 38: # standard loose object file
            subdir = os.path.basename(root)
            if len(subdir) == 2:
                sha = subdir + f
                # Get type
                try:
                    obj_type = subprocess.check_output(["git", "cat-file", "-t", sha], cwd="/Users/youssefmahir/Developer/ecom").decode().strip()
                    if obj_type == "blob":
                        size = int(subprocess.check_output(["git", "cat-file", "-s", sha], cwd="/Users/youssefmahir/Developer/ecom").decode().strip())
                        # Get first line of content
                        content_head = subprocess.check_output(["git", "cat-file", "-p", sha], cwd="/Users/youssefmahir/Developer/ecom")[:200].decode(errors='replace').replace('\n', ' ')
                        blobs.append((sha, size, content_head))
                except Exception as e:
                    pass

# Sort by size descending
blobs.sort(key=lambda x: x[1], reverse=True)
print(f"Found {len(blobs)} blobs:")
for sha, size, head in blobs[:30]:
    print(f"SHA: {sha}, Size: {size} bytes, Head: {head[:100]}")
