import pandas as pd
import numpy as np
import nltk
import re
import string

from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report


# Download NLTK resources
nltk.download('stopwords')
nltk.download('punkt')
nltk.download('wordnet')

# Load dataset
df = pd.read_csv('spam_data.csv', encoding='latin-1')
df.drop(['Unnamed: 2', 'Unnamed: 3', 'Unnamed: 4'], axis=1, inplace=True)
df.columns = ['label', 'text']

def clean_text(text):
    # Remove HTML tags, non-alphabetic characters, and convert to lowercase
    text = re.sub('<.*?>', '', text)
    text = re.sub('[^a-zA-Z]', ' ', text).lower()
    
    # Tokenize the text
    words = nltk.word_tokenize(text)
    
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    words = [word for word in words if word not in stop_words]
    
    # Remove punctuations
    words = [word for word in words if word not in string.punctuation]
    
    # Stemming
    stemmer = PorterStemmer()
    words = [stemmer.stem(word) for word in words]
    
    # Lemmatization
    lemmatizer = WordNetLemmatizer()
    words = [lemmatizer.lemmatize(word) for word in words]
    
    # Join the words back into a string
    text = ' '.join(words)
    
    return text

df['cleaned_text'] = df['text'].apply(clean_text)

# TF-IDF Vectorization
tfidf_vectorizer = TfidfVectorizer(max_features=5000)
X = tfidf_vectorizer.fit_transform(df['cleaned_text'])
y = np.where(df['label'] == 'spam', 1, 0)

# Calculate spamicity for each word
def calculate_spamicity(X_train, y_train):
    spam_indices = np.where(y_train == 1)[0]
    ham_indices = np.where(y_train == 0)[0]
    pr_word_spam = X_train[spam_indices].sum(axis=0) / len(spam_indices)
    pr_word_ham = X_train[ham_indices].sum(axis=0) / len(ham_indices)
    spamicity = pr_word_spam / (pr_word_spam + pr_word_ham)
    return spamicity

# Filter out words based on spamicity and threshold
def filter_words(spamicity, threshold=0.05):
    filtered_indices = np.where(np.abs(spamicity - 0.5) < threshold)[0]
    return filtered_indices

# Calculate spamicity for all words
spamicity = calculate_spamicity(X, y)

# Filter out words based on spamicity and threshold
filtered_indices = filter_words(spamicity)

# Update the TF-IDF vectorizer with selected words
tfidf_vectorizer = TfidfVectorizer(max_features=5000, vocabulary=tfidf_vectorizer.get_feature_names_out())

# TF-IDF Vectorization with selected words
X = tfidf_vectorizer.fit_transform(df['cleaned_text'])
y = np.where(df['label'] == 'spam', 1, 0)

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train Logistic Regression Model with selected features
log_reg = LogisticRegression()
log_reg.fit(X_train, y_train)

# Train Naive Bayes Model with selected features
nb_classifier = MultinomialNB()
nb_classifier.fit(X_train, y_train)

# Predictions for Logistic Regression
y_pred_log_reg = log_reg.predict(X_test)
log_reg_accuracy = accuracy_score(y_test, y_pred_log_reg)
log_reg_cm = confusion_matrix(y_test, y_pred_log_reg)
log_reg_report = classification_report(y_test, y_pred_log_reg)

print("Logistic Regression Model Accuracy:", log_reg_accuracy)
print("Logistic Regression Model Confusion Matrix:")
print(log_reg_cm)
print("Logistic Regression Model Classification Report:")
print(log_reg_report)

# Predictions for Naive Bayes
y_pred_nb = nb_classifier.predict(X_test)
nb_accuracy = accuracy_score(y_test, y_pred_nb)
nb_cm = confusion_matrix(y_test, y_pred_nb)
nb_report = classification_report(y_test, y_pred_nb)

print("Naive Bayes Model Accuracy:", nb_accuracy)
print("Naive Bayes Model Confusion Matrix:")
print(nb_cm)
print("Naive Bayes Model Classification Report:")
print(nb_report)

# Classification function for email spam detection
def email_spam_classify(email_text):
    # Clean the email text
    cleaned_text = clean_text(email_text)
    
    # Transform the cleaned email text using TF-IDF vectorizer
    tfidf_email_text = tfidf_vectorizer.transform([cleaned_text])
    
    # Predict using the logistic regression model
    log_reg_prediction = log_reg.predict(tfidf_email_text)
    
    # Predict using the Naive Bayes model
    nb_prediction = nb_classifier.predict(tfidf_email_text)
    
    # Combine predictions
    combined_prediction = log_reg_prediction[0] == 1 or nb_prediction[0] == 1
    
    return combined_prediction, log_reg_prediction[0], nb_prediction[0]


# Test the email_spam_classify function
# email_text ="England v Macedonia - dont miss the goals/team news. Txt ur national team to 87077 eg ENGLAND to 87077 Try:WALES, SCOTLAND 4txt/̼1.20 POBOXox36504W45WQ 16+"
# print("Is the email spam?", email_spam_classify(email_text))



# # Read the input sent from JavaScript
# input_text = sys.stdin.readline().strip()

# # Generate the output
# output = {"input": input_text, "is_true": email_spam_classify()}

# # Send the output back to JavaScript
# sys.stdout.write(json.dumps(output))
# sys.stdout.flush()  # Ensure the output is flushed
