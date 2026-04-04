const { supabase } = require('./_lib/supabase');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const limit = parseInt(req.query?.limit, 10) || 50;

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('getAlerts supabase error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch alerts' });
    }

    res.json({ alerts: data || [] });
  } catch (err) {
    console.error('getAlerts error:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};
