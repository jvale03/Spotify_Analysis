// Função para renderizar os dados como uma grelha
function renderSpotifyInfoGrid(data, container) {
    // Limpar o conteúdo anterior
    container.innerHTML = '';

    // Criar tabela estilizada
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.margin = '20px 0';
    table.style.fontSize = '1.2em';
    table.style.textAlign = 'left';

    // Adicionar cabeçalho
    const headerRow = document.createElement('tr');
    headerRow.style.backgroundColor = '#f4f4f4';
    headerRow.style.borderBottom = '2px solid #ddd';

    const headers = ['Metric', 'Value'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '12px 15px';
        th.style.border = '1px solid #ddd';
        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    // Adicionar linhas de dados
    Object.keys(data).forEach(key => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #ddd';

        const metricCell = document.createElement('td');
        metricCell.textContent = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        metricCell.style.padding = '12px 15px';
        metricCell.style.border = '1px solid #ddd';

        const valueCell = document.createElement('td');
        valueCell.textContent = data[key];
        valueCell.style.padding = '12px 15px';
        valueCell.style.border = '1px solid #ddd';

        row.appendChild(metricCell);
        row.appendChild(valueCell);

        table.appendChild(row);
    });

    // Adicionar tabela ao container
    container.appendChild(table);
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('spotify-info');

    if (!container) {
        console.error('Elemento com ID "spotify-info" não encontrado.');
        return;
    }

    // Exemplo de como buscar o JSON de um arquivo ou API (no caso de uma API externa)
    fetch('spotify_data.json')  // Substitua pelo URL do seu JSON ou caminho do arquivo
        .then(response => response.json())  // Converte a resposta em JSON
        .then(data => {
            // Chama a função para renderizar os dados
            renderSpotifyInfoGrid(data, container);
        })
        .catch(error => {
            console.error('Erro ao carregar o JSON:', error);
        });
});

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('spotify-info');

    if (!container) {
        console.error('Elemento com ID "spotify-info" não encontrado.');
        return;
    }

    // Buscar o JSON automaticamente (substitua o caminho pela URL ou caminho correto do seu JSON)
    fetch('data.json')  // Aqui substituís 'spotify_data.json' pelo caminho do teu arquivo JSON
        .then(response => response.json())  // Converte a resposta para JSON
        .then(data => {
            renderSpotifyInfoGrid(data, container);  // Passa os dados para a função de renderização
        })
        .catch(error => {
            console.error('Erro ao carregar os dados:', error);  // Erro no carregamento
        });
});