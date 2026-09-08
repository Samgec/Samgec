#!/usr/bin/env python3
"""Regenerate the web-sized portfolio media in assets/poze-web/.

The masters in assets/Poze/ are camera originals (~1 GB) and are gitignored on
purpose: they must never be deployed. This script derives the copies the site
actually serves, and is safe to re-run at any time.

    python3 tools/build-gallery.py              # build anything missing
    python3 tools/build-gallery.py --force      # rebuild everything
    python3 tools/build-gallery.py --check      # build nothing, just report

Layout
------
    assets/Poze/<Project Name>/*.jpg          masters (any nesting, any names)
    assets/poze-web/<slug>/full/NN.jpg        1600px, quality 72
    assets/poze-web/<slug>/thumb/NN.jpg       700px, quality 68
    assets/poze-web/<slug>/video.mp4          720p H.264 (if a master .mp4 exists)
    assets/poze-web/manifest.json             slug -> folder, images, video

Files are renumbered to NN.jpg so the page can derive every URL from a slug and
a count. That is why proiecte.html only needs data-gallery and data-photos, and
why filenames with spaces or diacritics never reach a URL.

After adding or removing photos, re-run this and update the matching card in
proiecte.html: data-photos must equal the new count. Running with --check
reports any card whose count has drifted.

Requires ffmpeg for video. Uses macOS `sips` for images when present and falls
back to ffmpeg elsewhere.
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "Poze")
OUT = os.path.join(ROOT, "assets", "poze-web")
PAGE = os.path.join(ROOT, "proiecte.html")

IMG_EXT = (".jpg", ".jpeg", ".png", ".webp")
FULL_PX, FULL_Q = 1600, 72
THUMB_PX, THUMB_Q = 700, 68
# Card cover: rendered ~280px wide behind a heavy scrim, so it can be small
COVER_PX, COVER_Q = 560, 45

HAVE_SIPS = shutil.which("sips") is not None
HAVE_FFMPEG = shutil.which("ffmpeg") is not None


def slugify(name):
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()


def sort_key(filename):
    """Order within a folder: After photos, then Before, then everything else.

    Refurbishment projects ship as "Before 4.jpg" / "After 9.jpg". The gallery
    opens on the first image, and the finished work is what sells the job, so
    the After set has to lead. Numbers sort naturally (2 before 10) rather than
    as text, which would put "After 10" ahead of "After 2".
    """
    low = filename.lower()
    rank = 0 if low.startswith("after") else 1 if low.startswith("before") else 2
    parts = re.split(r"(\d+)", low)
    natural = [int(p) if p.isdigit() else p for p in parts]
    return (rank, natural)


def masters(project_dir):
    """Images in a project, root files first then each subfolder.

    Some projects nest a sub-collection (e.g. Cazane/Cazane Liceul Eliza
    Zamfirescu). Those photos belong to the same project, so they are appended
    after the root ones rather than becoming a separate card.
    """
    root_files = sorted(
        (f for f in os.listdir(project_dir)
         if f.lower().endswith(IMG_EXT) and os.path.isfile(os.path.join(project_dir, f))),
        key=sort_key,
    )
    out = [os.path.join(project_dir, f) for f in root_files]
    for sub in sorted(d for d in os.listdir(project_dir)
                      if os.path.isdir(os.path.join(project_dir, d))):
        sd = os.path.join(project_dir, sub)
        out += [os.path.join(sd, f) for f in sorted(os.listdir(sd), key=sort_key)
                if f.lower().endswith(IMG_EXT)]
    return out


def find_video(project_dir):
    for dirpath, _, files in os.walk(project_dir):
        for f in sorted(files):
            if f.lower().endswith(".mp4"):
                return os.path.join(dirpath, f)
    return None


def resize(src, dst, px, quality):
    if HAVE_SIPS:
        r = subprocess.run(
            ["sips", "-Z", str(px), "-s", "format", "jpeg",
             "-s", "formatOptions", str(quality), src, "--out", dst],
            capture_output=True)
        return r.returncode == 0
    if HAVE_FFMPEG:
        scale = f"scale='min({px},iw)':'min({px},ih)':force_original_aspect_ratio=decrease"
        r = subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", src,
             "-vf", scale, "-q:v", "4", dst], capture_output=True)
        return r.returncode == 0
    sys.exit("Need either `sips` (macOS) or `ffmpeg` to resize images.")


def transcode(src, dst):
    if not HAVE_FFMPEG:
        print("   ! ffmpeg missing, skipping video")
        return False
    r = subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", src,
         "-vf", "scale=-2:720", "-c:v", "libx264", "-crf", "30",
         "-preset", "veryfast", "-c:a", "aac", "-b:a", "96k",
         "-movflags", "+faststart", dst], capture_output=True)
    return r.returncode == 0


def poster(video_src, dst):
    """Still frame from a video, for projects that ship no photos.

    Seeks a little way in rather than to the first frames: these clips open on
    a title slate, and a slate behind the card's own heading is text over text.
    Capped so short clips still land inside their runtime.
    """
    if not HAVE_FFMPEG:
        return False
    seek = 25
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", video_src], capture_output=True, text=True)
    try:
        seek = min(seek, max(1, float(probe.stdout.strip()) * 0.08))
    except ValueError:
        pass  # unreadable duration: fall back to the 25s default
    r = subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-ss", str(seek), "-i", video_src,
         "-frames:v", "1", "-vf", "scale=%d:-2" % COVER_PX, "-q:v", "6", dst],
        capture_output=True)
    return r.returncode == 0


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--force", action="store_true", help="rebuild files that already exist")
    ap.add_argument("--check", action="store_true", help="report only, write nothing")
    args = ap.parse_args()

    if not os.path.isdir(SRC):
        sys.exit(f"Masters not found: {SRC}\n"
                 "assets/Poze/ is gitignored — restore it from the original photos.")

    projects = sorted(d for d in os.listdir(SRC) if os.path.isdir(os.path.join(SRC, d)))
    manifest, built, total = [], 0, 0

    for name in projects:
        pdir = os.path.join(SRC, name)
        slug = slugify(name)
        imgs = masters(pdir)
        video = find_video(pdir)
        fdir, tdir = os.path.join(OUT, slug, "full"), os.path.join(OUT, slug, "thumb")

        if not args.check:
            os.makedirs(fdir, exist_ok=True)
            os.makedirs(tdir, exist_ok=True)

        names = []
        for i, src in enumerate(imgs, 1):
            n = "%02d.jpg" % i
            names.append(n)
            total += 1
            if args.check:
                continue
            for dst_dir, px, q in ((fdir, FULL_PX, FULL_Q), (tdir, THUMB_PX, THUMB_Q)):
                dst = os.path.join(dst_dir, n)
                if args.force or not os.path.exists(dst):
                    resize(src, dst, px, q)
                    built += 1

        vid = None
        if video:
            vid = os.path.basename(video)
            dst = os.path.join(OUT, slug, "video.mp4")
            if not args.check and (args.force or not os.path.exists(dst)):
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                if transcode(video, dst):
                    built += 1

        # Cover for the portfolio card background: the project's first image,
        # or a frame from the video for projects that ship no photos.
        cover = os.path.join(OUT, slug, "cover.jpg")
        if not args.check and (args.force or not os.path.exists(cover)):
            os.makedirs(os.path.dirname(cover), exist_ok=True)
            if imgs:
                if resize(imgs[0], cover, COVER_PX, COVER_Q):
                    built += 1
            elif video and poster(video, cover):
                built += 1

        manifest.append({"slug": slug, "folder": name, "images": names, "video": vid})
        print("%-46s %3d images%s" % (name[:46], len(names), "  +video" if vid else ""))

    if not args.check:
        os.makedirs(OUT, exist_ok=True)
        with open(os.path.join(OUT, "manifest.json"), "w") as fh:
            json.dump(manifest, fh, ensure_ascii=False, indent=1)

    print("\n%d projects, %d images%s" %
          (len(manifest), total, "" if args.check else ", %d files written" % built))

    # Warn when a card in proiecte.html no longer matches what is on disk.
    if os.path.exists(PAGE):
        html = open(PAGE).read()
        # Tolerate other attributes between the two (the cards also carry
        # style="--cover:..."), so adding one does not blind this check.
        counts = dict(re.findall(
            r'data-gallery="([^"]+)"[^>]*?data-photos="(\d+)"', html))
        problems = []
        for p in manifest:
            want = len(p["images"])
            if p["slug"] not in counts:
                problems.append("  no card in proiecte.html for '%s'" % p["slug"])
            elif int(counts[p["slug"]]) != want:
                problems.append("  %s: card says %s, disk has %d"
                                % (p["slug"], counts[p["slug"]], want))
        for slug in counts:
            if not any(p["slug"] == slug for p in manifest):
                problems.append("  card '%s' has no folder in assets/Poze" % slug)
        if problems:
            print("\nproiecte.html needs attention:")
            print("\n".join(problems))
        else:
            print("proiecte.html matches the media on disk.")


if __name__ == "__main__":
    main()
