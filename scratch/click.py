import sys
import time
from Quartz.CoreGraphics import CGEventCreateMouseEvent, CGEventPost, kCGEventLeftMouseDown, kCGEventLeftMouseUp, kCGMouseButtonLeft, kCGHIDEventTap

def click(x, y):
    # Create mouse down event
    down_event = CGEventCreateMouseEvent(
        None,
        kCGEventLeftMouseDown,
        (x, y),
        kCGMouseButtonLeft
    )
    # Create mouse up event
    up_event = CGEventCreateMouseEvent(
        None,
        kCGEventLeftMouseUp,
        (x, y),
        kCGMouseButtonLeft
    )
    # Post events
    CGEventPost(kCGHIDEventTap, down_event)
    time.sleep(0.1)
    CGEventPost(kCGHIDEventTap, up_event)
    print(f"Clicked at ({x}, {y})")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 click.py <x> <y>")
        sys.exit(1)
    x = float(sys.argv[1])
    y = float(sys.argv[2])
    click(x, y)
