import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { importSongs, importFromApp, getAppFiles } from '../../api/songs';
import { getGroups } from '../../api/groups';

export default function SongImportPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const [source, setSource]     = useState(null);       // 'pc' | 'app'
  const [file, setFile]         = useState(null);        // File (da PC)
  const [appFiles, setAppFiles] = useState([]);          // lista file app
  const [appFile, setAppFile]   = useState(null);        // file selezionato dall'app
  const [groupId, setGroupId]   = useState(searchParams.get('group') || '');
  const [groups, setGroups]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    getGroups().then((r) => setGroups(r.data.results || r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (source === 'app') {
      getAppFiles().then((r) => setAppFiles(r.data)).catch(() => {});
    }
  }, [source]);

  const resetSource = (s) => {
    setSource(s);
    setFile(null);
    setAppFile(null);
    setResult(null);
  };

  const handleImport = async () => {
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (source === 'pc') {
        if (!file) { alert(t('songs.importNoFile')); setLoading(false); return; }
        res = await importSongs(file, groupId || null);
      } else {
        if (!appFile) { alert(t('songs.importNoFile')); setLoading(false); return; }
        res = await importFromApp(appFile, groupId || null);
      }
      setResult(res.data);
      if (res.data.imported > 0) {
        setFile(null);
        setAppFile(null);
        if (fileRef.current) fileRef.current.value = '';
      }
    } catch (err) {
      setResult(err.response?.data || { detail: t('common.error') });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${baseUrl}/songs/import-template/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { alert(t('common.error')); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'template_canti.xlsx';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { alert(t('common.error')); }
  };

  const canImport = source === 'pc' ? !!file : !!appFile;

  return (
    <div className="import-page">
      <div className="import-page-header">
        <Link to="/songs" className="btn-sm">← {t('common.back')}</Link>
        <h2>{t('songs.importTitle')}</h2>
      </div>

      {/* ── Step 1: scegli sorgente ── */}
      <div className="import-source-row">
        <button
          className={`import-source-btn${source === 'pc' ? ' active' : ''}`}
          onClick={() => resetSource('pc')}
        >
          💻 {t('songs.importFromPc')}
        </button>
        <button
          className={`import-source-btn${source === 'app' ? ' active' : ''}`}
          onClick={() => resetSource('app')}
        >
          📚 {t('songs.importFromApp')}
        </button>
      </div>

      {/* ── Step 2: pannello sorgente ── */}
      {source === 'pc' && (
        <div className="import-panel">
          <p className="import-panel-desc">{t('songs.importStep1Desc')}</p>
          <button className="btn-sm import-template-btn" onClick={handleDownload}>
            ⬇ {t('songs.importDownloadTemplate')}
          </button>

          <div
            className="import-file-area"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
          >
            {file
              ? <><span className="import-file-name">📄 {file.name}</span><span className="import-file-change">{t('songs.importChangeFile')}</span></>
              : <span className="import-file-placeholder">📂 {t('songs.importDropOrClick')}</span>
            }
            <input
              ref={fileRef} type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
          </div>
        </div>
      )}

      {source === 'app' && (
        <div className="import-panel">
          <p className="import-panel-desc">{t('songs.importFromAppDesc')}</p>
          {appFiles.length === 0
            ? <p className="import-no-files">{t('songs.importNoAppFiles')}</p>
            : (
              <ul className="import-app-files">
                {appFiles.map((f) => (
                  <li
                    key={f.key}
                    className={`import-app-file${appFile === f.key ? ' selected' : ''}`}
                    onClick={() => setAppFile(f.key)}
                  >
                    <span className="import-app-file-icon">📄</span>
                    <span className="import-app-file-name">{f.name}</span>
                    <span className="import-app-file-meta">{f.folder} · {f.size}</span>
                    {appFile === f.key && <span className="import-app-file-check">✓</span>}
                  </li>
                ))}
              </ul>
            )
          }
        </div>
      )}

      {/* ── Step 3: gruppo + import ── */}
      {source && (
        <div className="import-actions">
          <label className="import-group-label">
            {t('songs.importGroup')}
            <select
              className="filters-select"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <option value="">{t('songs.importPersonal')}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </label>

          <button
            className="btn-primary import-block-btn"
            onClick={handleImport}
            disabled={loading || !canImport}
          >
            {loading ? t('common.loading') : t('songs.importStart')}
          </button>
        </div>
      )}

      {/* ── Risultato ── */}
      {result && (
        <div className="import-result-box">
          {result.imported > 0 && (
            <div className="import-result-success">
              <span className="import-success-icon">✓</span>
              <div>
                <p className="import-success-title">{t('songs.importDone')}</p>
                <p className="import-success-sub">{t('songs.importSuccess', { count: result.imported })}</p>
                <Link to="/songs" className="import-success-link">
                  → {t('songs.importGoToList')}
                </Link>
              </div>
            </div>
          )}

          {result.duplicates?.length > 0 && (
            <div className="import-duplicate-box">
              <p className="import-duplicate-title">⚠ {t('songs.importDuplicateTitle')}</p>
              <p className="import-duplicate-desc">{t('songs.importDuplicateDesc')}</p>
              <ul className="import-duplicate-list">
                {result.duplicates.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          )}

          {result.errors?.length > 0 && (
            <div className="import-errors">
              <p>✗ {t('songs.importErrors', { count: result.errors.length })}</p>
              <ul>{result.errors.map((e, i) => (
                <li key={i}>{t('songs.importRowError', { row: e.row, error: e.error })}</li>
              ))}</ul>
            </div>
          )}

          {result.detail && !result.duplicates && <p className="error">{result.detail}</p>}
        </div>
      )}
    </div>
  );
}
