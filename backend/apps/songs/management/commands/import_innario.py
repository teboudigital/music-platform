import re
import struct

import olefile
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.groups.models import MusicGroup
from apps.songs.models import LyricLine, Song

User = get_user_model()

# Topic headers reali trovati nel file Indice per argomento.doc
KNOWN_TOPICS = {
    'ADORAZIONE', 'BAMBINI', 'BATTAGLIA', 'CONSACRAZIONE', 'GUARIGIONE',
    'INCORAGGIAMENTO', 'LODE', 'NELLA TUA PRESENZA', 'OFFERTA',
    'PROCLAMAZIONE', 'REDENZIONE E S.SANTO', 'REGNO DI DIO',
    'RINGRAZIAMENTO', 'SANTA CENA', 'SPIRITO SANTO IL TUO FUOCO BRUCIA IN',
    'TESTIMONIANZA E FEDE', 'UNITA\'', 'VISIONE E PROFEZIA', 'VITTORIA',
}
TOPIC_LABELS = {
    'SPIRITO SANTO IL TUO FUOCO BRUCIA IN': 'Spirito Santo',
    "UNITA'": 'Unità',
    'REDENZIONE E S.SANTO': 'Redenzione e Spirito Santo',
    'VISIONE E PROFEZIA': 'Visione e Profezia',
    'TESTIMONIANZA E FEDE': 'Testimonianza e Fede',
    'NELLA TUA PRESENZA': 'Nella Tua Presenza',
    'REGNO DI DIO': 'Regno di Dio',
    'SANTA CENA': 'Santa Cena',
}


def read_doc(path):
    ole = olefile.OleFileIO(path)
    stream = ole.openstream('WordDocument').read()
    fc_min = struct.unpack_from('<I', stream, 0x18)[0]
    ccp_text = struct.unpack_from('<I', stream, 0x4C)[0]
    raw = stream[fc_min:fc_min + ccp_text]
    text = raw.decode('cp1252', errors='replace')
    text = text.replace('\r', '\n').replace('\x0c', '\n')
    text = re.sub(r'[\x00-\x08\x0b\x0e-\x1f\x7f]', '', text)
    ole.close()
    return text


def parse_titles(text):
    """Restituisce dict {numero: titolo_esatto} dall'indice per titolo."""
    num_to_title = {}
    for line in text.splitlines():
        ls = line.strip()
        m = re.search(r'^(.+?)\s+(\d+)\s*$', ls)
        if m:
            title = m.group(1).strip()
            num = int(m.group(2))
            if len(title) > 2 and num <= 504:
                num_to_title[num] = title.title()
    return num_to_title


def parse_topics(text):
    """Restituisce dict {numero: [topic, ...]} dall'indice per argomento."""
    num_to_topics = {}
    current_topic = None

    for line in text.splitlines():
        ls = line.strip()
        if not ls:
            continue

        # Controlla se è un topic header conosciuto
        ls_upper = ls.upper().strip()
        if ls_upper in KNOWN_TOPICS:
            current_topic = TOPIC_LABELS.get(ls_upper, ls_upper.title())
            continue

        # Riga con numero finale = canto
        if current_topic:
            m = re.search(r'\b(\d+)\s*$', ls)
            if m:
                num = int(m.group(1))
                if 1 <= num <= 504:
                    if num not in num_to_topics:
                        num_to_topics[num] = []
                    if current_topic not in num_to_topics[num]:
                        num_to_topics[num].append(current_topic)

    return num_to_topics


def parse_songs(text):
    normalized = re.sub(r'\xa0', ' ', text)
    normalized = re.sub(r'\n[ \t]*(\d+)[ \t]*\n', r'\n__SONG_\1__\n', normalized)
    normalized = re.sub(r'\n\n(\d+)([A-Za-zÀ-ü"])', r'\n__SONG_\1__\n\2', normalized)
    normalized = re.sub(
        r'(?<![_\d])(\d+)\n([A-ZÀ-Ü"])',
        lambda m: '\n__SONG_' + m.group(1) + '__\n' + m.group(2),
        normalized,
    )
    normalized = re.sub(r'^[ \t]*(\d+)[ \t]*\n', r'__SONG_\1__\n', normalized)

    parts = re.split(r'__SONG_(\d+)__\n', normalized)
    songs = []
    seen = set()
    i = 1
    while i < len(parts) - 1:
        number = int(parts[i])
        body = parts[i + 1].strip()
        if body and number not in seen and 1 <= number <= 504:
            songs.append((number, body))
            seen.add(number)
        i += 2
    return songs


def split_sections(body):
    sections = []
    current = []
    for line in body.splitlines():
        if line.strip() == '':
            if current:
                sections.append(current)
                current = []
        else:
            current.append(line.rstrip())
    if current:
        sections.append(current)
    return sections


class Command(BaseCommand):
    help = 'Importa i canti da backend/data/innario/ nel gruppo specificato'

    def add_arguments(self, parser):
        parser.add_argument('--group', required=True)
        parser.add_argument('--user', required=True)
        parser.add_argument('--file', default='data/innario/Testi dei cantici.doc')
        parser.add_argument('--title-index', default='data/innario/Indice per titolo.doc')
        parser.add_argument('--topic-index', default='data/innario/Indice per argomento.doc')
        parser.add_argument('--clear', action='store_true')

    def handle(self, *args, **options):
        try:
            group = MusicGroup.objects.get(name=options['group'])
        except MusicGroup.DoesNotExist:
            raise CommandError(f"Gruppo '{options['group']}' non trovato.")

        try:
            owner = User.objects.get(email=options['user'])
        except User.DoesNotExist:
            raise CommandError(f"Utente '{options['user']}' non trovato.")

        self.stdout.write("Lettura indice titoli...")
        num_to_title = parse_titles(read_doc(options['title_index']))
        self.stdout.write(f"  {len(num_to_title)} titoli trovati")

        self.stdout.write("Lettura indice argomenti...")
        num_to_topics = parse_topics(read_doc(options['topic_index']))
        self.stdout.write(f"  {len(num_to_topics)} canti con argomento")

        self.stdout.write(f"Lettura testi: {options['file']}")
        songs_data = parse_songs(read_doc(options['file']))
        self.stdout.write(f"  {len(songs_data)} canti trovati")

        if options['clear']:
            deleted, _ = Song.objects.filter(group=group).delete()
            self.stdout.write(self.style.WARNING(f"Eliminati {deleted} canti esistenti."))

        created = skipped = 0

        with transaction.atomic():
            for number, body in songs_data:
                sections = split_sections(body)
                if not sections:
                    skipped += 1
                    continue

                # Titolo: dall'indice se disponibile, altrimenti prima riga del testo
                raw_title = sections[0][0].strip()
                title = num_to_title.get(number, raw_title.title()) if num_to_title.get(number) else raw_title.title()

                if not title:
                    skipped += 1
                    continue

                topics = num_to_topics.get(number, [])

                song = Song.objects.create(
                    title=title,
                    owner=owner,
                    group=group,
                    song_number=number,
                    notes=f"Canto {number}",
                    topics=topics,
                )

                order = 1
                for sec_idx, lines in enumerate(sections):
                    start = 1 if sec_idx == 0 else 0
                    section_label = f"Strofa {sec_idx + 1}"
                    for line in lines[start:]:
                        if line.strip():
                            LyricLine.objects.create(
                                song=song, order=order,
                                text=line, section=section_label,
                            )
                            order += 1

                created += 1

        self.stdout.write(self.style.SUCCESS(
            f"Import completato: {created} canti creati, {skipped} saltati."
        ))
