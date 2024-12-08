function renderSpotifyInfo(data, container) {
    // Limpa o conteúdo do container
    container.innerHTML = '';

    // Cria o elemento principal da caixa
    const infoBox = document.createElement('div');
    infoBox.classList.add('info-box');

    // Adiciona o logo
    const logo = document.createElement('img');
    logo.src = 'Images/Logo.png'; // Caminho da imagem do logo
    logo.alt = 'Spotify Logo';
    logo.classList.add('spotify-logo');
    infoBox.appendChild(logo);

    // Cria os elementos de texto
    const listenedTracks = document.createElement('p');
    listenedTracks.textContent = `- ${data.total_different_tracks} different songs listened.`;
    listenedTracks.classList.add('info-text');

    const totalListenedTracks = document.createElement('p');
    totalListenedTracks.textContent = `- ${data.total_tracks} songs listened to in total.`;
    totalListenedTracks.classList.add('info-text');

    const artistsNumber = document.createElement('p');
    artistsNumber.textContent = `- ${data.total_artists} artists heard.`;
    artistsNumber.classList.add('info-text');

    const bestMonth = document.createElement('p');
    const [key_month, value_month] = Object.entries(data.top_month)[0];
    bestMonth.textContent = `- Most listened month: ${key_month}, ${value_month} minutes.`;
    bestMonth.classList.add('info-text');

    const bestDay = document.createElement('p');
    const [key_day, value_day] = Object.entries(data.top_day)[0];
    bestDay.textContent = `- Most listened day: ${key_day}, ${value_day} minutes.`;
    bestDay.classList.add('info-text');

    // Adiciona os elementos à caixa
    infoBox.appendChild(artistsNumber);
    infoBox.appendChild(listenedTracks);
    infoBox.appendChild(totalListenedTracks);
    infoBox.appendChild(bestMonth);
    infoBox.appendChild(bestDay);

    // Adiciona a caixa ao container
    container.appendChild(infoBox);
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('spotify-info');

    if (!container) {
        console.error('Elemento com ID "spotify-info" não encontrado.');
        return;
    }

    // Exemplo de como buscar o JSON de um arquivo ou API (no caso de uma API externa)
    fetch('data.json')  // Substitua pelo URL do seu JSON ou caminho do arquivo
        .then(response => response.json())  // Converte a resposta em JSON
        .then(data => {
            // Chama a função para renderizar os dados
            renderSpotifyInfo(data, container);
        })
        .catch(error => {
            console.error('Erro ao carregar o JSON:', error);
        });
});