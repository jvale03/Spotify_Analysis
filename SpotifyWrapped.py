import pandas as pd
import re
import json


WRAP = "https://docs.google.com/spreadsheets/d/1qP6ewOM2nnbo4TBnKRRf5jDEZV_BAsQWucYEZLWeAQ0/edit?usp=sharing" # Insert Google Sheet link between quotes

google_sheets_link = WRAP

def convert_google_sheet_url(url):
    # Regular expression to match and capture the necessary part of the URL
    pattern = r'https://docs\.google\.com/spreadsheets/d/([a-zA-Z0-9-_]+)(/edit#gid=(\d+)|/edit.*)?'

    # Replace function to construct the new URL for CSV export
    # If gid is present in the URL, it includes it in the export URL, otherwise, it's omitted
    replacement = lambda m: f'https://docs.google.com/spreadsheets/d/{m.group(1)}/export?' + (f'gid={m.group(3)}&' if m.group(3) else '') + 'format=csv'

    # Replace using regex
    new_url = re.sub(pattern, replacement, url)

    return new_url

pandas_url = convert_google_sheet_url(google_sheets_link)

df = pd.read_csv(pandas_url)

## Artistas

artist_count = df["ArtistName"].value_counts()

top_10_artist = artist_count.head(10)
top_10_artist.plot(kind='bar', color='skyblue', edgecolor='black')

music_count = df["TrackName"].value_counts()

top_10_musics = music_count.head(10)
top_10_musics.plot(kind='bar', color='skyblue', edgecolor='black')


top_10_artist_json = top_10_artist.to_dict()
top_10_musics_json = top_10_musics.to_dict()

with open("data.json", "w") as f:
    json.dump({
        "top_artists": top_10_artist_json,
        "top_tracks": top_10_musics_json,
        "total_tracks": df.shape[0],
        "total_minutes": df.shape[0] * 3,
    }, f)