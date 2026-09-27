import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs('icons', exist_ok=True)

def create_app_icon(size, filename):
    # Create gradient background image
    img = Image.new('RGBA', (size, size), (15, 23, 42, 255))
    draw = ImageDraw.Draw(img)

    # Draw rounded rectangle container with gradient accent
    margin = int(size * 0.08)
    corner_radius = int(size * 0.22)
    
    # Gradient background box
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=corner_radius,
        fill=(99, 102, 241, 255),
        outline=(168, 85, 247, 255),
        width=int(size * 0.02)
    )

    # Draw inner wallet icon elements
    cx, cy = size // 2, size // 2
    w_width = int(size * 0.45)
    w_height = int(size * 0.32)

    # Wallet body
    wx1 = cx - w_width // 2
    wy1 = cy - w_height // 2
    wx2 = cx + w_width // 2
    wy2 = cy + w_height // 2

    draw.rounded_rectangle([wx1, wy1, wx2, wy2], radius=int(size * 0.06), fill=(255, 255, 255, 255))
    
    # Wallet flap
    fx1 = cx + int(w_width * 0.05)
    fy1 = cy - int(w_height * 0.25)
    fx2 = wx2
    fy2 = cy + int(w_height * 0.25)
    draw.rounded_rectangle([fx1, fy1, fx2, fy2], radius=int(size * 0.04), fill=(6, 186, 212, 255))

    # Wallet clasp dot
    dot_r = int(size * 0.035)
    dot_cx = cx + int(w_width * 0.28)
    draw.ellipse([dot_cx - dot_r, cy - dot_r, dot_cx + dot_r, cy + dot_r], fill=(255, 255, 255, 255))

    img.save(filename, 'PNG')
    print(f"Generated {filename}")

create_app_icon(192, 'icons/icon-192.png')
create_app_icon(512, 'icons/icon-512.png')
