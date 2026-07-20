import os
import pandas as pd
from dateparser.search import search_dates
from core.document_loader import extract_text_from_file

_nlp = None

def get_spacy_model():
    """
    Lazily loads the spaCy model.
    Raises a RuntimeError if the 'en_core_web_sm' model is not installed.
    """
    global _nlp
    if _nlp is None:
        try:
            import spacy
            _nlp = spacy.load("en_core_web_sm")
        except OSError:
            raise RuntimeError(
                "spaCy model 'en_core_web_sm' is not installed. "
                "Please install it before running the server using: "
                "python -m spacy download en_core_web_sm"
            )
    return _nlp

# Deadline detection keywords (order determines priority if matches overlap)
deadline_keywords = [
    "boarding",
    "gate closes",
    "reporting",
    "last date",
    "submit",
    "submission",
    "due",
    "closing",
    "expiry",
    "expiration",
    "registration",
    "exam",
    "interview",
    "meeting",
    "renewal",
    "deadline"
]

def extract_deadlines_from_text(text: str, source_name: str) -> list:
    """
    Parses document text, identifies dates, detects proximity keyword match,
    and labels them as event deadlines.
    """
    results = []
    nlp = get_spacy_model()
    doc = nlp(text)

    for sent in doc.sents:
        sentence_text = sent.text.strip()
        # Find dates in sentence using strict parsing to minimize false positives
        dates_found = search_dates(sentence_text, settings={'STRICT_PARSING': True})

        if dates_found:
            for matched_string, datetime_object in dates_found:
                # Character offsets in the sentence
                date_start = sentence_text.find(matched_string)
                if date_start == -1:
                    continue
                date_end = date_start + len(matched_string)

                # Context window surrounding the date string
                window_size = 50
                context_start = max(0, date_start - window_size)
                context_end = min(len(sentence_text), date_end + window_size)
                context_text = sentence_text[context_start:context_end].lower()

                # Find any keyword match
                matching_keyword = None
                for keyword in deadline_keywords:
                    if keyword in context_text:
                        matching_keyword = keyword
                        break

                if matching_keyword:
                    event_label_prefix = ""
                    if matching_keyword.lower() == 'deadline':
                        event_label_prefix = "Deadline"
                    else:
                        event_label_prefix = f"{matching_keyword.title()} Deadline"

                    event_description = f"{event_label_prefix}: {matched_string}"

                    results.append({
                        "Document": source_name,
                        "Deadline": datetime_object,
                        "Event": event_description,
                        "MatchedString": matched_string,
                        "type": matching_keyword.title()
                    })
    return results

def consolidate_deadlines(all_deadlines: list) -> list:
    """
    Deduplicates and consolidates extracted deadlines.
    Prioritizes deadlines with times and details.
    """
    if not all_deadlines:
        return []
        
    df = pd.DataFrame(all_deadlines)
    if not df.empty:
        df = df.drop_duplicates()
        df['Deadline'] = pd.to_datetime(df['Deadline'])
        
        # Deduplication helper columns
        df['DateOnly'] = df['Deadline'].dt.date
        df['HasTime'] = (df['Deadline'].dt.hour != 0) | (df['Deadline'].dt.minute != 0)
        df['MatchedStringLength'] = df['MatchedString'].str.len()

        # Sort to prioritize precise dates/times
        df = df.sort_values(
            by=['Document', 'DateOnly', 'HasTime', 'MatchedStringLength'], 
            ascending=[True, True, True, True]
        )
        
        # Deduplicate, keeping the most precise entry
        df = df.drop_duplicates(subset=['Document', 'DateOnly'], keep='last')
        
        # Sort chronologically
        df = df.sort_values("Deadline")
        df.reset_index(drop=True, inplace=True)
        
        # Remove helper columns
        df = df.drop(columns=['DateOnly', 'HasTime', 'MatchedStringLength', 'MatchedString'])
        
        # Format datetime object to string for clean serialization
        df['Deadline'] = df['Deadline'].dt.strftime('%Y-%m-%d %H:%M:%S')
        
        # Rename columns to match JS properties
        df = df.rename(columns={"Deadline": "date", "Event": "event"})
        
        return df.to_dict("records")
    return []

def extract_deadlines_from_file(file_path: str, filename: str) -> list:
    """
    Wrapper that loads a file, extracts its text, pulls deadlines,
    and returns a sorted, consolidated deadline list.
    """
    text = extract_text_from_file(file_path)
    deadlines = extract_deadlines_from_text(text, filename)
    return consolidate_deadlines(deadlines)
