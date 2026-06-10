"""
Logica di business per la manipolazione degli accordi.
La trasposizione sposta tutti gli accordi di N semitoni su o giù.
Es: Am trasposizione +2 → Bm; C trasposizione -1 → B
"""

# Scala cromatica in ordine (usata per calcolare la posizione di un accordo)
CHROMATIC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
CHROMATIC_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

# Accordi che usano convenzionalmente i bemolli invece dei diesis
FLAT_KEYS = {'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'}


def _use_flats(chord_root: str) -> bool:
    """Decide se la nota radice suona meglio con bemolli o diesis."""
    return chord_root in FLAT_KEYS or 'b' in chord_root


def transpose_chord(chord: str, semitones: int) -> str:
    """
    Trasporta un singolo accordo di `semitones` semitoni.
    Gestisce accordi con slash (es. G/B) e suffissi (es. Am7, Cmaj9, F#dim).

    Args:
        chord: accordo originale (es. 'Am', 'C#7', 'G/B')
        semitones: numero di semitoni (+/-, può essere > 12 o < -12)

    Returns:
        accordo trasposto (es. 'Bm', 'D#7', 'A/C#')
    """
    if not chord or semitones == 0:
        return chord

    # Gestisce accordo con basso alternativo: "G/B" → radice="G", basso="B"
    if '/' in chord:
        root_part, bass_part = chord.split('/', 1)
        return f"{transpose_chord(root_part, semitones)}/{transpose_chord(bass_part, semitones)}"

    # Estrae la nota radice (1 o 2 caratteri) dal resto del suffisso
    if len(chord) > 1 and chord[1] in ('#', 'b'):
        root = chord[:2]
        suffix = chord[2:]
    else:
        root = chord[:1]
        suffix = chord[1:]

    # Trova l'indice nella scala cromatica
    scale = CHROMATIC_FLAT if _use_flats(root) else CHROMATIC_SHARP
    alt_scale = CHROMATIC_SHARP if _use_flats(root) else CHROMATIC_FLAT

    if root in scale:
        index = scale.index(root)
    elif root in alt_scale:
        index = alt_scale.index(root)
    else:
        return chord  # accordo non riconosciuto, restituisce invariato

    # Applica la trasposizione con aritmetica modulare (12 semitoni = ottava)
    new_index = (index + semitones) % 12
    new_root = (CHROMATIC_FLAT if _use_flats(root) else CHROMATIC_SHARP)[new_index]

    return f"{new_root}{suffix}"


def transpose_song_chords(lyric_lines, semitones: int) -> list[dict]:
    """
    Trasporta tutti gli accordi di una canzone di `semitones` semitoni.
    Non modifica il database — restituisce una struttura dati pronta per la risposta API.

    Args:
        lyric_lines: queryset di LyricLine con `chords` prefetchati
        semitones: semitoni di trasposizione

    Returns:
        Lista di dict con le righe testo e gli accordi trasposti
    """
    result = []
    for line in lyric_lines:
        transposed_chords = [
            {
                'id': str(chord.id),
                'chord': transpose_chord(chord.chord, semitones),
                'original_chord': chord.chord,
                'position': chord.position,
            }
            for chord in line.chords.all()
        ]
        result.append({
            'id': str(line.id),
            'order': line.order,
            'text': line.text,
            'section': line.section,
            'chords': transposed_chords,
        })
    return result
