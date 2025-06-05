#!/usr/bin/env python3
"""
Unit tests for PopupGenius analysis tools
"""

import unittest
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from tools.popup import analyze_popup_history
from tools.transaction import analyze_transaction_data
from tools.competitor import analyze_competitors


class TestPopupAnalysis(unittest.TestCase):
    """Test popup performance analysis tool"""
    
    def test_analyze_popup_history_basic(self):
        """Test basic popup history analysis"""
        result = analyze_popup_history("baseball equipment store")
        
        self.assertIsInstance(result, dict)
        self.assertIn("analysis_type", result)
        self.assertIn("current_metrics", result)
        self.assertIn("key_insights", result)
        self.assertIn("optimization_opportunities", result)
        self.assertIn("projected_improvements", result)
        
        # Check specific content
        self.assertEqual(result["analysis_type"], "Historical Popup Performance Analysis")
        self.assertGreater(len(result["key_insights"]), 0)
        self.assertGreater(len(result["optimization_opportunities"]), 0)
    
    def test_analyze_popup_history_baseball_specific(self):
        """Test baseball-specific insights"""
        result = analyze_popup_history("baseball equipment store ProVelocity")
        
        insights = result["key_insights"]
        insights_text = " ".join(insights)
        
        # Should contain baseball-specific insights
        self.assertIn("baseball", insights_text.lower())
        self.assertIn("sport", insights_text.lower())
    
    def test_analyze_popup_history_metrics(self):
        """Test that all metrics are properly formatted"""
        result = analyze_popup_history("test store")
        
        metrics = result["current_metrics"]
        self.assertIn("%", metrics["conversion_rate"])
        self.assertIn("$", metrics["monthly_revenue"])
        self.assertIn("%", metrics["industry_benchmark"])
        
        projections = result["projected_improvements"]
        self.assertIn("%", projections["conversion_rate_target"])
        self.assertIn("$", projections["revenue_increase_monthly"])
        self.assertIn("$", projections["revenue_increase_annual"])


class TestTransactionAnalysis(unittest.TestCase):
    """Test transaction pattern analysis tool"""
    
    def test_analyze_transaction_data_basic(self):
        """Test basic transaction analysis"""
        result = analyze_transaction_data("e-commerce store")
        
        self.assertIsInstance(result, dict)
        self.assertIn("analysis_type", result)
        self.assertIn("transaction_summary", result)
        self.assertIn("behavioral_insights", result)
        self.assertIn("optimization_strategies", result)
        self.assertIn("revenue_projections", result)
        
        # Check specific content
        self.assertEqual(result["analysis_type"], "Transaction Pattern Analysis")
        self.assertGreater(len(result["behavioral_insights"]), 0)
        self.assertGreater(len(result["optimization_strategies"]), 0)
    
    def test_analyze_transaction_data_baseball_insights(self):
        """Test baseball-specific transaction insights"""
        result = analyze_transaction_data("baseball equipment store")
        
        insights = result["behavioral_insights"]
        insights_text = " ".join(insights)
        
        # Should contain baseball-specific insights
        self.assertIn("baseball", insights_text.lower())
        self.assertTrue(any("$400+" in insight for insight in insights))
    
    def test_analyze_transaction_data_revenue_format(self):
        """Test revenue projections are properly formatted"""
        result = analyze_transaction_data("test store")
        
        projections = result["revenue_projections"]
        self.assertIn("$", projections["current_popup_contribution"])
        self.assertIn("$", projections["optimization_potential"])
        self.assertIn("$", projections["annual_projection"])
        self.assertIn("x", projections["roi_multiplier"])


class TestCompetitorAnalysis(unittest.TestCase):
    """Test competitive intelligence analysis tool"""
    
    def test_analyze_competitors_basic(self):
        """Test basic competitor analysis"""
        result = analyze_competitors("e-commerce store")
        
        self.assertIsInstance(result, dict)
        self.assertIn("analysis_type", result)
        self.assertIn("market_overview", result)
        self.assertIn("market_trends", result)
        self.assertIn("competitive_opportunities", result)
        self.assertIn("strategic_recommendations", result)
        
        # Check specific content
        self.assertEqual(result["analysis_type"], "Competitive Intelligence Analysis")
        self.assertGreater(len(result["market_trends"]), 0)
        self.assertGreater(len(result["competitive_opportunities"]), 0)
    
    def test_analyze_competitors_sports_industry(self):
        """Test sports equipment industry analysis"""
        result = analyze_competitors("baseball equipment store", "sports_equipment")
        
        overview = result["market_overview"]
        self.assertIn("Sports Equipment", overview["industry"])
        self.assertEqual(overview["competitors_analyzed"], 12)
        
        trends = result["market_trends"]
        trends_text = " ".join(trends)
        self.assertIn("urgency", trends_text.lower())
    
    def test_analyze_competitors_fashion_industry(self):
        """Test fashion industry analysis"""
        result = analyze_competitors("fashion boutique", "fashion")
        
        overview = result["market_overview"]
        self.assertIn("Fashion", overview["industry"])
        self.assertEqual(overview["competitors_analyzed"], 15)
    
    def test_analyze_competitors_auto_detection(self):
        """Test automatic industry detection from description"""
        # Test baseball detection
        result = analyze_competitors("I sell baseball bats and sports equipment")
        self.assertIn("Sports Equipment", result["market_overview"]["industry"])
        
        # Test fashion detection
        result = analyze_competitors("boutique selling dresses and clothing")
        self.assertIn("Fashion", result["market_overview"]["industry"])
        
        # Test software detection
        result = analyze_competitors("SaaS platform for businesses")
        self.assertIn("Software", result["market_overview"]["industry"])
    
    def test_analyze_competitors_opportunities_structure(self):
        """Test competitive opportunities structure"""
        result = analyze_competitors("test store")
        
        opportunities = result["competitive_opportunities"]
        self.assertGreater(len(opportunities), 0)
        
        for opp in opportunities:
            self.assertIn("gap", opp)
            self.assertIn("market_penetration", opp)
            self.assertIn("implementation", opp)
            self.assertIn("projected_advantage", opp)


class TestToolsIntegration(unittest.TestCase):
    """Test tools working together"""
    
    def test_all_tools_with_baseball_input(self):
        """Test all tools with consistent baseball equipment input"""
        description = "ProVelocity baseball equipment store selling $495 training bats"
        
        popup_result = analyze_popup_history(description)
        transaction_result = analyze_transaction_data(description)
        competitor_result = analyze_competitors(description)
        
        # All should return valid results
        self.assertIsInstance(popup_result, dict)
        self.assertIsInstance(transaction_result, dict)
        self.assertIsInstance(competitor_result, dict)
        
        # All should contain business-relevant insights
        popup_text = str(popup_result)
        transaction_text = str(transaction_result)
        competitor_text = str(competitor_result)
        
        for text in [popup_text, transaction_text, competitor_text]:
            # Should contain dollar amounts or percentages
            self.assertTrue("$" in text or "%" in text)
    
    def test_tools_error_handling(self):
        """Test tools handle edge cases gracefully"""
        # Empty input
        popup_result = analyze_popup_history("")
        transaction_result = analyze_transaction_data("")
        competitor_result = analyze_competitors("")
        
        # Should still return valid results
        self.assertIsInstance(popup_result, dict)
        self.assertIsInstance(transaction_result, dict)
        self.assertIsInstance(competitor_result, dict)
        
        # Very long input
        long_description = "business " * 1000
        popup_result = analyze_popup_history(long_description)
        self.assertIsInstance(popup_result, dict)


if __name__ == "__main__":
    # Run tests with verbose output
    unittest.main(verbosity=2)