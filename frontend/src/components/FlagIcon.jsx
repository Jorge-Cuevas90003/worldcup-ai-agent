// Maps team names to ISO 3166-1 alpha-2 codes for flagcdn.com
const TEAM_TO_ISO = {
  'Spain': 'es', 'England': 'gb-eng', 'France': 'fr', 'Argentina': 'ar',
  'Brazil': 'br', 'Germany': 'de', 'Portugal': 'pt', 'Netherlands': 'nl',
  'Belgium': 'be', 'Mexico': 'mx', 'Italy': 'it', 'USA': 'us',
  'Uruguay': 'uy', 'Colombia': 'co', 'Croatia': 'hr', 'Japan': 'jp',
  'South Korea': 'kr', 'Morocco': 'ma', 'Senegal': 'sn', 'Denmark': 'dk',
  'Switzerland': 'ch', 'Serbia': 'rs', 'Poland': 'pl', 'Canada': 'ca',
  'Ecuador': 'ec', 'Saudi Arabia': 'sa', 'Australia': 'au',
  'United States': 'us', 'Korea Republic': 'kr', 'New Zealand': 'nz',
  'Costa Rica': 'cr', 'Cameroon': 'cm', 'Ghana': 'gh', 'Nigeria': 'ng',
  'Tunisia': 'tn', 'Iran': 'ir', 'Qatar': 'qa', 'Wales': 'gb-wls',
  'Paraguay': 'py', 'Peru': 'pe', 'Chile': 'cl', 'Turkey': 'tr',
  'Austria': 'at', 'Czech Republic': 'cz', 'Sweden': 'se', 'Norway': 'no',
  'Scotland': 'gb-sct', 'Hungary': 'hu', 'Ukraine': 'ua', 'Egypt': 'eg',
  'Algeria': 'dz', 'Honduras': 'hn', 'Jamaica': 'jm', 'Panama': 'pa',
  'Bolivia': 'bo', 'Venezuela': 've', 'China': 'cn', 'India': 'in',
  'Albania': 'al', 'Republic of Ireland': 'ie', 'Ireland': 'ie',
  'Slovenia': 'si', 'Slovakia': 'sk', 'Romania': 'ro', 'Greece': 'gr',
  'Iceland': 'is', 'Finland': 'fi', 'Bosnia and Herzegovina': 'ba',
  'North Macedonia': 'mk', 'Montenegro': 'me', 'Georgia': 'ge',
  'Ivory Coast': 'ci', "Cote d'Ivoire": 'ci', 'DR Congo': 'cd',
  'South Africa': 'za', 'Mali': 'ml', 'Burkina Faso': 'bf',
  'Congo': 'cg', 'Zambia': 'zm', 'Tanzania': 'tz', 'Kenya': 'ke',
  'Indonesia': 'id', 'Thailand': 'th', 'Philippines': 'ph',
};

export default function FlagIcon({ team, size = 24, style = {} }) {
  const iso = TEAM_TO_ISO[team];
  if (!iso) {
    // Fallback: show first 2 letters
    return <span style={{ fontSize: size * 0.6, fontWeight: 700, opacity: 0.5, ...style }}>{(team || '??').substring(0, 2).toUpperCase()}</span>;
  }
  return (
    <img
      src={`https://flagcdn.com/${iso}.svg`}
      alt={team}
      width={size}
      height={Math.round(size * 0.75)}
      style={{ borderRadius: 2, objectFit: 'cover', display: 'inline-block', verticalAlign: 'middle', ...style }}
      loading="lazy"
    />
  );
}

// Helper: get flag URL for use in non-React contexts
export function getFlagUrl(team, width = 40) {
  const iso = TEAM_TO_ISO[team];
  return iso ? `https://flagcdn.com/${iso}.svg` : null;
}
