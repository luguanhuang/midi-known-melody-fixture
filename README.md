# Known Melody MP3-to-MIDI Fixture

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23157004.svg)](https://doi.org/10.5281/zenodo.23157004)

A small, reproducible fixture for checking a browser-based dominant-melody MP3-to-MIDI workflow.

The fixture is deliberately narrow: a 5.85-second mono MP3 with eight designed tones and one Standard MIDI output produced by the public MIDI Convert browser tool. It is useful for checking that a result contains the expected number of note-on events before someone uses a more complex recording.

Source tool and workflow: https://midiconvert.com/change-mp3-to-midi

## Contents

- `fixtures/known-melody.mp3`: clean input fixture, 5.85 seconds, mono MP3.
- `fixtures/known-melody.mid`: recorded Standard MIDI output for the fixture.
- `fixtures/manifest.json`: expected event count and SHA-256 values.
- `scripts/check-midi-events.js`: dependency-free Node.js check for MIDI note-on events.

## Run the check

Requires Node.js 18 or newer. No package installation is needed.

```sh
node scripts/check-midi-events.js fixtures/known-melody.mid fixtures/manifest.json
```

Expected output:

```text
PASS: found 8 note-on events; expected 8.
```

## What this check does and does not prove

It confirms that the recorded MIDI fixture contains eight note-on events for the eight designed tones in this clean input. It does not measure pitch accuracy, timing accuracy, or expected performance on a different MP3. For an actual recording, compare the first note, main movement, repeated note, and pause with the source before editing.

## Recreate the browser run

1. Open https://midiconvert.com/.
2. Select `fixtures/known-melody.mp3`.
3. Leave the tool in `Melody / solo instrument` mode.
4. Convert locally and download the MIDI.
5. Run the checker against the downloaded file, then compare the note contour with the source audio.

## License

The fixture, manifest, and checker in this repository are released under the MIT License. The audio is a synthetic test phrase created for this fixture, not a recording of a commercial song.

## Citation

Known Melody MP3-to-MIDI Fixture, version 1.0.0. Zenodo. https://doi.org/10.5281/zenodo.23157004
