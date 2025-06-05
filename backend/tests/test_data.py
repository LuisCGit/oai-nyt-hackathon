#!/usr/bin/env python3
"""
Tests for data handling and mock data integrity
"""

import unittest
import json
import csv
import os
import sys

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


class TestMockData(unittest.TestCase):
    """Test mock data files and integrity"""
    
    def setUp(self):
        """Set up file paths"""
        self.base_dir = os.path.dirname(os.path.dirname(__file__))
        self.data_dir = os.path.join(self.base_dir, 'data')
        self.popup_data_file = os.path.join(self.data_dir, 'mock_popup_data.json')
        self.transaction_data_file = os.path.join(self.data_dir, 'mock_transaction_data.csv')
    
    def test_data_directory_exists(self):
        """Test data directory exists"""
        self.assertTrue(os.path.exists(self.data_dir))
        self.assertTrue(os.path.isdir(self.data_dir))
    
    def test_popup_data_file_exists(self):
        """Test popup data file exists and is valid JSON"""
        self.assertTrue(os.path.exists(self.popup_data_file))
        
        with open(self.popup_data_file, 'r') as f:
            data = json.load(f)
        
        # Should be a dict with expected structure
        self.assertIsInstance(data, dict)
        self.assertIn('response', data)
        
        response = data['response']
        self.assertIn('optin_rate_pct', response)
        self.assertIn('popup_sales', response)
        self.assertIn('popup_conversion_rate', response)
        self.assertIn('list_growth', response)
    
    def test_popup_data_metrics(self):
        """Test popup data has realistic metrics"""
        with open(self.popup_data_file, 'r') as f:
            data = json.load(f)
        
        response = data['response']
        
        # Check metric ranges
        self.assertGreater(response['optin_rate_pct'], 0)
        self.assertLess(response['optin_rate_pct'], 100)
        
        self.assertGreater(response['popup_sales'], 0)
        self.assertGreater(response['popup_conversion_rate'], 0)
        self.assertGreater(response['list_growth'], 0)
    
    def test_popup_data_time_series(self):
        """Test popup data has time series data"""
        with open(self.popup_data_file, 'r') as f:
            data = json.load(f)
        
        response = data['response']
        
        # Should have time series data
        self.assertIn('optin_rate_over_time', response)
        time_series = response['optin_rate_over_time']
        
        self.assertIsInstance(time_series, list)
        self.assertGreater(len(time_series), 0)
        
        # Check first entry structure
        if time_series:
            entry = time_series[0]
            self.assertIn('date', entry)
            self.assertIn('metric_name', entry)
            self.assertIn('metric_value', entry)
    
    def test_transaction_data_file_exists(self):
        """Test transaction data file exists and is valid CSV"""
        self.assertTrue(os.path.exists(self.transaction_data_file))
        
        with open(self.transaction_data_file, 'r') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        
        # Should have data
        self.assertGreater(len(rows), 0)
        
        # Check expected columns
        if rows:
            first_row = rows[0]
            expected_columns = [
                'product_id', 'product_name', 'price', 
                'units_sold_30d', 'gross_sales_30d',
                'units_sold_14d', 'gross_sales_14d'
            ]
            
            for col in expected_columns:
                self.assertIn(col, first_row)
    
    def test_transaction_data_values(self):
        """Test transaction data has realistic values"""
        with open(self.transaction_data_file, 'r') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        
        # Check data integrity
        for row in rows:
            # Price should be numeric and positive
            price = float(row['price'])
            self.assertGreater(price, 0)
            
            # Units sold should be non-negative integers
            units_30d = int(row['units_sold_30d'])
            units_14d = int(row['units_sold_14d'])
            self.assertGreaterEqual(units_30d, 0)
            self.assertGreaterEqual(units_14d, 0)
            
            # 14-day should be <= 30-day
            self.assertLessEqual(units_14d, units_30d)
            
            # Revenue calculations should make sense
            expected_revenue_30d = price * units_30d
            actual_revenue_30d = float(row['gross_sales_30d'])
            self.assertAlmostEqual(expected_revenue_30d, actual_revenue_30d, places=2)
    
    def test_transaction_data_baseball_products(self):
        """Test transaction data contains baseball products"""
        with open(self.transaction_data_file, 'r') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        
        # Should have baseball-related products
        product_names = [row['product_name'].lower() for row in rows]
        baseball_terms = ['baseball', 'bat', 'training', 'provelocity']
        
        found_baseball = any(
            any(term in name for term in baseball_terms)
            for name in product_names
        )
        
        self.assertTrue(found_baseball, "Should contain baseball-related products")
    
    def test_high_value_products_exist(self):
        """Test data contains high-value products for testing"""
        with open(self.transaction_data_file, 'r') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        
        # Should have products over $400 for high-value analysis
        high_value_products = [
            row for row in rows 
            if float(row['price']) >= 400
        ]
        
        self.assertGreater(len(high_value_products), 0, 
                          "Should have products over $400 for analysis")


class TestDataConsistency(unittest.TestCase):
    """Test data consistency across different tools"""
    
    def test_popup_and_transaction_data_alignment(self):
        """Test popup and transaction data are aligned"""
        # Load both datasets
        popup_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                 'data', 'mock_popup_data.json')
        transaction_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                       'data', 'mock_transaction_data.csv')
        
        with open(popup_file, 'r') as f:
            popup_data = json.load(f)
        
        with open(transaction_file, 'r') as f:
            reader = csv.DictReader(f)
            transaction_rows = list(reader)
        
        # Calculate total transaction revenue
        total_transaction_revenue = sum(
            float(row['gross_sales_30d']) for row in transaction_rows
        )
        
        # Popup sales should be reasonable portion of total
        popup_sales = popup_data['response']['popup_sales']
        popup_percentage = (popup_sales / total_transaction_revenue) * 100
        
        # Popup contribution should be between 10-50% (realistic range)
        self.assertGreater(popup_percentage, 5, 
                          "Popup sales should be meaningful portion of total")
        self.assertLess(popup_percentage, 60, 
                       "Popup sales shouldn't exceed realistic proportion")
    
    def test_data_supports_analysis_tools(self):
        """Test data supports all analysis scenarios"""
        transaction_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                       'data', 'mock_transaction_data.csv')
        
        with open(transaction_file, 'r') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        
        # Should have variety of price points
        prices = [float(row['price']) for row in rows]
        min_price = min(prices)
        max_price = max(prices)
        
        self.assertGreater(max_price / min_price, 5, 
                          "Should have good price range for analysis")
        
        # Should have products with different sales volumes
        volumes = [int(row['units_sold_30d']) for row in rows]
        self.assertGreater(max(volumes), min(volumes) * 2, 
                          "Should have variety in sales volumes")


class TestTemplateData(unittest.TestCase):
    """Test template and configuration data"""
    
    def test_popup_template_exists(self):
        """Test popup HTML template exists"""
        template_file = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), 
            'src', 'templates', 'popup_template.html'
        )
        
        self.assertTrue(os.path.exists(template_file))
        
        # Read and check basic structure
        with open(template_file, 'r') as f:
            content = f.read()
        
        # Should be valid HTML
        self.assertIn('<!DOCTYPE html>', content)
        self.assertIn('<html', content)
        self.assertIn('</html>', content)
        
        # Should have popup-specific classes
        self.assertIn('popup-overlay', content)
        self.assertIn('popup-container', content)
        self.assertIn('popup-cta', content)
    
    def test_template_responsiveness(self):
        """Test template has responsive design"""
        template_file = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), 
            'src', 'templates', 'popup_template.html'
        )
        
        with open(template_file, 'r') as f:
            content = f.read()
        
        # Should have media queries for mobile
        self.assertIn('@media', content)
        self.assertIn('max-width', content)
        
        # Should have viewport meta tag
        self.assertIn('viewport', content)


if __name__ == "__main__":
    # Run tests with verbose output
    unittest.main(verbosity=2)