#!/usr/bin/env python3
"""
Generate professional placeholder assets for the Mole Removal Mini Program.
Run: python3 gen_icons.py
Requires: pip install Pillow
"""
from PIL import Image, ImageDraw, ImageFont
import os, math

os.makedirs('images', exist_ok=True)
SIZE = 81  # WeChat tabBar icon recommended size

# ── Color Palette ──
GREY   = '#999999'
BLUE   = '#3D7BFF'
WHITE  = '#FFFFFF'
LIGHT_BG = '#F5F5F5'
BANNER_COLORS = [
    ('#667eea', '#764ba2'),  # purple
    ('#f093fb', '#f5576c'),  # pink
]
CARD_COLORS = [
    '#E8F0FF', '#FFF0E8', '#E8FFF4', '#FFF8E8',
]

# ── Try to load a CJK font ──
FONT = None
FONT_PATHS = [
    '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf',
    '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc',
    '/usr/share/fonts/truetype/wqy/wqy-microhei.ttc',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
]
for fp in FONT_PATHS:
    if os.path.exists(fp):
        try: FONT = ImageFont.truetype(fp, 32); break
        except: pass
if FONT is None:
    FONT = ImageFont.load_default()


def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def draw_circle(draw, cx, cy, r, fill):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill)


def draw_rounded_rect(draw, xy, radius, fill):
    """Draw a rounded rectangle. xy = (x0, y0, x1, y1)."""
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill)


# ═══ Tab Bar Icons (81×81) ═══
def gen_tab_icons():
    icons = {
        'tab-home': lambda d, c: draw_home(d, c),
        'tab-home-active': lambda d, c: draw_home(d, c),
        'tab-consult': lambda d, c: draw_chat(d, c),
        'tab-consult-active': lambda d, c: draw_chat(d, c),
        'tab-order': lambda d, c: draw_list(d, c),
        'tab-order-active': lambda d, c: draw_list(d, c),
        'tab-user': lambda d, c: draw_user(d, c),
        'tab-user-active': lambda d, c: draw_user(d, c),
    }
    for name, drawer in icons.items():
        color = BLUE if 'active' in name else GREY
        img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        drawer(d, color)
        img.save(f'images/{name}.png')
        print(f'  [tab] {name}.png')


def draw_home(d, c):
    """Simple house icon."""
    # Roof triangle
    d.polygon([(40, 12), (12, 36), (68, 36)], fill=c)
    # Body
    d.rectangle([18, 36, 62, 66], fill=c)
    # Door
    d.rectangle([34, 46, 46, 66], fill='white' if c == BLUE else '#E8E8E8')


def draw_chat(d, c):
    """Chat bubble icon."""
    # Ellipse bubble
    draw_rounded_rect(d, (10, 12, 70, 52), radius=12, fill=c)
    # Tail
    d.polygon([(22, 50), (14, 66), (30, 50)], fill=c)
    # Dots inside
    d.ellipse([24, 26, 30, 32], fill='white' if c == BLUE else '#E8E8E8')
    d.ellipse([36, 26, 42, 32], fill='white' if c == BLUE else '#E8E8E8')
    d.ellipse([48, 26, 54, 32], fill='white' if c == BLUE else '#E8E8E8')


def draw_list(d, c):
    """Order list icon."""
    # Clipboard shape
    draw_rounded_rect(d, (14, 10, 66, 70), radius=8, fill=c)
    # Top clip
    d.rectangle([28, 6, 52, 18], fill=c)
    # Lines
    wf = 'white' if c == BLUE else '#E8E8E8'
    d.rectangle([22, 26, 58, 30], fill=wf)
    d.rectangle([22, 36, 50, 40], fill=wf)
    d.rectangle([22, 46, 42, 50], fill=wf)


def draw_user(d, c):
    """User silhouette icon."""
    # Head
    draw_circle(d, 40, 26, 12, c)
    # Body arc
    d.ellipse([20, 42, 60, 72], fill=c)
    # Cutout at bottom
    draw_rounded_rect(d, (20, 42, 60, 56), radius=0, fill=c)
    # White cutout
    wcut = (0, 0, 0, 0) if c == BLUE else hex_to_rgb('#E8E8E8')
    d.ellipse([26, 44, 54, 62], fill=(0, 0, 0, 0) if type(wcut) == tuple else wcut)

# ═══ Banner Images (750×340) ═══
def gen_banners():
    for i, (c1, c2) in enumerate(BANNER_COLORS):
        img = Image.new('RGB', (750, 340))
        d = ImageDraw.Draw(img)
        r1, g1, b1 = hex_to_rgb(c1)
        r2, g2, b2 = hex_to_rgb(c2)
        for y in range(340):
            ratio = y / 340
            r = int(r1 + (r2 - r1) * ratio)
            g = int(g1 + (g2 - g1) * ratio)
            b = int(b1 + (b2 - b1) * ratio)
            d.line([(0, y), (750, y)], fill=(r, g, b))

        # Text
        texts = ['点痣医美 · 专业安全', '预约专家 · 限时优惠']
        try:
            big_font = ImageFont.truetype(FONT_PATHS[0], 48) if FONT_PATHS else FONT
        except:
            big_font = FONT
        d.text((40, 120), texts[i], fill='white', font=big_font)
        img.save(f'images/banner-{i+1}.png')
        print(f'  [banner] banner-{i+1}.png')


# ═══ Service Covers (750×500) ═══
def gen_service_covers():
    services = [
        ('单颗普通点痣', '30分钟 · ¥199起'),
        ('面部点痣', '60分钟 · ¥499起'),
        ('复合痣点除', '90分钟 · ¥899起'),
        ('色素痣激光去除', '45分钟 · ¥1299起'),
    ]
    for idx, (name, desc) in enumerate(services):
        img = Image.new('RGB', (750, 500), CARD_COLORS[idx % len(CARD_COLORS)])
        d = ImageDraw.Draw(img)
        # Decorative circle
        cx, cy = 580, 250
        for r in range(200, 30, -40):
            alpha = 30 + (200 - r) // 3
            d.ellipse([cx - r, cy - r, cx + r, cy + r],
                      fill=hex_to_rgb(CARD_COLORS[(idx + 1) % 4]), outline=None)

        # Text
        try:
            name_font = ImageFont.truetype(FONT_PATHS[0], 44) if FONT_PATHS else FONT
            desc_font = ImageFont.truetype(FONT_PATHS[0], 28) if FONT_PATHS else FONT
        except:
            name_font = desc_font = FONT
        d.text((40, 200), name, fill='#333', font=name_font)
        d.text((40, 260), desc, fill='#999', font=desc_font)
        d.text((40, 310), '🔬 激光无痛   ⚡ 快速恢复   🏥 专业团队', fill='#666', font=desc_font)
        img.save(f'images/default-service.png' if idx == 0 else f'images/service-{idx+1}.png')
        print(f'  [service] service-{idx+1 if idx>0 else "default"}.png')


# ═══ Doctor Avatars (200×200, circular) ═══
def gen_doctor_avatars():
    doctors = [
        ('李', '#FF6B6B', '主任医师'),
        ('王', '#4ECDC4', '主治医师'),
        ('张', '#45B7D1', '医美顾问'),
    ]
    for i, (initial, color, title) in enumerate(doctors):
        img = Image.new('RGBA', (200, 200), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        # Circle background
        draw_circle(d, 100, 100, 98, hex_to_rgb(color))
        # Initial
        try:
            big_font = ImageFont.truetype(FONT_PATHS[0], 72) if FONT_PATHS else FONT
        except:
            big_font = FONT
        bbox = d.textbbox((0, 0), initial, font=big_font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        d.text((100 - tw // 2, 100 - th // 2 - 4), initial, fill='white', font=big_font)
        name = f'images/default-doctor.png' if i == 0 else f'images/doctor-{i+1}.png'
        img.save(name)
        print(f'  [doctor] {name}')


# ═══ Category Icons (160×160) ═══
def gen_category_icons():
    cats = [
        ('icon-face', CARD_COLORS[0], '😊'),
        ('icon-body', CARD_COLORS[1], '💪'),
        ('icon-complex', CARD_COLORS[2], '🔬'),
        ('icon-pigment', CARD_COLORS[3], '✨'),
    ]
    for name, bg, emoji in cats:
        img = Image.new('RGB', (160, 160), hex_to_rgb(bg))
        d = ImageDraw.Draw(img)
        try:
            emoji_font = ImageFont.truetype(FONT_PATHS[0], 64) if FONT_PATHS else FONT
        except:
            emoji_font = FONT
        bbox = d.textbbox((0, 0), emoji, font=emoji_font)
        tw = bbox[2] - bbox[0]
        d.text(((160 - tw) // 2, 44), emoji, fill='#333', font=emoji_font)
        img.save(f'images/{name}.png')
        print(f'  [category] {name}.png')


# ═══ Default Avatar (200×200) ═══
def gen_default_avatar():
    img = Image.new('RGBA', (200, 200), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    draw_circle(d, 100, 100, 98, hex_to_rgb('#E0E0E0'))
    # Simple silhouette
    draw_circle(d, 100, 70, 30, hex_to_rgb('#BDBDBD'))
    d.ellipse([50, 110, 150, 180], fill=hex_to_rgb('#BDBDBD'))
    img.save('images/default-avatar.png')
    print('  [avatar] default-avatar.png')

# ═══ Main ═══
if __name__ == '__main__':
    print('Generating placeholder assets...\n')
    gen_tab_icons()
    gen_banners()
    gen_service_covers()
    gen_doctor_avatars()
    gen_category_icons()
    gen_default_avatar()
    print('\n✅ All done! Replace images/ with real design assets before launch.')
