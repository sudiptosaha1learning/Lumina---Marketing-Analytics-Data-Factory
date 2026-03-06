import os, pathlib, subprocess

print("cwd:", os.getcwd())
print("home:", pathlib.Path.home())

# Search broadly for package.json
result = subprocess.run(["find", "/", "-name", "package.json", "-not", "-path", "*/node_modules/*", "-maxdepth", "8"], 
                        capture_output=True, text=True, timeout=10)
print("package.json locations:")
print(result.stdout[:2000])
