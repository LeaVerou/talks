var talkId = location.pathname.match(/\/([^/]+)\/?$/)[1];

$$(".slides-link").forEach(a => {
	a.href = `https://leaverou.github.io/talks/${talkId}`;
	a.innerHTML = `leaverou.github.io/talks/<strong>${talkId}</strong>`;
});
