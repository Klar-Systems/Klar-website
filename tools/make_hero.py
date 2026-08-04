"""
Generates the Klar hero background loop from scratch.

Brand-only: near-black ground, Klar lime blooms, a cool counter-light and a
warm service-side amber, plus a slow rising field of points that reads as
orders and bookings arriving. Every motion term is a sinusoid with an integer
number of cycles across the clip, so the last frame flows into the first and
the loop is seamless.
"""
import numpy as np, os, sys, subprocess

W, H = 1280, 720
FPS = 25
SECONDS = 12
N = FPS * SECONDS
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frames")
os.makedirs(OUT, exist_ok=True)

ASPECT = W / H
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
X = (xx / W) * ASPECT
Y = yy / H

# soft light blooms: (colour, base x, base y, drift x, drift y, cycles x, cycles y, radius, strength)
BLOOMS = [
    ((0.784, 1.000, 0.000), 0.26, 0.30, 0.09, 0.06, 1, 1, 0.30, 0.34),  # Klar lime
    ((0.784, 1.000, 0.000), 1.18, 0.78, 0.07, 0.05, 1, 2, 0.24, 0.18),  # lime, counter-phase
    ((0.216, 0.541, 0.784), 1.30, 0.30, 0.08, 0.07, 2, 1, 0.32, 0.26),  # cool blue
    ((1.000, 0.502, 0.180), 0.62, 0.96, 0.06, 0.04, 1, 1, 0.24, 0.12),  # warm amber
]

rng = np.random.default_rng(7)
DOTS = 70
dot_x = rng.uniform(0, ASPECT, DOTS).astype(np.float32)
dot_y = rng.uniform(0, 1, DOTS).astype(np.float32)
dot_speed = rng.uniform(0.6, 1.8, DOTS).astype(np.float32)
dot_size = rng.integers(2, 6, DOTS)
dot_bright = rng.uniform(0.15, 0.7, DOTS).astype(np.float32)
dot_phase = rng.uniform(0, 1, DOTS).astype(np.float32)

# small gaussian stamps, one per dot radius
stamps = {}
for r in range(2, 7):
    k = np.arange(-r * 2, r * 2 + 1, dtype=np.float32)
    g = np.exp(-(k ** 2) / (2 * (r / 1.6) ** 2))
    stamps[r] = np.outer(g, g).astype(np.float32)

vignette = 1.0 - 0.55 * (((X / ASPECT - 0.5) ** 2 + (Y - 0.5) ** 2) / 0.5)
vignette = np.clip(vignette, 0.22, 1.0).astype(np.float32)

TWO_PI = np.float32(2 * np.pi)

for i in range(N):
    t = np.float32(i / N)
    img = np.zeros((H, W, 3), dtype=np.float32)
    img += np.stack([
        np.full((H, W), 0.030, np.float32),
        np.full((H, W), 0.030, np.float32),
        np.full((H, W), 0.028, np.float32),
    ], axis=-1)
    img *= (1.0 + 0.35 * (1.0 - Y))[..., None]

    for (col, bx, by, dx, dy, cx_n, cy_n, rad, strength) in BLOOMS:
        cx = bx + dx * np.sin(TWO_PI * cx_n * t)
        cy = by + dy * np.cos(TWO_PI * cy_n * t)
        breathe = 1.0 + 0.14 * np.sin(TWO_PI * t + bx)
        d2 = (X - cx) ** 2 + (Y - cy) ** 2
        field = np.exp(-d2 / (2.0 * (rad * breathe) ** 2)).astype(np.float32)
        img += field[..., None] * np.array(col, np.float32) * strength

    # rising points, wrapped so the field is continuous across the loop
    dy_t = (dot_y - dot_speed * t * 0.35) % 1.0
    twinkle = 0.55 + 0.45 * np.sin(TWO_PI * (t * 2 + dot_phase))
    for j in range(DOTS):
        r = int(dot_size[j])
        s = stamps[r]
        px = int(dot_x[j] / ASPECT * W)
        py = int(dy_t[j] * H)
        h2 = s.shape[0] // 2
        y0, y1 = py - h2, py + h2 + 1
        x0, x1 = px - h2, px + h2 + 1
        if y0 < 0 or x0 < 0 or y1 > H or x1 > W:
            continue
        amp = 0.42 * dot_bright[j] * twinkle[j]
        img[y0:y1, x0:x1] += s[..., None] * np.array((0.784, 1.0, 0.35), np.float32) * amp

    # a faint drifting mesh, so the frame reads as engineered rather than a screensaver
    u = (X * 9.0 + Y * 3.5) + t
    du = np.abs(u - np.round(u))
    lines = np.exp(-(du / 0.030) ** 2).astype(np.float32)
    v = (Y * 6.0 - X * 1.5) - t
    dv = np.abs(v - np.round(v))
    lines = lines + 0.6 * np.exp(-(dv / 0.030) ** 2).astype(np.float32)
    mesh_fade = np.clip((Y - 0.15) * 1.3, 0, 1).astype(np.float32)
    img += (lines * mesh_fade * 0.030)[..., None] * np.array((0.60, 0.80, 0.35), np.float32)

    img *= vignette[..., None]
    # a touch of noise so the dark gradients do not band once encoded
    img += rng.normal(0, 0.0035, img.shape).astype(np.float32)
    frame = np.clip(img, 0, 1)
    frame = np.power(frame, 0.98)
    (np.round(frame * 255).astype(np.uint8)).tofile(os.path.join(OUT, "f%04d.raw" % i))

    if i % 50 == 0:
        sys.stderr.write("frame %d/%d\n" % (i, N))

print("%d %d %d %d" % (W, H, FPS, N))
