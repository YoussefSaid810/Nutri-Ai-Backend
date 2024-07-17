import sys
import json
import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
sys.stdout.reconfigure(encoding='utf-8')
import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import warnings
warnings.filterwarnings("ignore")


diet = None
tdee_Breakfast = None
tdee_Lunch = None
tdee_Dinner = None
tdee_Snack = None


def read_data_from_file(file_path):
    data = []
    with open(file_path, 'r', encoding='utf-8') as file:
        # Skip the first 55 lines
        for _ in range(54):
            next(file)

        # Read the second number from each line and store it in the list
        for line in file:
            parts = line.split()
            if len(parts) >= 2 and parts[1].isdigit():
                data.append(int(parts[1]))

    return data

def rank_meals(preferred_ingredients, dietType="None", meals = []):
    data = pd.DataFrame(meals)
    
    # Exclude from data
    data = data[(~data["name"].str.lower().str.contains('|'.join(excludes), na=False, regex=True)) &(~data['ingredients'].str.lower().str.contains('|'.join(excludes), na=False, regex=True))]

    # Preprocess data
    data['ingredients'] = data['ingredients'].apply(lambda x: x.lower().split(','))

    # Apply diet
    if dietType != "None" and dietType in data.columns:
        data = data[data[dietType] == True]

    # Create vocabulary
    vectorizer = CountVectorizer(tokenizer=lambda x: x, lowercase=False)
    vectorizer.fit(data['ingredients'])

    # Convert ingredients to bag-of-words representation
    X = vectorizer.transform(data['ingredients']).toarray()

    # Calculate cosine similarity between user preferences and meal ingredients
    user_preferences_vec = vectorizer.transform([preferred_ingredients]).toarray()
    ingredient_vectors = vectorizer.transform(data['ingredients']).toarray()
    cosine_similarities = cosine_similarity(user_preferences_vec, ingredient_vectors).flatten()

    # Count matching ingredients between user preferences and each meal
    matching_ingredients_count = np.array(
        [sum([pref in ingredients for pref in preferred_ingredients]) for ingredients in data['ingredients']])

    # Label meals as preferred or not preferred based on cosine similarity
    preferred_threshold = 0.7
    preferred_labels = (cosine_similarities >= preferred_threshold).astype(int)

    # Build TensorFlow model for classification
    class MealPreferenceModel(tf.keras.Model):
        def __init__(self, num_features):
            super(MealPreferenceModel, self).__init__()
            self.dense1 = tf.keras.layers.Dense(64, activation='relu')
            self.dense2 = tf.keras.layers.Dense(32, activation='relu')
            self.dense3 = tf.keras.layers.Dense(16, activation='relu')
            self.output_layer = tf.keras.layers.Dense(2,activation='softmax')  # 2 units for binary classification (preferred or not preferred)

        def call(self, inputs):
            x = self.dense1(inputs)
            x = self.dense2(x)
            x = self.dense3(x)
            return self.output_layer(x)

    # Instantiate the model
    model = MealPreferenceModel(num_features=X.shape[1])

    # Compile the model for classification
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

    # Train the model
    model.fit(X, preferred_labels, epochs=10, batch_size=32, verbose=0)

    # Predict preferred meals
    predictions = model.predict(X, verbose=0)[:, 1]  # Probability of being a preferred meal


    # Combine model predictions, cosine similarity, and matching ingredients count
    preference_scores = predictions + cosine_similarities + matching_ingredients_count

    # Append preference scores to the DataFrame
    data['preference_score'] = preference_scores

    # Rank meals based on preference scores
    ranked_meals = data.sort_values(by='preference_score', ascending=False)

    print(ranked_meals['id'].head(50).to_string(index=False))

def rank_meals_csv(preferred_ingredients, excludes, dietType="None"):
    # Load data
    file_path = 'newfood.csv'  # Change this to your file path
    data = pd.read_csv(file_path, encoding='utf-8')  # Specify encoding to handle non-ASCII characters

    # Exclude from data
    data = data[(~data["title"].str.lower().str.contains('|'.join(excludes), na=False, regex=True)) &(~data['ingredients'].str.lower().str.contains('|'.join(excludes), na=False, regex=True))]

    # Preprocess data
    data['ingredients'] = data['ingredients'].apply(lambda x: x.lower().split(','))

    # Apply diet
    if dietType != "None" and dietType in data.columns:
        data = data[data[dietType] == True]


    # Create vocabulary
    vectorizer = CountVectorizer(tokenizer=lambda x: x, lowercase=False)
    vectorizer.fit(data['ingredients'])

    # Convert ingredients to bag-of-words representation
    X = vectorizer.transform(data['ingredients']).toarray()

    # Calculate cosine similarity between user preferences and meal ingredients
    user_preferences_vec = vectorizer.transform([preferred_ingredients]).toarray()
    ingredient_vectors = vectorizer.transform(data['ingredients']).toarray()
    cosine_similarities = cosine_similarity(user_preferences_vec, ingredient_vectors).flatten()

    # Count matching ingredients between user preferences and each meal
    matching_ingredients_count = np.array( 
        [sum([pref in ingredients for pref in preferred_ingredients]) for ingredients in data['ingredients']])

    # Label meals as preferred or not preferred based on cosine similarity
    preferred_threshold = 0.7  # Adjust threshold as needed
    preferred_labels = (cosine_similarities >= preferred_threshold).astype(int)

    # Build TensorFlow model for classification
    class MealPreferenceModel(tf.keras.Model):
        def __init__(self, num_features):
            super(MealPreferenceModel, self).__init__()
            self.dense1 = tf.keras.layers.Dense(64, activation='relu')
            self.dense2 = tf.keras.layers.Dense(32, activation='relu')
            self.dense3 = tf.keras.layers.Dense(16, activation='relu')
            self.output_layer = tf.keras.layers.Dense(2,activation='softmax')  # 2 units for binary classification (preferred or not preferred)

        def call(self, inputs):
            x = self.dense1(inputs)
            x = self.dense2(x)
            x = self.dense3(x)
            return self.output_layer(x)

    # Instantiate the model
    model = MealPreferenceModel(num_features=X.shape[1])

    # Compile the model for classification
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

    # Train the model
    model.fit(X, preferred_labels, epochs=10, batch_size=32, verbose=0)

    # Predict preferred meals
    predictions = model.predict(X,verbose=0)[:, 1]  # Probability of being a preferred meal

    # Combine model predictions, cosine similarity, and matching ingredients count
    preference_scores = predictions + cosine_similarities + matching_ingredients_count

    # Append preference scores to the DataFrame
    data['preference_score'] = preference_scores

    # Rank meals based on preference scores
    ranked_meals = data.sort_values(by='preference_score', ascending=False)

    print(ranked_meals['id'].head(50).to_string(index=True))

def calculate_tdee(weight = 55, height = 183, age = 21 , gender = 'male', activity_level = 'sedentary', goal = 'Gain Muscles'):
    weight = float(weight)
    height = float(height)
    age = float(age)

    bmr = 0

    if gender.lower() == 'male':
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    elif gender.lower() == 'female':
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    else:
        raise ValueError("Invalid gender. Please enter 'male' or 'female'.")
    
    activity_levels = {'sedentary': 1.2, 'light': 1.375, 'moderate': 1.55, 'heavy': 1.725, 'athlete': 1.9}
    if activity_level.lower() in activity_levels:
        tdee = bmr * activity_levels[activity_level.lower()]
    else:
        raise ValueError("Invalid activity level.")

    # Adjust TDEE based on the user's goal
    if goal == 'Lose Fats':
        tdee -= 500
    if goal == 'Gain Muscles':
        tdee += 300


    protein_ratio = 0.3
    fat_ratio = 0.25
    carb_ratio = 0.45

    # protein = float((protein_ratio * tdee) / 4)
    # fat = float((fat_ratio * tdee) / 9)
    # carbs = float((carb_ratio * tdee) / 4)

    return tdee

def rec_Breakfast():
    global tdee_Breakfast
    global diet
    # Define the conditions
    condition_column = "dishTypes"
    condition_value = "salad"
    excludes = ['wine', 'red wine', 'red wine vinegar', 'white wine', 'pork', 'ham', 'beer', 'champagne vinegar', 'champagne']
    # Ask the user about their dietary preference
    # user_diet_preference = input("Are you on a specific diet? (yes/no): ").lower()

    # Read the CSV file into a pandas DataFrame
    df = pd.read_csv('newfood.csv')

    # Check if the condition column exists in the DataFrame
    if condition_column not in df.columns:
        print(f"Error: {condition_column} column not found.")
    else:
        # Filter the DataFrame based on the conditions and print the result
        filtered_df = df[(df[condition_column] == condition_value) & (
            ~df['ingredients'].str.lower().str.contains('|'.join(excludes)))]

        # Additional filter for vegan meals if the user is vegan
        if diet != "None":
            # diet = input("Please write your diet: (vegan/vegetarian/glutenFree/dairyFree/sustainable/lowFodMap/ketogenic/whole30)")
            filtered_df = filtered_df[filtered_df[diet] == True]

        while not filtered_df.empty:
            random_meal = filtered_df.sample(n=1)  # Select one random row from the DataFrame
            if diet != "None":
                random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Breakfast / random_meal[
                    'calories']
                print(random_meal[['title', 'dishTypes', diet, 'weightPerServing']], )
            elif diet == "None":
                # serv = random_meal['weightPerServing'] * tdee_Breakfast / random_meal['calories']
                random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Breakfast / random_meal[
                    'calories']
                print(random_meal[['title', 'dishTypes', 'weightPerServing']])
            # Ask the user if they like the meal
            user_input = input("Do you like this meal? (yes/no): ").lower()
            if user_input == 'yes':
                break  # Exit the loop if the user likes the meal
            elif user_input == 'no':
                filtered_df = filtered_df.drop(random_meal.index)  # Remove the disliked meal from the DataFrame
                if filtered_df.empty:
                    print(f"No more meals found for {condition_column} = {condition_value}.")
                    break
            else:
                print("Invalid input. Please enter 'yes' or 'no'.")
        else:
            print(f"No records found for {condition_column} = {condition_value}.")


def rec_Fav_Breakfast():
    tdee = 2000
    tdee_Breakfast = tdee * 25 / 100
    tdee_Lunch = tdee * 40 / 100
    tdee_Dinner = tdee * 25 / 100
    tdee_Snack = tdee * 10 / 100
    data = read_data_from_file('D:/E-Commerce V.2/e-commerce/output.txt')
    diet = "None"
    global ranked_meals_Bf

    condition_column = "dishTypes"
    condition_value = "salad"
    excludes = ['wine', 'red wine', 'red wine vinegar', 'white wine', 'pork', 'ham', 'beer', 'champagne vinegar',
                'champagne']
    # Ask the user about their dietary preference
    # user_diet_preference = input("Are you on a specific diet? (yes/no): ").lower()

    # Read the CSV file into a pandas DataFrame
    df = pd.read_csv('C:/Users/youss/PycharmProjects/Gp/newfood.csv')

    # Check if the condition column exists in the DataFrame
    if condition_column not in df.columns:
        print(f"Error: {condition_column} column not found.")
    else:
        # Filter the DataFrame based on the conditions and print the result
        filtered_df = df[(df[condition_column] == condition_value) & (
            ~df['ingredients'].str.lower().str.contains('|'.join(excludes)))]

        # Additional filter for vegan meals if the user is vegan
        if diet != "None":
            # diet = input("Please write your diet: (vegan/vegetarian/glutenFree/dairyFree/sustainable/lowFodMap/ketogenic/whole30)")
            filtered_df = filtered_df[filtered_df[diet] == True]


    filtered_df = filtered_df[filtered_df['id'].isin(data)]


    # user_diet_preference = input("Are you on a specific diet? (yes/no): ").lower()

    # Additional filter for vegan meals if the user is vegan
    # if diet != "None":
    #     # diet = input("Please write your diet: (vegan/vegetarian/glutenFree/dairyFree/sustainable/lowFodMap/ketogenic/whole30)")
    #     ranked_meals_Bf = ranked_meals_Bf[ranked_meals_Bf[diet] == True]

    # ranked_meals_Bf10 = ranked_meals_Bf.head(10)
    # print(ranked_meals_Bf10)

    while not filtered_df.empty:
        random_meal = filtered_df.sample(n=1).iloc[0]  # Select one random row from the DataFrame

        # Adjust the following code to handle DataFrame columns appropriately
        if diet != "None":
            random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Breakfast / random_meal['calories']
            # print(random_meal[['title', 'dishTypes', diet, 'weightPerServing', 'preference_score']], tdee_Breakfast)
        elif diet == "None":
            random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Breakfast / random_meal['calories']
            # print(random_meal[['title', 'dishTypes', 'weightPerServing', "preference_score"]])

        # Ask the user if they like the meal
        # user_input = input("Do you like this meal? (yes/no): ").lower()
        # if user_input == 'yes':
        #     break  # Exit the loop if the user likes the meal
        # elif user_input == 'no':
        #     # ranked_meals_Bf10 = ranked_meals_Bf10.drop(index=random_meal)  # Remove the disliked meal from the DataFrame
        #     # ranked_meals_Bf10 = ranked_meals_Bf10.reset_index(drop=True)  # Reset the index after dropping rowsif ranked_meals_Bf10.empty:
        #     if filtered_df.empty:
        #         print(f"No more meals found.")
        return random_meal
        # else:
        #     print("Invalid input. Please enter 'yes' or 'no'.")


def rec_Lunch():
    global tdee_Lunch
    global diet

    # Define the conditions
    condition_column = "dishTypes"
    condition_value = "lunch"
    excludes = ['q']
    # Ask the user about their dietary preference
    # user_diet_preference = input("Are you on a specific diet? (yes/no): ").lower()

    # Read the CSV file into a pandas DataFrame
    df = pd.read_csv('newfood.csv')

    # Check if the condition column exists in the DataFrame
    if condition_column not in df.columns:
        print(f"Error: {condition_column} column not found.")
    else:
        # Filter the DataFrame based on the conditions and print the result
        filtered_df = df[(df[condition_column].str.lower().str.contains('|'.join(condition_value))) & (
            ~df['ingredients'].str.lower().str.contains('|'.join(excludes)))]

        # Additional filter for vegan meals if the user is vegan
        if diet != "None":
            # diet = input("Please write your diet: (vegan/vegetarian/glutenFree/dairyFree/sustainable/lowFodMap/ketogenic/whole30)")
            filtered_df = filtered_df[filtered_df[diet] == True]
        else:
            print("")

        while not filtered_df.empty:
            random_meal = filtered_df.sample(n=1)  # Select one random row from the DataFrame
            if diet != "None":
                random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Lunch / random_meal['calories']
                print(random_meal[['title', 'dishTypes', diet, 'weightPerServing']])
            elif diet == "None":
                random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Lunch / random_meal['calories']
                print(random_meal[['title', 'dishTypes', 'weightPerServing']])
            # Ask the user if they like the meal
            user_input = input("Do you like this meal? (yes/no): ").lower()
            if user_input == 'yes':
                break  # Exit the loop if the user likes the meal
            elif user_input == 'no':
                filtered_df = filtered_df.drop(random_meal.index)  # Remove the disliked meal from the DataFrame
            if filtered_df.empty:
                print(f"No more meals found for {condition_column} = {condition_value}.")
                break
            else:
                print("Invalid input. Please enter 'yes' or 'no'.")
        else:
            print(f"No records found for {condition_column} = {condition_value}.")


def rec_Fav_Lunch():
    global diet
    global ranked_meals_Lu
    global tdee_Lunch

    # user_diet_preference = input("Are you on a specific diet? (yes/no): ").lower()

    # Additional filter for vegan meals if the user is vegan
    if diet != "None":
        # diet = input("Please write your diet: (vegan/vegetarian/glutenFree/dairyFree/sustainable/lowFodMap/ketogenic/whole30)")
        ranked_meals_Lu = ranked_meals_Lu[ranked_meals_Lu[diet] == True]

    ranked_meals_Lu10 = ranked_meals_Lu.head(10)
    print(ranked_meals_Lu10)

    while not ranked_meals_Lu10.empty:
        random_meal = ranked_meals_Lu10.sample(n=1).iloc[0]  # Select one random row from the DataFrame

        # Adjust the following code to handle DataFrame columns appropriately
        if diet != "None":
            random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Lunch / random_meal['calories']
            print(random_meal[['title', 'dishTypes', diet, 'weightPerServing', 'preference_score']])
        elif diet == "None":
            random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Lunch / random_meal['calories']
            print(random_meal[['title', 'dishTypes', 'weightPerServing', "preference_score"]])

        # Ask the user if they like the meal
        user_input = input("Do you like this meal? (yes/no): ").lower()
        if user_input == 'yes':
            break  # Exit the loop if the user likes the meal
        elif user_input == 'no':
            # ranked_meals_Bf10 = ranked_meals_Bf10.drop(ranked_meals_Bf10.index[random_meal.index],axis=0)  # Remove the disliked meal from the DataFrame
            # ranked_meals_Bf10 = ranked_meals_Bf10.reset_index(drop=True)  # Reset the index after dropping rows
            if ranked_meals_Lu10.empty:
                print(f"No more meals found.")
                break
        else:
            print("Invalid input. Please enter 'yes' or 'no'.")


def rec_Dinner():
    global tdee_Dinner
    global diet
    # Define the conditions
    condition_column = "dishTypes"
    condition_value = "dinner"
    excludes = ['q']
    # Ask the user about their dietary preference
    # user_diet_preference = input("Are you on a specific diet? (yes/no): ").lower()

    # Read the CSV file into a pandas DataFrame
    df = pd.read_csv('newfood.csv')

    # Check if the condition column exists in the DataFrame
    if condition_column not in df.columns:
        print(f"Error: {condition_column} column not found.")
    else:
        # Filter the DataFrame based on the conditions and print the result
        filtered_df = df[(df[condition_column].str.lower().str.contains('|'.join(condition_value))) & (
            ~df['ingredients'].str.lower().str.contains('|'.join(excludes)))]

        # Additional filter for vegan meals if the user is vegan
        if diet != "None":
            # diet = input("Please write your diet: (vegan/vegetarian/glutenFree/dairyFree/sustainable/lowFodMap/ketogenic/whole30)")
            filtered_df = filtered_df[filtered_df[diet] == True]
        else:
            print("")

        while not filtered_df.empty:
            random_meal = filtered_df.sample(n=1)  # Select one random row from the DataFrame
            if diet != "None":
                random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Dinner / random_meal[
                    'calories']
                print(random_meal[['title', 'dishTypes', diet, 'weightPerServing']])
            elif diet == "None":
                random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Dinner / random_meal[
                    'calories']
                print(random_meal[['title', 'dishTypes', 'weightPerServing']])
            # Ask the user if they like the meal
            user_input = input("Do you like this meal? (yes/no): ").lower()
            if user_input == 'yes':
                break  # Exit the loop if the user likes the meal
            elif user_input == 'no':
                filtered_df = filtered_df.drop(random_meal.index)  # Remove the disliked meal from the DataFrame
            if filtered_df.empty:
                print(f"No more meals found for {condition_column} = {condition_value}.")
                break
            else:
                print("Invalid input. Please enter 'yes' or 'no'.")
        else:
            print(f"No records found for {condition_column} = {condition_value}.")


def rec_Fav_Dinner():
    global diet
    global ranked_meals_Dn
    global tdee_Dinner

    # user_diet_preference = input("Are you on a specific diet? (yes/no): ").lower()

    # Additional filter for vegan meals if the user is vegan
    if diet != "None":
        # diet = input("Please write your diet: (vegan/vegetarian/glutenFree/dairyFree/sustainable/lowFodMap/ketogenic/whole30)")
        ranked_meals_Dn = ranked_meals_Dn[ranked_meals_Dn[diet] == True]

    ranked_meals_Dn10 = ranked_meals_Dn.head(10)
    print(ranked_meals_Dn10)

    while not ranked_meals_Dn10.empty:
        random_meal = ranked_meals_Dn10.sample(n=1).iloc[0]  # Select one random row from the DataFrame

        # Adjust the following code to handle DataFrame columns appropriately
        if diet != "None":
            random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Dinner / random_meal['calories']
            print(random_meal[['title', 'dishTypes', diet, 'weightPerServing', 'preference_score']])
        elif diet == "None":
            random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Dinner / random_meal['calories']
            print(random_meal[['title', 'dishTypes', 'weightPerServing', "preference_score"]])

        # Ask the user if they like the meal
        user_input = input("Do you like this meal? (yes/no): ").lower()
        if user_input == 'yes':
            break  # Exit the loop if the user likes the meal
        elif user_input == 'no':
            # ranked_meals_Bf10 = ranked_meals_Bf10.drop(ranked_meals_Bf10.index[random_meal.index],axis=0)  # Remove the disliked meal from the DataFrame
            # ranked_meals_Bf10 = ranked_meals_Bf10.reset_index(drop=True)  # Reset the index after dropping rows
            if ranked_meals_Dn10.empty:
                print(f"No more meals found.")
                break
        else:
            print("Invalid input. Please enter 'yes' or 'no'.")


def rec_Snack():
    global tdee_Snack
    global diet
    # Define the conditions
    condition_column = "dishTypes"
    condition_value = "snack"
    excludes = ['q']
    # Ask the user about their dietary preference
    # user_diet_preference = input("Are you on a specific diet? (yes/no): ").lower()

    # Read the CSV file into a pandas DataFrame
    df = pd.read_csv('newfood.csv')

    # Check if the condition column exists in the DataFrame
    if condition_column not in df.columns:
        print(f"Error: {condition_column} column not found.")
    else:
        # Filter the DataFrame based on the conditions and print the result
        filtered_df = df[(df[condition_column] == condition_value) & (
            ~df['ingredients'].str.lower().str.contains('|'.join(excludes)))]

        # Additional filter for vegan meals if the user is vegan
        if diet != "None":
            # diet = input("Please write your diet: (vegan/vegetarian/glutenFree/dairyFree/sustainable/lowFodMap/ketogenic/whole30)")
            filtered_df = filtered_df[filtered_df[diet] == True]
        else:
            print("")

        while not filtered_df.empty:
            random_meal = filtered_df.sample(n=1)  # Select one random row from the DataFrame
            if diet != "None":
                random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Snack / random_meal['calories']
                print(random_meal[['title', 'dishTypes', diet, 'weightPerServing']])
            elif diet == "None":
                random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Snack / random_meal['calories']
                print(random_meal[['title', 'dishTypes', 'weightPerServing']])
            # Ask the user if they like the meal
            user_input = input("Do you like this meal? (yes/no): ").lower()
            if user_input == 'yes':
                break  # Exit the loop if the user likes the meal
            elif user_input == 'no':
                filtered_df = filtered_df.drop(random_meal.index)  # Remove the disliked meal from the DataFrame
            if filtered_df.empty:
                print(f"No more meals found for {condition_column} = {condition_value}.")
                break
            else:
                print("Invalid input. Please enter 'yes' or 'no'.")
        else:
            print(f"No records found for {condition_column} = {condition_value}.")


def rec_Fav_Snack():
    global diet
    global ranked_meals_Sn
    global tdee_Snack

    # user_diet_preference = input("Are you on a specific diet? (yes/no): ").lower()

    # Additional filter for vegan meals if the user is vegan
    if diet:
        # diet = input("Please write your diet: (vegan/vegetarian/glutenFree/dairyFree/sustainable/lowFodMap/ketogenic/whole30)")
        ranked_meals_Sn = ranked_meals_Sn[ranked_meals_Sn[diet] == True]

    ranked_meals_Sn10 = ranked_meals_Sn.head(10)
    print(ranked_meals_Sn10)

    while not ranked_meals_Sn10.empty:
        random_meal = ranked_meals_Sn10.sample(n=1).iloc[0]  # Select one random row from the DataFrame

        # Adjust the following code to handle DataFrame columns appropriately
        if diet != "None":
            random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Snack / random_meal['calories']
            print(random_meal[['title', 'dishTypes', diet, 'weightPerServing', 'preference_score']])
        elif diet == "None":
            random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Snack / random_meal['calories']
            print(random_meal[['title', 'dishTypes', 'weightPerServing', "preference_score"]])

        # Ask the user if they like the meal
        user_input = input("Do you like this meal? (yes/no): ").lower()
        if user_input == 'yes':
            break  # Exit the loop if the user likes the meal
        elif user_input == 'no':
            # ranked_meals_Bf10 = ranked_meals_Bf10.drop(ranked_meals_Bf10.index[random_meal.index],axis=0)  # Remove the disliked meal from the DataFrame
            # ranked_meals_Bf10 = ranked_meals_Bf10.reset_index(drop=True)  # Reset the index after dropping rows
            if ranked_meals_Sn10.empty:
                print(f"No more meals found.")
                break
        else:
            print("Invalid input. Please enter 'yes' or 'no'.")

def generate_one_plan(tdee, meals):
    tdee = float(tdee)
    tdee_Breakfast = tdee * 25 /100
    tdee_Lunch = tdee * 40 /100
    tdee_Dinner = tdee * 25 /100
    tdee_Snack = tdee * 10 /100

    # Generate plans for each meal type (e.g., breakfast, lunch, dinner)
    for meal_type in ["salad", "lunch", "dinner", "snack"]:

        # Read the CSV file into a pandas DataFrame
        df = pd.DataFrame(meals)
        while not df.empty:
            random_meal = df.sample(n=1)  # Select one random row from the DataFrame
            if meal_type == "salad":
                random_meal['weightPerServing'] = float(random_meal['weightPerServing']) * tdee_Breakfast / float(random_meal['calories'])
                salad = "{}_{}".format(str(random_meal['id'].iloc[0]), str(random_meal['weightPerServing'].iloc[0]))

            elif meal_type == "lunch":
                random_meal['weightPerServing'] = float(random_meal['weightPerServing']) * tdee_Lunch / float(random_meal['calories'])
                lunch ="{}_{}".format(str(random_meal['id'].iloc[0]), str(random_meal['weightPerServing'].iloc[0]))

            elif meal_type == "dinner":
                random_meal['weightPerServing'] = float(random_meal['weightPerServing']) * tdee_Dinner / float(random_meal['calories'])
                dinner = "{}_{}".format(str(random_meal['id'].iloc[0]), str(random_meal['weightPerServing'].iloc[0]))

            elif meal_type == "snack":
                random_meal['weightPerServing'] = float(random_meal['weightPerServing']) * tdee_Snack / float(random_meal['calories'])
                snack = "{}_{}".format(str(random_meal['id'].iloc[0]), str(random_meal['weightPerServing'].iloc[0]))

            break  # Exit the loop if the user likes the meal
        else:
            if meal_type == "salad":
                salad = salad + "null"

            elif meal_type == "lunch":
                lunch = lunch +"null"

            elif meal_type == "dinner":
                dinner = dinner + "null"

            elif meal_type == "snack":
                snack = snack + "null"

    # Create Object and send to server
    value = ",".join([salad, lunch, dinner, snack])
    print(value)


"""
    This function generates a weekly meal plan based on the user's dietary preferences and daily caloric intake.
    Parameters:
    -----------
    diet: str
        The user's dietary preferences, e.g., vegan, vegetarian, etc.
    tdee_Breakfast: float
        The user's daily total energy expenditure (TDEE) for breakfast
    tdee_Lunch: float
        The user's daily total energy expenditure (TDEE) for lunch
    tdee_Dinner: float
        The user's daily total energy expenditure (TDEE) for dinner
    tdee_Snack: float
        The user's daily total energy expenditure (TDEE) for snacks

    Returns:
    --------
    None
"""

def generate_weekly_plans():
    global tdee_Breakfast
    global tdee_Lunch
    global tdee_Dinner
    global tdee_Snack
    # global diet

    # user_diet_preference = input("Are you on a specific diet? (yes/no): ").lower()
    # diet = None

    # Assuming we want to generate plans for each day of the week (e.g., breakfast, lunch, dinner)
    for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]:
        print(f"\n{day} Plan:")

        # Generate plans for each meal type (e.g., breakfast, lunch, dinner)
        for meal_type in ["salad", "lunch", "dinner", "snack"]:
            condition_column = "dishTypes"
            condition_value = meal_type
            excludes = ['q']

            # Read the CSV file into a pandas DataFrame
            df = pd.read_csv('newfood.csv')

            # Check if the condition column exists in the DataFrame
            if condition_column not in df.columns:
                print(f"Error: {condition_column} column not found.")
            else:

                if condition_value == "dinner" or condition_value == "lunch":
                    # Filter the DataFrame based on the conditions and print the result
                    filtered_df = df[(df[condition_column] == "lunch,dinner") & (
                        ~df['ingredients'].str.lower().str.contains('|'.join(excludes)))]
                else:
                    # Filter the DataFrame based on the conditions and print the result
                    filtered_df = df[(df[condition_column] == condition_value) & (
                        ~df['ingredients'].str.lower().str.contains('|'.join(excludes)))]

                # Apply the dietary preference filter
                if diet != "None":
                    filtered_df = filtered_df[filtered_df[diet] == True]

                while not filtered_df.empty:
                    random_meal = filtered_df.sample(n=1)  # Select one random row from the DataFrame
                    if diet != "None":
                        if meal_type == "salad":
                            random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Breakfast / \
                                                              random_meal['calories']
                            print(random_meal[['title', 'dishTypes', diet, 'weightPerServing']])
                        elif meal_type == "lunch":
                            random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Lunch / \
                                                              random_meal['calories']
                            print(random_meal[['title', 'dishTypes', diet, 'weightPerServing']])
                        elif meal_type == "dinner":
                            random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Dinner / \
                                                              random_meal['calories']
                            print(random_meal[['title', 'dishTypes', diet, 'weightPerServing']])
                        elif meal_type == "snack":
                            random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Snack / \
                                                              random_meal['calories']
                            print(random_meal[['title', 'dishTypes', diet, 'weightPerServing']])

                    elif diet == 'None':
                        if meal_type == "salad":
                            random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Breakfast / \
                                                              random_meal['calories']
                            print(random_meal[['title', 'dishTypes', 'weightPerServing']])
                        elif meal_type == "lunch":
                            random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Lunch / \
                                                              random_meal['calories']
                            print(random_meal[['title', 'dishTypes', 'weightPerServing']])
                        elif meal_type == "dinner":
                            random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Dinner / \
                                                              random_meal['calories']
                            print(random_meal[['title', 'dishTypes', 'weightPerServing']])
                        elif meal_type == "snack":
                            random_meal['weightPerServing'] = random_meal['weightPerServing'] * tdee_Snack / \
                                                              random_meal['calories']
                            print(random_meal[['title', 'dishTypes', 'weightPerServing']])

                    # Ask the user if they like the meal
                    user_input = input("Do you like this meal? (yes/no): ").lower()
                    if user_input == 'yes':
                        break  # Exit the loop if the user likes the meal
                    elif user_input == 'no':
                        filtered_df = filtered_df.drop(random_meal.index)  # Remove the disliked meal from the DataFrame
                        if filtered_df.empty:
                            print(f"No more meals found for {condition_column} = {condition_value}.")
                            break
                    else:
                        print("Invalid input. Please enter 'yes' or 'no'.")
                else:
                    print(f"No records found for {condition_column} = {condition_value}.")


# Check the command-line argument to determine which function to call
if __name__ == "__main__":
    # Get the function name from command-line arguments
    function_name = sys.argv[1]

    # Call the appropriate function based on the provided argument
    if function_name == 'calculate_tdee':
        # Extract parameters from command-line arguments
        age = sys.argv[2]
        weight = sys.argv[3]
        height = sys.argv[4]
        gender = sys.argv[5]
        activity_level = sys.argv[6]
        goal = sys.argv[7]
        calorie_adjustment = sys.argv[8]

        # Call calculate_tdee function
        result = calculate_tdee(
            age=age,
            weight=weight,
            height=height,
            gender=gender,
            activity_level=activity_level,
            goal=goal,
            calorie_adjustment=calorie_adjustment
        )
    elif function_name == 'rank_meals':
        # Extract preferred ingredients from command-line arguments
        preferred_ingredients = sys.argv[2]
        preferred_ingredients = preferred_ingredients.split(',')
        excludes = sys.argv[3]
        excludes = excludes.split(',')
        dietType = sys.argv[4]
        meals = sys.stdin.read()
        meals = json.loads(meals)
        # Call rank_meals function
        rank_meals(preferred_ingredients=preferred_ingredients, dietType= dietType,meals=meals)
    elif function_name == 'rank_meals_csv':
        # Extract preferred ingredients from command-line arguments
        preferred_ingredients = sys.argv[2]
        preferred_ingredients = preferred_ingredients.split(',')
        excludes = sys.argv[3]
        excludes = excludes.split(',')
        dietType = sys.argv[4]
        # Call rank_meals function
        result = rank_meals_csv(preferred_ingredients=preferred_ingredients, excludes=excludes, dietType=dietType)
    elif function_name == 'rec_fav_br':
        # Call rev_fav_br function
        result = rec_Fav_Breakfast()
    
    elif function_name == 'generate_one_plan': 
        # Call the generate_one_plan function
        meals = sys.stdin.readline()
        meals = json.loads(meals)
        userInformation = sys.stdin.readline()
        userInformation = json.loads(userInformation)
        TDEE = calculate_tdee(weight=float(userInformation['weight']), height=float(userInformation['height']), age=float(userInformation['age']), gender=userInformation['gender'].lower(), activity_level= userInformation['activity'].lower(), goal=userInformation['goal'])
        generate_one_plan(tdee=TDEE, meals=meals)
    else:
        result = "Invalid function name"
