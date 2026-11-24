"""Prepare brand images for the ad.

- logo.png      : logo with the white background removed (edge flood fill + soft alpha)
- teacher.jpg   : portrait, colour-graded towards the navy/gold palette
Usage: python3 scripts/prepare_images.py <logo_source.png> <teacher_source.jpg>
"""
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

logo_src, teacher_src = sys.argv[1], sys.argv[2]

# ---------- logo: remove white background connected to the borders ----------
im = Image.open(logo_src).convert("RGBA")
a = np.array(im).astype(np.int16)
h, w = a.shape[:2]
rgb = a[..., :3]
whiteness = rgb.min(axis=2)            # 255 for pure white
spread = rgb.max(axis=2) - rgb.min(axis=2)
bgish = (whiteness > 225) & (spread < 25)
mask = np.zeros((h, w), bool)
q = deque()
for x in range(w):
    for y in (0, h - 1):
        if bgish[y, x]:
            mask[y, x] = True; q.append((y, x))
for y in range(h):
    for x in (0, w - 1):
        if bgish[y, x] and not mask[y, x]:
            mask[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w and not mask[ny, nx] and bgish[ny, nx]:
            mask[ny, nx] = True; q.append((ny, nx))
alpha = np.where(mask, 0, 255).astype(np.uint8)
alpha_img = Image.fromarray(alpha).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
out = Image.fromarray(a.astype(np.uint8))
out.putalpha(alpha_img)
bbox = out.getbbox()
out = out.crop(bbox)
out.save("public/images/logo.png", optimize=True)
print("logo", out.size)

# ---------- teacher portrait: cool/navy grade, crop to portrait 4:5 ----------
t = Image.open(teacher_src).convert("RGB")
W, H = t.size
crop_w = int(W * 0.78)
left = (W - crop_w) // 2
t = t.crop((left, 0, left + crop_w, H))
t = ImageEnhance.Contrast(t).enhance(1.08)
t = ImageEnhance.Color(t).enhance(0.9)
arr = np.asarray(t).astype(np.float32) / 255.0
# re-light the lavender studio backdrop to the brand's royal navy (hue-selective)
hsv = np.array(t.convert("HSV")).astype(np.float32) / 255.0
hue = hsv[..., 0] * 360
w = np.clip(1.4 - np.abs(hue - 262) / 40, 0, 1) * np.clip((hsv[..., 1] - 0.06) / 0.15, 0, 1)
w = np.array(Image.fromarray((w * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))).astype(np.float32) / 255.0
soft = np.asarray(t.filter(ImageFilter.GaussianBlur(14))).astype(np.float32).mean(axis=2, keepdims=True) / 255.0
navy = np.array([0.10, 0.20, 0.52]) * (0.5 + 0.65 * soft)
arr = arr * (1 - w[..., None]) + navy * w[..., None]
# gentle split-tone: shadows to navy, highlights to warm gold
lum = arr.mean(axis=2, keepdims=True)
shadow = np.array([0.05, 0.10, 0.28]); high = np.array([1.0, 0.86, 0.6])
tone = shadow * (1 - lum) + high * lum
arr = arr * 0.86 + tone * 0.14 * (0.6 + 0.4 * lum)
arr = np.clip(arr, 0, 1)
Image.fromarray((arr * 255).astype(np.uint8)).save("public/images/teacher.jpg", quality=92)
print("teacher", t.size)
