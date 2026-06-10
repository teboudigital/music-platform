import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSong } from '../../api/songs';

export default function SongDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSong(id).then((r) => { setSong(r.data); setLoading(false); });
  }, [id]);

  if (loading) return <p>{t('common.loading')}</p>;
  if (!song) return <p>{t('common.error')}</p>;

  const keyLabel = song.key
    ? `${song.key} ${song.mode === 'major' ? t('songs.major') : t('songs.minor')}`
    : '—';

  const lines = song.lyric_lines || [];

  return (
    <div className="page">
      {/* Intestazione */}
      <div className="song-detail-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← {t('common.back')}
        </button>
        <div className="song-detail-meta">
          {song.song_number && (
            <span className="song-detail-num">#{song.song_number}</span>
          )}
          <h2 className="song-detail-title">{song.title}</h2>
          <div className="song-detail-info">
            {song.artist && <span>{song.artist}</span>}
            <span className="song-detail-key">{keyLabel}</span>
          </div>
          {song.topics?.length > 0 && (
            <div className="song-detail-topics">
              {song.topics.map((tp) => (
                <span key={tp} className="topic-badge">{tp}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Testo */}
      {lines.length === 0 ? (
        <p className="empty">{t('songs.noLyrics')}</p>
      ) : (
        <div className="lyrics-simple">
          {lines.map((line, i) => {
            const prevSection = i > 0 ? lines[i - 1].section : null;
            const showSection = line.section && line.section !== prevSection;
            return (
              <div key={line.id}>
                {showSection && (
                  <p className="section-label">{line.section}</p>
                )}
                <p className="lyric-text">{line.text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
