function getMostRecent5AMEST() {
  const now = new Date();
  const nyStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const nyDate = new Date(nyStr);
  
  const ny5AM = new Date(nyStr);
  ny5AM.setHours(5, 0, 0, 0);
  
  if (nyDate.getTime() < ny5AM.getTime()) {
    ny5AM.setDate(ny5AM.getDate() - 1);
  }
  
  const offset = nyDate.getTime() - now.getTime();
  const trueUTC5AM = ny5AM.getTime() - offset;
  
  return trueUTC5AM;
}

const t = getMostRecent5AMEST();
console.log("Most recent 5 AM NY UTC:", new Date(t).toISOString());
console.log("Current UTC:", new Date().toISOString());
