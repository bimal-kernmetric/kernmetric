function getDataUrl(filename) {
  return `data/${filename}`;
}

export async function getResearch() {
  try {
    const res = await fetch(getDataUrl('research.json'));
    const data = await res.json();
    return data.research || [];
  } catch (err) {
    console.error('Error fetching research:', err);
    return [];
  }
}

export async function getResearchById(id) {
  const research = await getResearch();
  return research.find(r => r.id === id) || null;
}
