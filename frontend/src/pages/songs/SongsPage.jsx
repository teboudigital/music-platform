import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSongs, deleteSong, getKnownTopics } from '../../api/songs';
import { getGroup } from '../../api/groups';
import AppSidebar from '../../components/AppSidebar';

const KEYS = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'];

export default function SongsPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const selectedGroup = searchParams.get('group');

  const [songs, setSongs]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [key, setKey]             = useState('');
  const [mode, setMode]           = useState('');
  const [ordering, setOrdering]   = useState('song_number');
  const [topic, setTopic]         = useState('');
  const [topics, setTopics]       = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [selected, setSelected]   = useState(new Set());
  const [deleting, setDeleting]   = useState(false);
  const searchTimer = useRef(null);

  const loadSongs = async (s = search, k = key, m = mode, o = ordering, tp = topic) => {
    setLoading(true);
    setSelected(new Set());
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
    setGroupInfo(null);
    if (selectedGroup) {
      getGroup(selectedGroup).then((r) => setGroupInfo(r.data)).catch(() => {});
    }
    getKnownTopics().then((r) => setTopics(r.data)).catch(() => setTopics([]));
    setTopic('');
    loadSongs(search, key, mode, ordering, '');
  }, [selectedGroup]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadSongs(val, key, mode, ordering, topic), 400);
  };
  const handleKey      = (e) => { setKey(e.target.value); loadSongs(search, e.target.value, mode, ordering); };
  const handleOrdering = (o) => { setOrdering(o); loadSongs(search, key, mode, o, topic); };
  const handleTopic    = (e) => { setTopic(e.target.value); loadSongs(search, key, mode, ordering, e.target.value); };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    await deleteSong(id);
    loadSongs();
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(selected.size === songs.length ? new Set() : new Set(songs.map((s) => s.id)));
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(t('songs.confirmBulkDelete', { count: selected.size }))) return;
    setDeleting(true);
    try {
      await Promise.all([...selected].map((id) => deleteSong(id)));
      loadSongs();
    } finally {
      setDeleting(false);
    }
  };

  const allSelected  = songs.length > 0 && selected.size === songs.length;
  const someSelected = selected.size > 0;

  const panelTitle = selectedGroup
    ? (groupInfo?.name || '...')
    : t('sidebar.mySongs');

  return (
    <div className="app-two-panel">
      <AppSidebar />

      <div className="content-panel">
        {/* Intestazione */}
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
        <div className="filters-bar">
          <input
            className="filters-search"
            value={search}
            onChange={handleSearch}
            placeholder={t('songs.search')}
          />
          <select className="filters-select" value={key} onChange={handleKey}>
            <option value="">{t('songs.allKeys')}</option>
            {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <select className="filters-select" value={topic} onChange={handleTopic}>
            <option value="">{t('songs.allTopics')}</option>
            {topics.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
          </select>
        </div>

        {/* Ordinamento */}
        <div className="sort-bar">
          <span className="sort-label">{t('songs.sortBy')}:</span>
          <button className={`sort-btn${ordering === 'song_number' ? ' active' : ''}`}
            onClick={() => handleOrdering('song_number')}>
            # {t('songs.number')}
          </button>
          <button className={`sort-btn${ordering === 'title' ? ' active' : ''}`}
            onClick={() => handleOrdering('title')}>
            A–Z {t('songs.title')}
          </button>
        </div>

        {/* Barra azioni bulk — separata e indipendente */}
        {someSelected && (
          <div className="bulk-action-bar">
            <span className="bulk-count">
              {t('songs.selectedCount', { count: selected.size })}
            </span>
            <div className="bulk-action-btns">
              <button className="btn-bulk-delete" onClick={handleBulkDelete} disabled={deleting}>
                {deleting ? t('common.loading') : t('songs.deleteSelected')}
              </button>
              <button className="btn-sm" onClick={() => setSelected(new Set())}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

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
                  <th className="col-check">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      title="Seleziona tutti"
                    />
                  </th>
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
                  const isChecked = selected.has(song.id);
                  return (
                    <tr key={song.id} className={isChecked ? 'row-selected' : ''}>
                      <td className="col-check">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(song.id)}
                        />
                      </td>
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
