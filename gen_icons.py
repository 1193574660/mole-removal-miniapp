#!/usr/bin/env python3
"""Generate placeholder icon PNGs for WeChat Mini Program tab bar."""
from PIL import Image, ImageDraw
import os

os.makedirs('images', exist_ok=True)

# Tab bar icons: 81x81 (WeChat recommended size)
TAB_ICONS = [
    ('tab-home', '#999999'),
    ('tab-home-active', '#3D7BFF'),
    ('tab-consult', '#999999'),
    ('tab-consult-active', '#3D7BFF'),
    ('tab-order', '#999999'),
    ('tab-order-active', '#3D7BFF'),
    ('tab-user', '#999999'),
    ('tab-user-active', '#3D7BFF'),
]

for name, color in TAB_ICONS:
    img = Image.new('RGBA', (81, 81), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Simple icon: circle or rounded rect
    draw.rounded_rectangle([12, 12, 69, 69], radius=16, fill=color)
    img.save(f'images/{name}.png')
    print(f'Created images/{name}.png')

# Placeholder images (400x400)
PLACEHOLDERS = [
    ('default-service', '#e8e8e8'),
    ('default-doctor', '#e8f0ff'),
    ('default-avatar', '#e0e0e0'),
    ('banner-1', '#c8d6e5'),
    ('banner-2', '#dfe6e9'),
]
for name, color in PLACEHOLDERS:
    img = Image.new('RGB', (400, 400), color)
    draw = ImageDraw.Draw(img)
    draw.text((160, 190), name, fill='#999')
    img.save(f'images/{name}.png')
    print(f'Created images/{name}.png')

# Category icons
CATS = [
    ('icon-face', '#F0F4FF'),
    ('icon-body', '#FFF0F0'),
    ('icon-complex', '#F0FFF4'),
    ('icon-pigment', '#FFF8F0'),
]
for name, color in CATS:
    img = Image.new('RGB', (160, 160), color)
    img.save(f'images/{name}.png')
    print(f'Created images/{name}.png')

print('\nAll placeholder icons generated.')
