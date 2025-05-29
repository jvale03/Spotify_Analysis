document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Fetch data from JSON file
        const response = await fetch("./data.json");
        if (!response.ok) throw new Error("Erro ao carregar o JSON");
        const data = await response.json();
        console.log("Dados carregados: ", data);

        // Verificar se os dados possuem as chaves esperadas
        if (!data.total_tracks || !data.total_minutes || !data.top_artists || !data.top_tracks) {
            throw new Error("Estrutura de dados inválida");
        }

        const text_color = "#e9e8e8";

        // Atualizar o texto do resumo
        const summary_text = `You listened to ${data.total_different_tracks} different songs, a total of ${data.total_minutes} minutes!`;
        const summary_text_element = document.getElementById("summary-text");
        if (summary_text_element) {
            summary_text_element.textContent = summary_text;
        }

        const artists = Object.keys(data.top_artists);
        const artist_counts = Object.values(data.top_artists);
        const tracks = Object.keys(data.top_tracks);
        const track_counts = Object.values(data.top_tracks);

        // Sort tracks and counts together based on counts
        const sorted = track_counts
            .map((count, index) => ({ count, track: tracks[index] }))
            .sort((a, b) => b.count - a.count);
        
        const sorted_tracks = sorted.map(item => item.track);
        const sorted_track_counts = sorted.map(item => item.count);

        const hours = Object.keys(data.hour_dist);
        const hours_percentage = Object.values(data.hour_dist);



        // Função para sanitizar os nomes dos arquivos
        function sanitize_name(name) {
            return name
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, "_")
                .replace(/[^\w\-]/g, "");
        }

        // Carregar imagens dos artistas
        const artist_images = await Promise.all(artists.map(async (artist) => {
            const image_path = `./Images/${artist}.jpeg`;
            const image = new Image();
            image.src = image_path;
            return new Promise((resolve) => {
                image.onload = () => resolve({ artist, image });
                image.onerror = () => resolve({ artist, image: null });
            });
        }));

        console.log("Imagens dos artistas processadas:", artist_images);

        // Criar gráfico dos artistas com visual mais moderno
        const artist_chart_element = document.getElementById("topArtistsChart");
        if (artist_chart_element) {
            new Chart(artist_chart_element, {
                type: "bar",
                data: {
                    labels: artists,
                    datasets: [{
                        label: "Nr of plays",
                        data: artist_counts,
                        backgroundColor: artist_counts.map(() => "rgb(30,40,70)"),
                        borderWidth: 0,
                        borderRadius: 10,  // barras arredondadas
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: { display: false },
                            grid: { display: false }
                        },
                        y: {
                            ticks: {
                                color: text_color,
                                callback: value => value
                            },
                            grid: {
                                color: "rgba(255, 255, 255, 0)",
                                borderDash: [5, 5]
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: "10 Most listened artists",
                            color: text_color,
                            font: { size: 18, weight: "bold" }
                        }
                    },
                    layout: { padding: { top: 20, right: 20, bottom: 80 } }
                },
                plugins: [{
                    id: "customXAxisImages",
                    afterDraw(chart) {
                        const ctx = chart.ctx;
                        const x_axis = chart.scales.x;
                        const y_axis_bottom = chart.scales.y.bottom;
                        const tick_width = x_axis.width / x_axis.ticks.length;
                        const dynamic_image_size = Math.min(tick_width * 0.75, 50);

                        x_axis.ticks.forEach((tick, index) => {
                            const label = artists[index];
                            const artist_data = artist_images[index];
                            const x_pos = x_axis.getPixelForTick(index);
                            const y_pos = y_axis_bottom + 10;

                            if (artist_data.image) {
                                ctx.drawImage(
                                    artist_data.image,
                                    x_pos - dynamic_image_size / 2,
                                    y_pos,
                                    dynamic_image_size,
                                    dynamic_image_size
                                );
                            } else {
                                ctx.font = "12px Arial";
                                ctx.fillStyle = text_color;
                                ctx.textAlign = "center";
                                ctx.fillText(label, x_pos, y_pos + dynamic_image_size / 2);
                            }
                        });
                    }
                }]
            });
        }

        // Criar gráfico das músicas com visual moderno
        const track_chart_element = document.getElementById("topTracksChart");
        if (track_chart_element) {
            new Chart(track_chart_element, {
                type: "bar",
                data: {
                    labels: sorted_tracks,
                    datasets: [{
                        label: "Nr of plays",
                        data: sorted_track_counts,
                        backgroundColor: sorted_track_counts.map(() => "rgb(30,40,70)"),
                        borderWidth: 0,
                        borderRadius: 10,
                        borderSkipped: false

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
                                callback: (value, index) => {
                                    var label = sorted_tracks[index];
                                    return label.length > 8 ? label.substring(0, 8) + "..." : label;
                                }
                            },
                            grid: { display: false },
                            position: "bottom"
                        },
                        y: {
                            ticks: {
                                color: text_color,
                                callback: value => track_counts.includes(value) ? value : ""
                            },
                            grid: {
                                color: "rgba(255, 255, 255, 0)",
                                borderDash: [5, 5]
                            },
                            position: "left"
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: "10 Most listened tracks",
                            color: text_color,
                            font: { size: 18, weight: "bold" }
                        }
                    }
                }
            });
        }

        // Criar gráfico da distribuição horária com visual moderno
        const hour_chart_element = document.getElementById("hourDistChart");
        if (hour_chart_element) {
            new Chart(hour_chart_element, {
                type: "bar",
                data: {
                    labels: hours,
                    datasets: [{
                        label: "listen percentage",
                        data: hours_percentage,
                        backgroundColor: hours_percentage.map(() => "rgb(30,40,70)"),
                        borderWidth: 0,
                        borderRadius: 10,
                        borderSkipped: false
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
                                callback: (value, index) => {
                                    var label = hours[index];
                                    return label.length > 8 ? label.substring(0, 8) + "..." : label;
                                }
                            },
                            grid: { display: false },
                            position: "bottom"
                        },
                        y: {
                            ticks: {
                                color: text_color,
                                callback: value => hours_percentage.includes(value) ? value : ""
                            },
                            grid: {
                                color: "rgba(255, 255, 255, 0)",
                                borderDash: [5, 5]
                            },
                            position: "left"
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: "Hour distribution along day",
                            color: text_color,
                            font: { size: 18, weight: "bold" }
                        }
                    }
                }
            });
        }

    // Criar gráfico das músicas
    const hourChartElement = document.getElementById("hourDistChart");
    if (hourChartElement) {
        new Chart(hourChartElement, {
            type: "bar",
            data: {
                labels: hours,
                datasets: [{
                    label: "listen percentage",
                    data: hoursPercentage,
                    backgroundColor: hoursPercentage.map(() => `rgba(30, 215, 96, 0.5)`),
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
                                var label = hours[index];
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
                        text: "Hour distribution along day",
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
