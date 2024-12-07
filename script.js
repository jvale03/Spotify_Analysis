document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Fetch data from JSON file
        const response = await fetch("./data.json");
        if (!response.ok) throw new Error('Erro ao carregar o JSON');
        const data = await response.json();
        console.log("Dados carregados: ", data); // Verificar se os dados são carregados corretamente

        // Verificar se os dados possuem as chaves esperadas
        if (!data.total_tracks || !data.total_minutes || !data.top_artists || !data.top_tracks) {
            throw new Error("Estrutura de dados inválida");
        }

        // Atualizar o texto do resumo
        document.getElementById("summary-text").textContent = `${data.total_tracks} músicas ouvidas, aproximadamente ${data.total_minutes} minutos!`;

        const artists = Object.keys(data.top_artists);
        const artistCounts = Object.values(data.top_artists);
        const tracks = Object.keys(data.top_tracks);
        const trackCounts = Object.values(data.top_tracks);

        function sanitize_name(name) {
            return name
                .normalize("NFD") // Remove acentos
                .replace(/[\u0300-\u036f]/g, "") // Remove marcas de diacríticos
                .replace(/\s+/g, "_") // Substitui espaços por underscores
                .replace(/[^\w\-]/g, ""); // Remove caracteres especiais
        }

        // Carregar imagens dos artistas e armazená-las em cache
        const artistImages = await Promise.all(artists.map(async (artist) => {
            const imagePath = `./Images/${artist}.jpeg`;
            const image = new Image();
            image.src = imagePath;
            await new Promise(resolve => image.onload = resolve);  // Aguardar o carregamento da imagem
            return { artist, image };
        }));

        console.log("Imagens dos artistas carregadas:", artistImages);

        // Criar gráfico dos artistas com imagens no eixo x
        const artistChart = new Chart(document.getElementById("topArtistsChart"), {
            type: "bar",
            data: {
                labels: artists,
                datasets: [{
                    label: "Nr de músicas ouvidas",
                    data: artistCounts,
                    backgroundColor: "Black",
                    borderColor: "#1DB954",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: { display: false }, // Ocultar labels padrão do eixo x
                    },
                    y: {
                        display: true,
                        ticks: {
                            color: "Black", // Garante que os rótulos sejam visíveis
                            callback: function(value) {
                                return value; // Exibe todos os valores
                            }
                        },
                        grid: {
                            drawBorder: true,
                            drawOnChartArea: true, // Exibe linhas da grade
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: "10 Artistas Mais Ouvidos", color: "Black", font: {
                        size: 16, 
                        weight: 'bold'
                    }}
                },
                layout: {
                    padding: {
                        top: 10,
                        right: 10,
                        bottom: 80 // Ajustar para dar espaço às imagens ou texto
                    }
                }
            },
            plugins: [{
                id: "customXAxisImages",
                afterDraw(chart) {
                    const ctx = chart.ctx;
                    const xAxis = chart.scales.x;
                    const yAxisBottom = chart.scales.y.bottom;

                    const tickWidth = xAxis.width / xAxis.ticks.length; // Largura de cada tick
                    const dynamicImageSize = Math.min(tickWidth * 0.75, 50); // Ajustar dinamicamente, com limite máximo de 50px

                    xAxis.ticks.forEach((tick, index) => {
                        const label = artists[index];
                        const artistImage = artistImages[index].image;
                        const xPos = xAxis.getPixelForTick(index);
                        const yPos = yAxisBottom + 10; // Posição abaixo do eixo x
                        
                        ctx.drawImage(
                            artistImage,
                            xPos - dynamicImageSize / 2, // Centraliza a imagem no tick
                            yPos,
                            dynamicImageSize,
                            dynamicImageSize
                        );
                    });
                }
            }]
        });

        new Chart(document.getElementById("topTracksChart"), {
            type: "bar",
            data: {
                labels: tracks,  // labels já são os nomes das músicas
                datasets: [{
                    label: "Nr de vezes ouvida",
                    data: trackCounts,
                    backgroundColor: "Black",
                    borderColor: "#1DB954",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: {
                            color: "Black",
                            font: {
                                size: 12  // Ajuste do tamanho da fonte
                            },
                            callback: function(value, index) {
                                var label = tracks[index];
                                return label.length > 8 ? label.substring(0, 8) + '...' : label;
                            }
                        }
                    },
                    y: {
                        ticks: {
                            color: "Black",
                            callback: function(value, index, values) {
                                return trackCounts.includes(value) ? value : '';
                            }
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    title: { 
                        display: true, 
                        text: "10 Músicas Mais Ouvidas", 
                        color: "Black", 
                        font: {
                            size: 16, 
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Erro ao carregar os dados JSON:", error);
    }
});