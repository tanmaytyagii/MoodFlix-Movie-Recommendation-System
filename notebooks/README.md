# Notebooks

Exploratory work that informed MoodFlix's content-based recommender.

## `ProjectRecommendation.ipynb`

Builds a TF-IDF text pipeline over IMDb movie metadata:

1. Load `data/IMDbMovies-Clean.csv` and drop columns not relevant to text similarity.
2. Impute missing values so rows survive concatenation.
3. Combine `Summary`, `Writer`, `Director` and `Main Genres` into one `metadata` field.
4. Clean and normalise with NLTK — lowercase, strip HTML and punctuation, remove stop
   words, lemmatise.
5. Write `final_data.csv`, ready for vectorisation.

### What this notebook is and is not

It is **data preparation research**. It does not train a model, and it contains no
sentiment or emotion classifier — the columns in this dataset carry no sentiment
labels to train one on.

The shipped app does not import anything from this notebook. The technique it
explores is what carried over: MoodFlix's "More like this" applies the same
TF-IDF-and-cosine-similarity approach in
[`src/lib/tfidf.ts`](../src/lib/tfidf.ts), reimplemented in TypeScript over live
TMDB metadata so the browser never downloads the 2.6 MB dataset.

### Running it

```bash
pip install pandas numpy matplotlib seaborn nltk
jupyter notebook ProjectRecommendation.ipynb
```

Paths are relative to this directory, so it runs locally as well as in Colab.

## `data/IMDbMovies-Clean.csv`

The notebook's input: IMDb titles with summaries, writers, directors and genres.
Kept so the notebook is reproducible. Nothing in `src/` reads it.
