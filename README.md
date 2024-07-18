# AI-Based Personalized Nutrition Recommendation System

## Overview

This project is an advanced AI-based recommendation system designed to provide personalized meal suggestions based on individual dietary preferences and restrictions. By integrating content-based filtering with a neural network model, we aim to enhance the accuracy and relevance of meal recommendations.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Data](#data)
- [Model](#model)
- [Results](#results)

## Features

- Personalized meal recommendations based on user preferences and dietary restrictions.
- Backend development using Express.js for efficient data handling and API integration.
- Frontend development using React for a user-friendly interface.
- Database management using Prisma for smooth data retrieval and storage.
- Combination of content-based filtering and neural network classification for enhanced accuracy.

## Technologies

- Python, Pandas, NumPy
- Natural Language Processing (NLP) with CountVectorizer
- TensorFlow for neural network development
- Express.js for backend development
- React for frontend development
- Prisma for database management
- Data visualization with Matplotlib and Seaborn

## Data

The data consists of various meal entries, each with information about the name, ingredients, and dietary labels. Preprocessing steps include extracting ingredients, converting text to lowercase, and splitting ingredient lists.

## Model

The recommendation system uses a combination of content-based filtering and a neural network model:

- **Content-based Filtering**: Calculates cosine similarity between user preferences and meal ingredients.
- **Neural Network Model**: Classifies meals as preferred or not preferred based on ingredient vectors.

## Results

- Achieved an accuracy of 85% in meal recommendations.
- Demonstrated the superiority of the integrated content-based and neural network approach over traditional methods.

---

This project received an A grade, showcasing its effectiveness and potential for real-world applications in personalized nutrition. If you have any questions or suggestions, feel free to open an issue or contact the project maintainers.
