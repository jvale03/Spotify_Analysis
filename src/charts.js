

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Fetch data from JSON file
        const response = await fetch("./data.json");
        if (!response.ok) throw new Error('Erro ao carregar o JSON');
        const data = await response.json();
        console.log("Dados carregados: ", data);

        // Verificar se os dados possuem as chaves esperadas
        if (!data.total_tracks || !data.total_minutes || !data.top_artists || !data.top_tracks) {
            throw new Error("Estrutura de dados inválida");
        }

        const text_color = "#e9e8e8";

        // Atualizar o texto do resumo
        const summaryText = `You listened to ${data.total_different_tracks} different songs, a total of ${data.total_minutes} minutes!`;
        const summaryTextElement = document.getElementById("summary-text");
        if (summaryTextElement) {
            summaryTextElement.textContent = summaryText;
        }

        const artists = Object.keys(data.top_artists);
        const artistCounts = Object.values(data.top_artists);
        const tracks = Object.keys(data.top_tracks);
        const trackCounts = Object.values(data.top_tracks);

        // Função para sanitizar os nomes dos arquivos
        function sanitize_name(name) {
            return name
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, "_")
                .replace(/[^\w\-]/g, "");
        }

        // Carregar imagens dos artistas
        const artistImages = await Promise.all(artists.map(async (artist) => {
            const imagePath = `./Images/${artist}.jpeg`;
            const image = new Image();
            image.src = imagePath;

            return new Promise((resolve) => {
                image.onload = () => resolve({ artist, image });
                image.onerror = () => resolve({ artist, image: null });
            });
        }));

        console.log("Imagens dos artistas processadas:", artistImages);

        // Criar gráfico dos artistas
        const artistChartElement = document.getElementById("topArtistsChart");
        
        if (artistChartElement) {
            new Chart(artistChartElement, {
                type: "bar",
                data: {
                    labels: artists,
                    datasets: [{
                        label: "Nr of plays",
                        data: artistCounts,
                        backgroundColor: artistCounts.map(() => `rgba(30, 215, 96, 0.5)`),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { ticks: { display: false } },
                        y: {
                            display: true,
                            ticks: {
                                color: text_color,
                                callback: function(value) {
                                    return value;
                                }
                            },
                            grid: {
                                drawBorder: false,
                                drawOnChartArea: false
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: "10 Most listened artists",
                            color: text_color,
                            font: { size: 16, weight: 'bold' },
                            family: "'Metropolis Semi', Arial, sans-serif"
                        }
                    },
                    layout: { padding: { top: 10, right: 10, bottom: 80 } }
                },
                plugins: [{
                    id: "customXAxisImages",
                    afterDraw(chart) {
                        const ctx = chart.ctx;
                        const xAxis = chart.scales.x;
                        const yAxisBottom = chart.scales.y.bottom;

                        const tickWidth = xAxis.width / xAxis.ticks.length;
                        const dynamicImageSize = Math.min(tickWidth * 0.75, 50);

                        xAxis.ticks.forEach((tick, index) => {
                            const label = artists[index];
                            const artistData = artistImages[index];
                            const xPos = xAxis.getPixelForTick(index);
                            const yPos = yAxisBottom + 10;

                            if (artistData.image) {
                                // Desenhar imagem
                                ctx.drawImage(
                                    artistData.image,
                                    xPos - dynamicImageSize / 2,
                                    yPos,
                                    dynamicImageSize,
                                    dynamicImageSize
                                );
                            } else {
                                // Exibir nome do artista
                                ctx.font = "12px Arial";
                                ctx.fillStyle = text_color;
                                ctx.textAlign = "center";
                                ctx.fillText(
                                    label,
                                    xPos,
                                    yPos + dynamicImageSize / 2
                                );
                            }
                        });
                    }
                }]
            });
        }

        // Criar gráfico das músicas
        const trackChartElement = document.getElementById("topTracksChart");
        if (trackChartElement) {
            new Chart(trackChartElement, {
                type: "bar",
                data: {
                    labels: tracks,
                    datasets: [{
                        label: "Nr of plays",
                        data: trackCounts,
                        backgroundColor: artistCounts.map(() => `rgba(30, 215, 96, 0.5)`),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: {
                                color: text_color,
                                font: { size: 12 },
                                callback: function(value, index) {
                                    var label = tracks[index];
                                    return label.length > 8 ? label.substring(0, 8) + '...' : label;
                                }
                            },
                            grid: {
                                drawBorder: false,
                                drawOnChartArea: false
                            },
                            position: "bottom"
                        },
                        y: {
                            ticks: {
                                color: text_color,
                                callback: function(value) {
                                    return trackCounts.includes(value) ? value : '';
                                }
                            },
                            grid: {
                                drawBorder: false,
                                drawOnChartArea: false
                            },
                            position: "bottom"
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: "10 Most listened tracks",
                            color: text_color,
                            font: { size: 16, weight: 'bold' }
                        }
                    }
                }
            });
        }

    } catch (error) {
        console.error("Erro ao carregar os dados JSON:", error);
    }
});
