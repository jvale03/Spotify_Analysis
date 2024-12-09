// Função para criar elementos de texto
function createTextElement(textContent) {
    const p = document.createElement('p');
    p.textContent = textContent;
    p.classList.add('info-text');
    return p;
}

// Função principal para renderizar as informações do Spotify
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

    // Cria e adiciona os elementos de texto
    const listenedTracks = createTextElement(`- ${data.total_different_tracks} different songs listened.`);
    const totalListenedTracks = createTextElement(`- ${data.total_tracks} songs listened to in total.`);
    const artistsNumber = createTextElement(`- ${data.total_artists} artists heard.`);
    
    const [bestMonthKey, bestMonthValue] = Object.entries(data.top_month)[0];
    const bestMonth = createTextElement(`- Most listened month: ${bestMonthKey}, ${bestMonthValue * 3} minutes.`);

    const [bestDayKey, bestDayValue] = Object.entries(data.top_day)[0];
    const bestDay = createTextElement(`- Most listened day: ${bestDayKey}, ${bestDayValue * 3} minutes.`);

    // Adiciona todos os elementos à caixa
    infoBox.append(
        artistsNumber,
        listenedTracks,
        totalListenedTracks,
        bestMonth,
        bestDay
    );

    // Adiciona a caixa ao container
    container.appendChild(infoBox);
}

// Função para buscar e processar os dados
function fetchSpotifyData() {
    const container = document.getElementById('spotify-info');

    if (!container) {
        console.error('Elemento com ID "spotify-info" não encontrado.');
        return;
    }

    // Exemplo de como buscar o JSON de um arquivo ou API
    fetch('data.json')  // Substitua pelo URL do seu JSON ou caminho do arquivo
        .then(response => response.json())  // Converte a resposta em JSON
        .then(data => {
            renderSpotifyInfo(data, container);  // Chama a função para renderizar os dados
        })
        .catch(error => {
            console.error('Erro ao carregar o JSON:', error);
        });
}

// Executa a função quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', fetchSpotifyData);
