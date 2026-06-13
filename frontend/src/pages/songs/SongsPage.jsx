import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSongs, deleteSong, getTopics } from '../../api/songs';
import { getGroup } from '../../api/groups';
import AppSidebar from '../../components/AppSidebar';

const KEYS = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'];

export default function SongsPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const selectedGroup = searchParams.get('group');

  const [songs, setSongs]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [key, setKey]           = useState('');
  const [mode, setMode]         = useState('');
  const [ordering, setOrdering] = useState('song_number');
  const [topic, setTopic]       = useState('');
  const [topics, setTopics]     = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);

  const loadSongs = async (s = search, k = key, m = mode, o = ordering, tp = topic) => {
    setLoading(true);
    const params = { page_size: 1000, ordering: o };
    if (s) params.search = s;
    if (k) params.key = k;
    if (m) params.mode = m;
    if (tp) params.topic = tp;
    if (selectedGroup) params.group = selectedGroup;
    try {
      const res = await getSongs(params);
      setSongs(res.data.results || res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGroup) {
      setGroupInfo(null);
      getGroup(selectedGroup).then((r) => setGroupInfo(r.data)).catch(() => {});
      getTopics({ group: selectedGroup }).then((r) => setTopics(r.data)).catch(() => {});
    } else {
      setGroupInfo(null);
      setTopics([]);
    }
    setTopic('');
    loadSongs(search, key, mode, ordering, '');
  }, [selectedGroup]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    loadSongs();
  };

  const handleKey = (e) => {
    setKey(e.target.value);
    loadSongs(search, e.target.value, mode, ordering);
  };

  const handleMode = (e) => {
    setMode(e.target.value);
    loadSongs(search, key, e.target.value, ordering);
  };

  const handleOrdering = (o) => {
    setOrdering(o);
    loadSongs(search, key, mode, o, topic);
  };

  const handleTopic = (e) => {
    setTopic(e.target.value);
    loadSongs(search, key, mode, ordering, e.target.value);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    await deleteSong(id);
    loadSongs();
  };

  const panelTitle = selectedGroup
    ? (groupInfo?.name || '...')
    : t('sidebar.mySongs');

  return (
    <div className="app-two-panel">
      <AppSidebar />

      <div className="content-panel">
        {/* Intestazione pannello */}
        <div className="content-panel-header">
          <h2 className="content-panel-title">{panelTitle}</h2>
          {selectedGroup && groupInfo && (
            <div className="content-panel-meta">
              <span className={`role-badge role-${groupInfo.my_role}`}>
                {t(`groups.${groupInfo.my_role}`)}
              </span>
              <span className="text-muted">{groupInfo.member_count} {t('groups.members')}</span>
              <Link to={`/groups/${selectedGroup}`} className="btn-sm">
                {t('songs.manageGroup')}
              </Link>
            </div>
          )}
          {!selectedGroup && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link to="/songs/new" className="btn-primary">{t('songs.newSong')}</Link>
              <Link to="/songs/import" className="btn-sm">{t('songs.importSongs')}</Link>
            </div>
          )}
          {selectedGroup && (
            <Link to={`/songs/import?group=${selectedGroup}`} className="btn-sm">
              {t('songs.importSongs')}
            </Link>
          )}
        </div>

        {/* Barra filtri */}
        <form className="filters-bar" onSubmit={handleSearch}>
          <input
            className="filters-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('songs.search')}
          />
          <select className="filters-select" value={key} onChange={handleKey}>
            <option value="">{t('songs.allKeys')}</option>
            {KEYS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <select className="filters-select" value={mode} onChange={handleMode}>
            <option value="">{t('songs.allModes')}</option>
            <option value="major">{t('songs.major')}</option>
            <option value="minor">{t('songs.minor')}</option>
          </select>
          {topics.length > 0 && (
            <select className="filters-select" value={topic} onChange={handleTopic}>
              <option value="">{t('songs.allTopics')}</option>
              {topics.map((tp) => (
                <option key={tp} value={tp}>{tp}</option>
              ))}
            </select>
          )}
          <button type="submit" className="filters-search-btn" aria-label="Cerca">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        {/* Ordinamento */}
        <div className="sort-bar">
          <span className="sort-label">{t('songs.sortBy')}:</span>
          <button
            className={`sort-btn${ordering === 'song_number' ? ' active' : ''}`}
            onClick={() => handleOrdering('song_number')}
          ># {t('songs.number')}</button>
          <button
            className={`sort-btn${ordering === 'title' ? ' active' : ''}`}
            onClick={() => handleOrdering('title')}
          >A–Z {t('songs.title')}</button>
        </div>

        {/* Tabella canti */}
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : songs.length === 0 ? (
          <p className="empty">{t('songs.noSongs')}</p>
        ) : (
          <div className="songs-table-wrap">
            <table className="songs-table">
              <thead>
                <tr>
                  <th className="col-num">#</th>
                  <th className="col-title">{t('songs.title')}</th>
                  <th className="col-key">{t('songs.key')}</th>
                  <th className="col-artist">{t('songs.artist')}</th>
                  <th className="col-actions"></th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song) => {
                  const num = song.song_number ?? '—';
                  const keyLabel = song.key
                    ? `${song.key} ${song.mode === 'major' ? t('songs.major') : t('songs.minor')}`
                    : '—';
                  return (
                    <tr key={song.id}>
                      <td className="col-num">{num}</td>
                      <td className="col-title">
                        <Link to={`/songs/${song.id}`}>{song.title}</Link>
                      </td>
                      <td className="col-key">{keyLabel}</td>
                      <td className="col-artist">{song.artist || '—'}</td>
                      <td className="col-actions">
                        <Link to={`/songs/${song.id}`} className="btn-sm">{t('songs.details')}</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
