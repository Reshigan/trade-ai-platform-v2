import os
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import ElasticNet
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

class TradeAIPredictionModel:
    """
    Advanced prediction model for Trade AI platform that uses ensemble methods
    to forecast sales and promotional effectiveness.
    """
    
    def __init__(self, model_type="ensemble"):
        """
        Initialize the prediction model.
        
        Args:
            model_type (str): Type of model to use. Options: "ensemble", "random_forest", 
                             "gradient_boosting", "elastic_net"
        """
        self.model_type = model_type
        self.model = None
        self.feature_importance = {}
        self.metrics = {}
        self.preprocessor = None
        self.categorical_features = ['product_category', 'promo_type', 'region', 'channel']
        self.numerical_features = ['base_price', 'discount_percentage', 'avg_monthly_sales', 
                                  'sales_volatility', 'seasonality_index', 'competitor_intensity']
        
    def _create_preprocessor(self):
        """Create a preprocessor for the data"""
        numerical_transformer = Pipeline(steps=[
            ('scaler', StandardScaler())
        ])
        
        categorical_transformer = Pipeline(steps=[
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ])
        
        return ColumnTransformer(
            transformers=[
                ('num', numerical_transformer, self.numerical_features),
                ('cat', categorical_transformer, self.categorical_features)
            ])
    
    def _create_model(self):
        """Create the prediction model based on model_type"""
        if self.model_type == "random_forest":
            return RandomForestRegressor(
                n_estimators=100, 
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42
            )
        elif self.model_type == "gradient_boosting":
            return GradientBoostingRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            )
        elif self.model_type == "elastic_net":
            return ElasticNet(
                alpha=0.5,
                l1_ratio=0.5,
                random_state=42
            )
        else:  # ensemble
            return RandomForestRegressor(
                n_estimators=200, 
                max_depth=20,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42
            )
    
    def train(self, X, y, optimize=False):
        """
        Train the prediction model.
        
        Args:
            X (pd.DataFrame): Features dataframe
            y (pd.Series): Target variable
            optimize (bool): Whether to perform hyperparameter optimization
            
        Returns:
            dict: Training metrics
        """
        # Create preprocessor and model
        self.preprocessor = self._create_preprocessor()
        base_model = self._create_model()
        
        # Create full pipeline
        self.model = Pipeline(steps=[
            ('preprocessor', self.preprocessor),
            ('model', base_model)
        ])
        
        # Split data for training and validation
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Hyperparameter optimization if requested
        if optimize and self.model_type != "elastic_net":
            param_grid = {
                'model__n_estimators': [50, 100, 200],
                'model__max_depth': [5, 10, 15, 20],
                'model__min_samples_split': [2, 5, 10],
                'model__min_samples_leaf': [1, 2, 4]
            }
            
            grid_search = GridSearchCV(
                self.model,
                param_grid,
                cv=5,
                scoring='neg_mean_squared_error',
                n_jobs=-1
            )
            
            grid_search.fit(X_train, y_train)
            self.model = grid_search.best_estimator_
            print(f"Best parameters: {grid_search.best_params_}")
        else:
            # Train the model
            self.model.fit(X_train, y_train)
        
        # Evaluate on validation set
        y_pred = self.model.predict(X_val)
        
        # Calculate metrics
        self.metrics = {
            'mae': mean_absolute_error(y_val, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_val, y_pred)),
            'r2': r2_score(y_val, y_pred)
        }
        
        # Extract feature importance if available
        if hasattr(self.model.named_steps['model'], 'feature_importances_'):
            # Get feature names from preprocessor
            feature_names = (
                self.numerical_features +
                self.preprocessor.named_transformers_['cat'].named_steps['onehot'].get_feature_names_out(
                    self.categorical_features
                ).tolist()
            )
            
            # Map importances to feature names
            importances = self.model.named_steps['model'].feature_importances_
            self.feature_importance = dict(zip(feature_names, importances))
            
            # Sort by importance
            self.feature_importance = {k: v for k, v in sorted(
                self.feature_importance.items(), 
                key=lambda item: item[1], 
                reverse=True
            )}
        
        return self.metrics
    
    def predict(self, X):
        """
        Make predictions using the trained model.
        
        Args:
            X (pd.DataFrame): Features dataframe
            
        Returns:
            np.array: Predictions
        """
        if self.model is None:
            raise ValueError("Model has not been trained yet. Call train() first.")
        
        return self.model.predict(X)
    
    def predict_promotion_impact(self, product_data, promotion_details):
        """
        Predict the impact of a promotion on sales.
        
        Args:
            product_data (dict): Product data including historical sales
            promotion_details (dict): Details of the promotion
            
        Returns:
            dict: Prediction results including lift and ROI
        """
        # Extract features
        base_price = product_data.get('base_price', 0)
        avg_monthly_sales = product_data.get('avg_monthly_sales', 0)
        discount_percentage = promotion_details.get('discount_percentage', 0)
        promo_type = promotion_details.get('promo_type', 'Discount')
        
        # Create feature dataframe
        X_pred = pd.DataFrame({
            'base_price': [base_price],
            'discount_percentage': [discount_percentage],
            'avg_monthly_sales': [avg_monthly_sales],
            'sales_volatility': [product_data.get('sales_volatility', avg_monthly_sales * 0.2)],
            'seasonality_index': [product_data.get('seasonality_index', 1.0)],
            'competitor_intensity': [product_data.get('competitor_intensity', 0.5)],
            'product_category': [product_data.get('product_category', 'Unknown')],
            'promo_type': [promo_type],
            'region': [promotion_details.get('region', 'National')],
            'channel': [promotion_details.get('channel', 'Retail')]
        })
        
        # Make prediction
        predicted_sales = self.predict(X_pred)[0]
        
        # Calculate lift and ROI
        sales_lift = predicted_sales - avg_monthly_sales
        sales_lift_percentage = (sales_lift / avg_monthly_sales) * 100 if avg_monthly_sales > 0 else 0
        
        # Calculate ROI
        promo_cost = promotion_details.get('promo_cost', 0)
        product_margin = product_data.get('margin_percentage', 0.3)
        incremental_margin = sales_lift * base_price * product_margin
        roi = (incremental_margin / promo_cost) * 100 if promo_cost > 0 else 0
        
        return {
            'product': product_data.get('product_name', 'Unknown'),
            'baseline_sales': avg_monthly_sales,
            'predicted_sales': predicted_sales,
            'sales_lift': sales_lift,
            'sales_lift_percentage': sales_lift_percentage,
            'promo_cost': promo_cost,
            'incremental_margin': incremental_margin,
            'roi': roi,
            'confidence': self._calculate_confidence(X_pred)
        }
    
    def _calculate_confidence(self, X):
        """
        Calculate prediction confidence based on data similarity to training set.
        This is a simplified implementation.
        
        Args:
            X (pd.DataFrame): Features for prediction
            
        Returns:
            float: Confidence score between 0 and 1
        """
        # Simplified confidence calculation
        # In a real implementation, this would use more sophisticated methods
        base_confidence = 0.85
        
        # Adjust based on metrics
        if self.metrics:
            r2_factor = max(0, min(1, self.metrics.get('r2', 0)))
            base_confidence = 0.7 + (r2_factor * 0.3)
        
        return base_confidence
    
    def save_model(self, filepath):
        """
        Save the model to a file.
        
        Args:
            filepath (str): Path to save the model
        """
        import joblib
        
        model_data = {
            'model': self.model,
            'feature_importance': self.feature_importance,
            'metrics': self.metrics,
            'model_type': self.model_type,
            'categorical_features': self.categorical_features,
            'numerical_features': self.numerical_features,
            'timestamp': datetime.now().isoformat()
        }
        
        joblib.dump(model_data, filepath)
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath):
        """
        Load the model from a file.
        
        Args:
            filepath (str): Path to load the model from
        """
        import joblib
        
        model_data = joblib.load(filepath)
        
        self.model = model_data['model']
        self.feature_importance = model_data['feature_importance']
        self.metrics = model_data['metrics']
        self.model_type = model_data['model_type']
        self.categorical_features = model_data['categorical_features']
        self.numerical_features = model_data['numerical_features']
        
        print(f"Model loaded from {filepath}")
        
    def generate_feature_importance_report(self):
        """
        Generate a report of feature importances.
        
        Returns:
            dict: Feature importance report
        """
        if not self.feature_importance:
            return {"error": "No feature importance available. Model may not support feature importance or has not been trained."}
        
        # Get top features
        top_features = {k: v for k, v in list(self.feature_importance.items())[:10]}
        
        # Group features by category
        grouped_features = {}
        for feature, importance in self.feature_importance.items():
            category = None
            
            # Determine category based on feature name
            if feature in self.numerical_features:
                category = "numerical"
            else:
                # For one-hot encoded features, extract the original category
                for cat_feature in self.categorical_features:
                    if cat_feature in feature:
                        category = cat_feature
                        break
                
                if category is None:
                    category = "other"
            
            if category not in grouped_features:
                grouped_features[category] = {}
            
            grouped_features[category][feature] = importance
        
        # Calculate total importance by category
        category_importance = {}
        for category, features in grouped_features.items():
            category_importance[category] = sum(features.values())
        
        # Sort by importance
        category_importance = {k: v for k, v in sorted(
            category_importance.items(), 
            key=lambda item: item[1], 
            reverse=True
        )}
        
        return {
            "top_features": top_features,
            "category_importance": category_importance,
            "all_features": self.feature_importance,
            "model_metrics": self.metrics
        }


# Example usage
if __name__ == "__main__":
    # Create sample data
    np.random.seed(42)
    
    # Sample data
    n_samples = 1000
    
    # Create features
    data = {
        'base_price': np.random.uniform(10, 100, n_samples),
        'discount_percentage': np.random.uniform(0, 30, n_samples),
        'avg_monthly_sales': np.random.uniform(1000, 10000, n_samples),
        'sales_volatility': np.random.uniform(100, 2000, n_samples),
        'seasonality_index': np.random.uniform(0.7, 1.3, n_samples),
        'competitor_intensity': np.random.uniform(0, 1, n_samples),
        'product_category': np.random.choice(['Beverage', 'Snack', 'Condiment'], n_samples),
        'promo_type': np.random.choice(['Discount', 'BOGO', 'Bundle'], n_samples),
        'region': np.random.choice(['North', 'South', 'East', 'West'], n_samples),
        'channel': np.random.choice(['Retail', 'Wholesale', 'Online'], n_samples)
    }
    
    # Create target
    # Simple model: higher discount = higher sales, higher price = lower sales
    base_sales = data['avg_monthly_sales']
    discount_effect = data['discount_percentage'] * 50
    price_effect = data['base_price'] * -10
    seasonality_effect = (data['seasonality_index'] - 1) * 1000
    
    # Add promo type effect
    promo_effect = np.zeros(n_samples)
    promo_effect[data['promo_type'] == 'BOGO'] = 500
    promo_effect[data['promo_type'] == 'Bundle'] = 300
    
    # Create target with some noise
    target = base_sales + discount_effect + price_effect + seasonality_effect + promo_effect
    target = target + np.random.normal(0, 500, n_samples)
    
    # Create dataframe
    df = pd.DataFrame(data)
    df['sales'] = target
    
    # Train model
    model = TradeAIPredictionModel(model_type="ensemble")
    metrics = model.train(df.drop('sales', axis=1), df['sales'], optimize=True)
    
    print(f"Model metrics: {metrics}")
    
    # Get feature importance
    importance_report = model.generate_feature_importance_report()
    print("\nTop features:")
    for feature, importance in list(importance_report['top_features'].items())[:5]:
        print(f"  {feature}: {importance:.4f}")
    
    # Make a prediction
    product_data = {
        'product_name': 'Test Product',
        'base_price': 50,
        'avg_monthly_sales': 5000,
        'sales_volatility': 1000,
        'seasonality_index': 1.1,
        'competitor_intensity': 0.7,
        'product_category': 'Beverage',
        'margin_percentage': 0.4
    }
    
    promotion_details = {
        'promo_type': 'Discount',
        'discount_percentage': 20,
        'region': 'South',
        'channel': 'Retail',
        'promo_cost': 2000
    }
    
    prediction = model.predict_promotion_impact(product_data, promotion_details)
    print("\nPromotion impact prediction:")
    for key, value in prediction.items():
        print(f"  {key}: {value}")
    
    # Save model
    model.save_model("test_model.joblib")