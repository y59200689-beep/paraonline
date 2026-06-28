import ctypes
import time
import sys

# Load ApplicationServices framework
app_services = ctypes.CDLL('/System/Library/Frameworks/ApplicationServices.framework/ApplicationServices')

# Define CGEventCreateMouseEvent
# CGEventRef CGEventCreateMouseEvent(CGEventSourceRef source, CGEventType mouseType, CGPoint mouseCursorPosition, CGMouseButton mouseButton);
class CGPoint(ctypes.Structure):
    _fields_ = [("x", ctypes.c_double), ("y", ctypes.c_double)]

app_services.CGEventCreateMouseEvent.argtypes = [
    ctypes.c_void_p, # source
    ctypes.c_uint32, # mouseType
    CGPoint,         # mouseCursorPosition
    ctypes.c_uint32  # mouseButton
]
app_services.CGEventCreateMouseEvent.restype = ctypes.c_void_p

# Define CGEventPost
# void CGEventPost(CGEventTapLocation tap, CGEventRef event);
app_services.CGEventPost.argtypes = [
    ctypes.c_uint32, # tap
    ctypes.c_void_p  # event
]
app_services.CGEventPost.restype = None

# Constants
kCGEventLeftMouseDown = 1
kCGEventLeftMouseUp = 2
kCGMouseButtonLeft = 0
kCGHIDEventTap = 0

def click(x, y):
    pos = CGPoint(x, y)
    
    # Mouse Down
    event_down = app_services.CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, pos, kCGMouseButtonLeft)
    app_services.CGEventPost(kCGHIDEventTap, event_down)
    
    time.sleep(0.1)
    
    # Mouse Up
    event_up = app_services.CGEventCreateMouseEvent(None, kCGEventLeftMouseUp, pos, kCGMouseButtonLeft)
    app_services.CGEventPost(kCGHIDEventTap, event_up)
    
    print(f"Ctypes clicked at ({x}, {y})")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 click_ctypes.py <x> <y>")
        sys.exit(1)
    x = float(sys.argv[1])
    y = float(sys.argv[2])
    
    # First, bring Chrome to the front
    import os
    os.system("osascript -e 'tell application \"Google Chrome\" to activate'")
    time.sleep(1.0)
    
    click(x, y)
