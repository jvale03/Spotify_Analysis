import pandas as pd
import re
import json
from datetime import datetime

WRAP_LIST = [
    "https://docs.google.com/spreadsheets/d/1qP6ewOM2nnbo4TBnKRRf5jDEZV_BAsQWucYEZLWeAQ0/edit?usp=sharing",
    "https://docs.google.com/spreadsheets/d/12Ca1HddvjQewWyuJGH350czVv3dx8jy3gYP4ajciatI/edit?gid=0#gid=0",
    "https://docs.google.com/spreadsheets/d/1RhnqtHVywLohy2xjt6Cjt1FwXdyjymnqcFAYqvYYFVw/edit?gid=0#gid=0"
]


def convert_google_sheet_url(url):
    # Regular expression to match and capture the necessary part of the URL
    pattern = r'https://docs\.google\.com/spreadsheets/d/([a-zA-Z0-9-_]+)(/edit#gid=(\d+)|/edit.*)?'

    # Replace function to construct the new URL for CSV export
    # If gid is present in the URL, it includes it in the export URL, otherwise, it's omitted
    replacement = lambda m: f'https://docs.google.com/spreadsheets/d/{m.group(1)}/export?' + (f'gid={m.group(3)}&' if m.group(3) else '') + 'format=csv'

    # Replace using regex
    new_url = re.sub(pattern, replacement, url)

    return new_url


if __name__ == "__main__":
    # utr converter
    df_list = []
    for wrap in WRAP_LIST:
        pandas_url = convert_google_sheet_url(wrap)
        # read csv
        df = pd.read_csv(pandas_url)
        df_list.append(df)
    
    df = pd.concat(df_list, axis=0, ignore_index=True)
    
    # Adaptar para o formato correto: "Month Day, Year at Hour:MinuteAM/PM"
    df['PlayedAt'] = df['PlayedAt'].str.replace(r' at ', ' ', regex=True)  # Remover ' at '
    df['PlayedAt'] = pd.to_datetime(df['PlayedAt'], format="%B %d, %Y %I:%M%p", errors='coerce')
    
    # Verifica se a conversão foi bem-sucedida (caso contrário, os valores serão NaT)
    if df['PlayedAt'].isnull().any():
        print("Alguns valores de data não puderam ser convertidos.")

    df['month'] = df['PlayedAt'].dt.strftime('%B')
    df['month_day'] = df['PlayedAt'].dt.strftime('%B %d') 
    df['hour'] = df['PlayedAt'].dt.strftime('%I%p')
    df['hour'] = df['hour'].apply(lambda x: datetime.strptime(x, "%I%p").strftime("%H"))
    
    # Get artist info
    artist_count = df["ArtistName"].value_counts()
    top_10_artist = artist_count.head(10)

    # Get tracks info
    track_count = df["TrackName"].value_counts()
    top_10_tracks = track_count.head(10)
    
    # Get month info
    month_count = df["month"].value_counts()

    # Get day info
    day_count = df["month_day"].value_counts()

    # Get hours info
    hour_count = df["hour"].value_counts(normalize=True) * 100
    hour_count = hour_count.to_dict()
    hour_count = dict(sorted(hour_count.items()))


    data = {
        "top_artists": top_10_artist.to_dict(),
        "top_tracks": top_10_tracks.to_dict(),
        "total_tracks": df.shape[0],
        "total_minutes": df.shape[0] * 3,
        "total_artists": len(artist_count),
        "total_different_tracks": len(track_count),
        "top_month": month_count.head(1).to_dict(),
        "top_day": day_count.head(1).to_dict(),
        "hour_dist": hour_count 
    }

    with open("src/data.json", "w") as f1:
        json.dump(data, f1)