# Voiceover with Kokoro (optional)

A voiceover is an **option**, never a requirement. The default film has no voice: large type and real screens carry the story, music and SFX sit on top. Add a voiceover only when the user says yes in the step 2 question round. If Kokoro is missing or fails, ship the film without a voice and say so; never block a run on it.

Kokoro-82M is a free, local, offline text-to-speech model. HyperFrames wraps it as `npx hyperframes tts` (it calls the `kokoro-onnx` Python package). No account, no API key, no upload of the script anywhere.

## 1. Check (step 0, optional item)

Run both, under the Node 22 PATH prefix:

```sh
PATH="$HOME/.nvm/versions/node/<v22+>/bin:$PATH" npx --yes hyperframes@<pinned> doctor
```

Look at the `TTS (Kokoro)` line: "Kokoro deps installed" = OK. "Not installed (optional — local voice fallback)" = missing. Also check the Python HyperFrames will use:

```sh
python3 --version            # needs 3.10-3.13
echo "$HYPERFRAMES_PYTHON"   # if set, this interpreter wins over PATH
```

macOS ships `/usr/bin/python3` 3.9: too old. Look for a newer one with `which -a python3.11 python3.12 python3.13` (on macOS also `ls /opt/homebrew/bin/python3.1*`; on Windows `py -0`). Non-English voices also need `espeak-ng` installed system-wide.

Missing Kokoro is "optional, say 'skip'" in the step 0 checklist, the same as music.

## 2. Install (ask first; the user may prefer to run it themselves)

Use a dedicated venv, not `pip install` into the system or Homebrew Python (Homebrew blocks it with "externally-managed-environment", and the system Python is 3.9).

1. Python 3.10-3.13. If none exists: macOS `brew install python@3.12`; Linux the distro package (e.g. `sudo apt install python3.12 python3.12-venv`); Windows the python.org installer or `winget install Python.Python.3.12`.
2. Create the venv and install the two packages (macOS/Linux shown; on Windows the venv's interpreter is `~/.venvs/kokoro/Scripts/python.exe`):
   ```sh
   python3.12 -m venv ~/.venvs/kokoro
   ~/.venvs/kokoro/bin/pip install --upgrade pip
   ~/.venvs/kokoro/bin/pip install kokoro-onnx soundfile
   ```
   (Use whichever 3.10-3.13 binary exists, e.g. `python3.11`.) Alternative with uv: `uv venv --python 3.12 ~/.venvs/kokoro && VIRTUAL_ENV=~/.venvs/kokoro uv pip install kokoro-onnx soundfile`.
3. Point HyperFrames at it. Prefix every `tts` call (and `doctor`) with `HYPERFRAMES_PYTHON="$HOME/.venvs/kokoro/bin/python"`. The user can make it permanent by adding `export HYPERFRAMES_PYTHON="$HOME/.venvs/kokoro/bin/python"` to their shell profile (e.g. `~/.zshrc` or `~/.bashrc`); ask before editing it.
4. Re-run `doctor`: `TTS (Kokoro)` must say installed.
5. Smoke test (first call downloads the model, about 311 MB, and voices, about 27 MB, into the HyperFrames cache; say so and ask before the download):
   ```sh
   HYPERFRAMES_PYTHON="$HOME/.venvs/kokoro/bin/python" PATH="$HOME/.nvm/versions/node/<v22+>/bin:$PATH" \
     npx --yes hyperframes@<pinned> tts "Setup check." --voice af_heart -o /tmp/kokoro-check.wav --json
   ```
   Expect `{"ok":true,...,"durationSeconds":...}`. Later calls are offline.

   Tested 2026-11-05 on macOS arm64: Homebrew Python 3.11, kokoro-onnx 0.6.1, HyperFrames 0.9.5. First call about 75 s (download, cache `~/.cache/hyperframes/tts`, 349 MB), later calls about 7 s per line. Output is 24 kHz mono WAV. A 10-word line took 3.84 s at speed 1.0 (2.6 words/s).

Record the venv path and Python version in `app-brief.md` under "Environment".

Troubleshooting:
- "Python 3 is required" / "kokoro-onnx package is not installed": `HYPERFRAMES_PYTHON` is unset or points to the wrong interpreter. `doctor` reports a rejected override.
- `pip` fails building `onnxruntime`: the Python is too new (3.14+) or too old. Recreate the venv with 3.12.
- Model download fails (proxy, offline): retry once with the user's OK; otherwise ship without voice.

## 3. Ask (step 2 question round)

Fold into the "CTA, tone, music" question: "Voiceover? Default: none (type and music only). If yes: male or female, US or UK English, and should I write the script or do you have one?" Offer two or three voices from the list below, with a recommendation that fits the tone.

Voices (`npx hyperframes tts --list` shows the bundled set; any Kokoro voice ID works):

| ID | Voice | Fits |
| --- | --- | --- |
| `af_heart` (default) | US female, warm | most teasers |
| `af_nova`, `af_sky` | US female, brighter | upbeat |
| `am_michael`, `am_adam` | US male | calm enterprise |
| `bf_emma`, `bf_isabella` | UK female | formal |
| `bm_george` | UK male | formal |
| `ef_dora`, `ff_siwis`, `jf_alpha`, `zf_xiaobei` | Spanish, French, Japanese, Mandarin | localised cuts |

The first letter of an ID sets the language, the second the gender. For a non-English film, write the script in that language and use a voice of that language.

## 4. Write the script (step 3)

- Write the script **per beat** into `STORYLINES.md` (the chosen storyline) and then into `SPEC.md` as a table: beat, start, end, line, voice, speed.
- The voice **adds to** the on-screen type; it does not replace it. The film must still read on mute. Do not read every headline aloud word for word; the voice can say the sentence the headline compresses ("Every audit, ready before the auditor asks." under the word AUDIT-READY).
- Same rules as on-screen text: every claim traces to the brief or the user's words; no invented numbers; no "autonomous" or "magic" AI; the hook line is an outcome, not the app name.
- Budget about 2.3-2.6 words per second at speed 1.0. A 40 s film carries about 70-90 words, and leave silence: the hook, the reveal and the end card can breathe. Keep each line inside its beat with 0.2-0.4 s of air before the next cut.
- Write numbers and product names as they should be spoken ("Launchpad", "G R C" if it is spelled out). Check pronunciation in the smoke test, and respell if needed (spell the word phonetically in the script only, never on screen).
- The user approves the script words before any audio is generated (it is part of the storyline pick).

## 5. Generate

One file per line, so timing and retakes stay independent:

```sh
mkdir -p assets/audio/vo
HYPERFRAMES_PYTHON="$HOME/.venvs/kokoro/bin/python" PATH="$HOME/.nvm/versions/node/<v22+>/bin:$PATH" \
  npx --yes hyperframes@<pinned> tts "Want faster and more accurate audits?" \
  --voice af_heart --speed 1.0 -o assets/audio/vo/vo-01-hook.wav --json
```

- Long lines: put the text in a `.txt` file and pass the path instead of the quoted string.
- `--json` returns `durationSeconds`: write it into the SPEC table. If a line runs past its beat, shorten the words first; use `--speed` only between 0.9 and 1.15 (outside that it sounds rushed or slurred).
- Re-time the beat to the voice if the user prefers the line as written; keep the beat grid from the Gotchas (cuts on bars).
- Optional, for captions or exact word times: `npx hyperframes transcribe assets/audio/vo/vo-01-hook.wav` returns timed words. Read the transcript against the script before using it.
- Add a line to `assets/audio/CREDITS.md`: "Voiceover: Kokoro-82M (Apache 2.0), voice <id>, generated locally."
- The voice is synthetic. Tell the user, and offer an "AI-generated voice" line in the video description or end-card credits; some places (for example the EU AI Act's transparency rules) require that disclosure for AI-generated audio. Never make the voice imitate a real, named person.

## 6. Place and mix

Each line is its own clip, in a voiceover group:

```html
<hf-audio-group id="voiceover"></hf-audio-group>
<audio id="vo-01" class="clip" src="assets/audio/vo/vo-01-hook.wav"
  data-audio-group="voiceover" data-timeline-role="voiceover"
  data-start="0.4" data-duration="2.6" data-volume="1"></audio>
```

- `data-start`: the beat start plus 0.2-0.4 s (let the first frame land before the voice). `data-duration`: the file's `durationSeconds`.
- Duck the music under the voice: a `volume` lane on the music bed, full before a line, about 0.3-0.4 while the voice speaks, back up after (see `media-use` `references/mixing.md`, "Music under a voice"). Optionally run the carve script on the bed, never on the voice.
- SFX: keep the whooshes, but no SFX peak on top of a spoken word. Move the whoosh or drop it.
- Render, then measure with `npx hyperframes audio <mp4> --json`: aim for about -16 to -14 LUFS integrated, true peak <= -1 dBTP, voice clearly above the bed. Say it was measured, not heard, and ask the user to listen once with sound and once on mute.

## 7. Review (REVIEW.md)

Add a "Voiceover" section: voice ID and speed, the script per beat with each line's source in the brief, durations vs. beat lengths, any respellings, the measured loudness, and a check that every beat still reads with the sound off.

## Without a voiceover

Nothing changes: skip sections 2-7, keep the type-led film, music and SFX. Note "Voiceover: none (user choice / Kokoro not installed)" in `SPEC.md` and the reply.
