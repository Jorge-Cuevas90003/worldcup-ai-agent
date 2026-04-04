const { fetchWinnerOdds } = require('./_lib/polymarket');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Get current odds
    const odds = await fetchWinnerOdds();

    // Sort by odds descending, take top 10
    const topTeams = odds.sort((a, b) => b.odds - a.odds).slice(0, 10);

    const AI_API_KEY = process.env.AI_API_KEY;
    const AI_API_URL = process.env.AI_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
    const AI_MODEL = process.env.AI_MODEL || 'llama-3.3-70b-versatile';

    if (!AI_API_KEY) {
      // Fallback: generate structured analysis without LLM
      const analysis = generateRuleBasedAnalysis(topTeams);
      return res.status(200).json({ source: 'rule-based', analysis });
    }

    // Build prompt for the LLM
    const prompt = `You are a World Cup 2026 betting analyst AI agent. Analyze these current Polymarket odds and provide insights.

Current Top 10 Teams by Odds:
${topTeams.map((t, i) => `${i + 1}. ${t.team}: ${(t.odds).toFixed(1)}% (Volume: $${t.volume ? Math.round(t.volume).toLocaleString() : 'N/A'})`).join('\n')}

Provide a brief JSON response with:
1. "summary": A 2-3 sentence market overview
2. "insights": Array of 3 key insights (each with "title" and "detail")
3. "topPick": Object with "team" and "reason" for your top value pick
4. "marketSentiment": "bullish", "bearish", or "neutral" overall sentiment

Respond ONLY with valid JSON, no markdown fences.`;

    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status, await response.text());
      const analysis = generateRuleBasedAnalysis(topTeams);
      return res.status(200).json({ source: 'rule-based-fallback', analysis, odds: topTeams, timestamp: new Date().toISOString() });
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || '';

    // Try to parse JSON from response
    let analysis;
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: aiText };
    } catch {
      analysis = { summary: aiText };
    }

    return res.status(200).json({
      source: 'ai',
      model: AI_MODEL,
      analysis,
      odds: topTeams,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('AI Analysis error:', err);
    return res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
};

function generateRuleBasedAnalysis(teams) {
  const leader = teams[0];
  const totalOdds = teams.reduce((sum, t) => sum + t.odds, 0);

  return {
    summary: `${leader.team} leads the World Cup 2026 odds at ${leader.odds.toFixed(1)}%. The top 10 teams account for ${totalOdds.toFixed(1)}% of the market.`,
    insights: [
      {
        title: 'Market Leader',
        detail: `${leader.team} is the clear favorite with ${leader.odds.toFixed(1)}% probability.`,
      },
      {
        title: 'Market Concentration',
        detail: `Top 3 teams hold ${teams.slice(0, 3).reduce((s, t) => s + t.odds, 0).toFixed(1)}% of total odds.`,
      },
      {
        title: 'Value Opportunities',
        detail: `Teams ranked 4-10 may offer value bets with combined ${teams.slice(3, 10).reduce((s, t) => s + t.odds, 0).toFixed(1)}% probability.`,
      },
    ],
    topPick: {
      team: teams[2]?.team || teams[1]?.team,
      reason: 'Third-favorite often offers best risk/reward ratio in tournament betting.',
    },
    marketSentiment: leader.odds > 20 ? 'concentrated' : 'distributed',
  };
}
