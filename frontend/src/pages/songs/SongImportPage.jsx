import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { downloadImportTemplate, importSongs } from '../../api/songs';
import { getGroups } from '../../api/groups';

export default function SongImportPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const [file, setFile]         = useState(null);
  const [groupId, setGroupId]   = useState(searchParams.get('group') || '');
  const [groups, setGroups]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    getGroups().then((r) => setGroups(r.data.results || r.data)).catch(() => {});
  }, []);

  const handleDownload = async () => {
    try {
      const res = await downloadImportTemplate();
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_canti.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert(t('common.error'));
    }
  };

  const handleImport = async () => {
    if (!file) { alert(t('songs.importNoFile')); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await importSongs(file, groupId || null);
      setResult(res.data);
      if (res.data.imported > 0) {
        setFile(null);
        if (fileRef.current) fileRef.current.value = '';
      }
    } catch (err) {
      setResult(err.response?.data || { detail: t('common.error') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-page">
      <div className="import-page-header">
        <Link to="/songs" className="btn-sm">← {t('common.back')}</Link>
        <h2>{t('songs.importTitle')}</h2>
      </div>

      <div className="import-two-blocks">

        {/* ── Blocco 1: Scarica ── */}
        <div className="import-block import-block-download">
          <div className="import-block-icon">📥</div>
          <h3>{t('songs.importStep1Title')}</h3>
          <p>{t('songs.importStep1Desc')}</p>
          <ul className="import-block-hints">
            <li>{t('songs.importHint1')}</li>
            <li>{t('songs.importHint2')}</li>
            <li>{t('songs.importHint3')}</li>
          </ul>
          <button className="btn-primary import-block-btn" onClick={handleDownload}>
            ⬇ {t('songs.importDownloadTemplate')}
          </button>
        </div>

        {/* ── Blocco 2: Carica ── */}
        <div className="import-block import-block-upload">
          <div className="import-block-icon">📤</div>
          <h3>{t('songs.importStep2Title')}</h3>
          <p>{t('songs.importStep2Desc')}</p>

          <div className="import-file-area"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
          >
            {file
              ? <><span className="import-file-name">📄 {file.name}</span><span className="import-file-change">{t('songs.importChangeFile')}</span></>
              : <><span className="import-file-placeholder">📂 {t('songs.importDropOrClick')}</span></>
            }
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
          </div>

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
            disabled={loading || !file}
          >
            {loading ? t('common.loading') : t('songs.importStart')}
          </button>

          {result && (
            <div className="import-result-box">
              {result.imported > 0 && (
                <p className="import-success">✓ {t('songs.importSuccess', { count: result.imported })}</p>
              )}
              {result.errors?.length > 0 && (
                <div className="import-errors">
                  <p>✗ {t('songs.importErrors', { count: result.errors.length })}</p>
                  <ul>{result.errors.map((e, i) => (
                    <li key={i}>{t('songs.importRowError', { row: e.row, error: e.error })}</li>
                  ))}</ul>
                </div>
              )}
              {result.detail && <p className="error">{result.detail}</p>}
              {result.imported > 0 && (
                <Link to="/songs" className="btn-sm" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                  → {t('nav.songs')}
                </Link>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
