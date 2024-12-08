import pandas as pd
import re
import json

WRAP = "https://docs.google.com/spreadsheets/d/1qP6ewOM2nnbo4TBnKRRf5jDEZV_BAsQWucYEZLWeAQ0/edit?usp=sharing"


def convert_google_sheet_url(url):
    # Regular expression to match and capture the necessary part of the URL
    pattern = r'https://docs\.google\.com/spreadsheets/d/([a-zA-Z0-9-_]+)(/edit#gid=(\d+)|/edit.*)?'

    # Replace function to construct the new URL for CSV export
    # If gid is present in the URL, it includes it in the export URL, otherwise, it's omitted
    replacement = lambda m: f'https://docs.google.com/spreadsheets/d/{m.group(1)}/export?' + (f'gid={m.group(3)}&' if m.group(3) else '') + 'format=csv'

    # Replace using regex
    new_url = re.sub(pattern, replacement, url)

    return new_url


if __name__=="__main__":
    # utr converter
    pandas_url = convert_google_sheet_url(WRAP)
    # read csv
    df = pd.read_csv(pandas_url)
    # add Date info
    df['month'] = pd.to_datetime(df['PlayedAt']).dt.strftime('%B')
    df['month_day'] = pd.to_datetime(df['PlayedAt']).dt.strftime('%B %d') 

    

    # get artist info
    artist_count = df["ArtistName"].value_counts()
    top_10_artist = artist_count.head(10)

    # get tracks info
    track_count = df["TrackName"].value_counts()
    top_10_tracks = track_count.head(10)

    # get month info
    month_count = df["month"].value_counts()

    # get day info
    day_count = df["month_day"].value_counts()


    with open("data.json", "w") as f:
        json.dump({
            "top_artists": top_10_artist.to_dict(),
            "top_tracks": top_10_tracks.to_dict(),
            "total_tracks": df.shape[0],
            "total_minutes": df.shape[0] * 3,
            "total_artists": len(artist_count),
            "total_different_tracks": len(track_count),
            "top_month": month_count.head(1).to_dict(),
            "top_day": day_count.head(1).to_dict(),
        }, f)



