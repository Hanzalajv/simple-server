import { useState } from 'react';

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const classify = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', fontFamily: 'Inter, sans-serif', background: '#0A1628', color: '#F8F7F4', padding: 40, borderRadius: 8 }}>
      <h1>Support Message Classifier</h1>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste a support message..."
        rows={4}
        style={{ width: '100%', padding: 12, background: '#112240', color: '#F8F7F4', border: '1px solid #2A3040', borderRadius: 4, fontSize: 14 }}
      />
      <button
        onClick={classify}
        disabled={loading || !text}
        style={{ marginTop: 12, padding: '12px 24px', background: '#C4A962', color: '#0A1628', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}
      >
        {loading ? 'Classifying...' : 'Classify'}
      </button>

      {result && (
        <div style={{ marginTop: 24, padding: 20, background: '#112240', borderRadius: 8 }}>
          {result.error ? (
            <p style={{ color: '#f44336' }}>{result.error}</p>
          ) : (
            <>
              <p><strong>Category:</strong> {result.category}</p>
              <p><strong>Urgency:</strong> {result.urgency}</p>
              <p><strong>Confidence:</strong> {result.confidence}</p>
              <p><strong>Reason:</strong> {result.reason}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;