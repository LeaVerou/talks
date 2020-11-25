var talkId = location.pathname.match(/\/([^/]+)\/?$/)[1];

$$(".slides-link").forEach(a => {
	a.href = `https://projects.verou.me/talks/${talkId}`;
	a.innerHTML = `projects.verou.me/talks/<strong>${talkId}</strong>`;
});
