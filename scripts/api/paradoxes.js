function getDataUrl(filename) {
  const path = window.location.pathname;
  if (path.includes('/pages/')) {
    return `../data/${filename}`;
  }
  return `data/${filename}`;
}

export async function getParadoxes() {
  try {
    const res = await fetch(getDataUrl('paradoxes.json'));
    const data = await res.json();
    return data.paradoxes || [];
  } catch (err) {
    console.error('Error fetching paradoxes:', err);
    return [];
  }
}

export async function getParadoxById(id) {
  const paradoxes = await getParadoxes();
  return paradoxes.find(p => p.id === id) || null;
}

export async function getRelationships() {
  try {
    const res = await fetch(getDataUrl('relationships.json'));
    const data = await res.json();
    return data.relationships || [];
  } catch (err) {
    console.error('Error fetching relationships:', err);
    return [];
  }
}
