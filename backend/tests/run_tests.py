#!/usr/bin/env python3
"""
Test runner for PopupGenius test suite
Runs all tests and provides comprehensive reporting
"""

import unittest
import sys
import os
import time
from io import StringIO

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Import test modules
try:
    from tests.test_tools import *
    TOOLS_TESTS_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Tools tests not available: {e}")
    TOOLS_TESTS_AVAILABLE = False

try:
    from tests.test_data import *
    DATA_TESTS_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Data tests not available: {e}")
    DATA_TESTS_AVAILABLE = False

# Try to import optional test modules
try:
    from tests.test_agent import *
    AGENT_TESTS_AVAILABLE = True
except ImportError:
    AGENT_TESTS_AVAILABLE = False
    print("Warning: Agent tests not available")

try:
    from tests.test_api import *
    API_TESTS_AVAILABLE = True
except ImportError:
    API_TESTS_AVAILABLE = False
    print("Warning: API tests not available")


class ColoredTextTestResult(unittest.TextTestResult):
    """Enhanced test result with colors and better formatting"""
    
    def __init__(self, stream, descriptions, verbosity):
        super().__init__(stream, descriptions, verbosity)
        self.success_count = 0
        self.verbosity = verbosity
    
    def addSuccess(self, test):
        super().addSuccess(test)
        self.success_count += 1
        if self.verbosity > 1:
            self.stream.write("✅ PASS: ")
            self.stream.writeln(self.getDescription(test))
    
    def addError(self, test, err):
        super().addError(test, err)
        if self.verbosity > 1:
            self.stream.write("❌ ERROR: ")
            self.stream.writeln(self.getDescription(test))
    
    def addFailure(self, test, err):
        super().addFailure(test, err)
        if self.verbosity > 1:
            self.stream.write("❌ FAIL: ")
            self.stream.writeln(self.getDescription(test))
    
    def addSkip(self, test, reason):
        super().addSkip(test, reason)
        if self.verbosity > 1:
            self.stream.write("⏭️  SKIP: ")
            self.stream.write(self.getDescription(test))
            self.stream.writeln(f" ({reason})")


class PopupGeniusTestRunner:
    """Custom test runner for PopupGenius"""
    
    def __init__(self):
        self.start_time = None
        self.test_categories = {
            'core_tools': 'Core Analysis Tools',
            'data_integrity': 'Data Integrity', 
            'agent_functionality': 'Agent Functionality',
            'api_endpoints': 'API Endpoints'
        }
    
    def run_category(self, category_name, test_classes):
        """Run tests for a specific category"""
        print(f"\n🧪 Testing {category_name}")
        print("=" * 60)
        
        suite = unittest.TestSuite()
        for test_class in test_classes:
            tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
            suite.addTests(tests)
        
        runner = unittest.TextTestRunner(
            resultclass=ColoredTextTestResult,
            verbosity=2,
            stream=sys.stdout
        )
        
        result = runner.run(suite)
        return result
    
    def print_summary(self, all_results):
        """Print comprehensive test summary"""
        total_tests = sum(r.testsRun for r in all_results)
        total_failures = sum(len(r.failures) for r in all_results)
        total_errors = sum(len(r.errors) for r in all_results)
        total_skipped = sum(len(r.skipped) for r in all_results)
        total_success = total_tests - total_failures - total_errors - total_skipped
        
        elapsed = time.time() - self.start_time
        
        print("\n" + "="*80)
        print("🎯 POPUPGENIUS TEST SUMMARY")
        print("="*80)
        
        print(f"⏱️  Total Time: {elapsed:.2f}s")
        print(f"📊 Total Tests: {total_tests}")
        print(f"✅ Passed: {total_success}")
        print(f"❌ Failed: {total_failures}")
        print(f"💥 Errors: {total_errors}")
        print(f"⏭️  Skipped: {total_skipped}")
        
        # Calculate success rate
        if total_tests > 0:
            success_rate = (total_success / total_tests) * 100
            print(f"📈 Success Rate: {success_rate:.1f}%")
            
            if success_rate >= 90:
                print("🏆 EXCELLENT: PopupGenius is ready for demo!")
            elif success_rate >= 75:
                print("✅ GOOD: PopupGenius is mostly functional")
            elif success_rate >= 50:
                print("⚠️  NEEDS WORK: Some critical issues found")
            else:
                print("🚨 CRITICAL: Major issues need fixing")
        
        # Environment info
        print(f"\n🔧 Environment:")
        print(f"   Python: {sys.version.split()[0]}")
        print(f"   OpenAI Key: {'✅ Set' if os.getenv('OPENAI_API_KEY') else '❌ Missing'}")
        print(f"   Agent Tests: {'✅ Available' if AGENT_TESTS_AVAILABLE else '❌ Skipped'}")
        print(f"   API Tests: {'✅ Available' if API_TESTS_AVAILABLE else '❌ Skipped'}")
        
        return total_failures == 0 and total_errors == 0
    
    def run_all_tests(self):
        """Run the complete test suite"""
        self.start_time = time.time()
        
        print("🚀 POPUPGENIUS TEST SUITE")
        print("Testing AI-Powered E-Commerce Optimization Agent")
        print("="*80)
        
        all_results = []
        
        # Core tools tests (if available)
        if TOOLS_TESTS_AVAILABLE:
            result = self.run_category(
                self.test_categories['core_tools'],
                [TestPopupAnalysis, TestTransactionAnalysis, TestCompetitorAnalysis, TestToolsIntegration]
            )
            all_results.append(result)
        
        # Data integrity tests (if available)
        if DATA_TESTS_AVAILABLE:
            result = self.run_category(
                self.test_categories['data_integrity'], 
                [TestMockData, TestDataConsistency, TestTemplateData]
            )
            all_results.append(result)
        
        # Agent tests (if available)
        if AGENT_TESTS_AVAILABLE:
            result = self.run_category(
                self.test_categories['agent_functionality'],
                [TestPopupOptimizationAgent, TestAgentStreamFactory, TestAgentMockIntegration]
            )
            all_results.append(result)
        
        # API tests (if available)
        if API_TESTS_AVAILABLE:
            result = self.run_category(
                self.test_categories['api_endpoints'],
                [TestPopupGeniusAPI, TestWebSocketEndpoint, TestAPIModels, TestAPIIntegration]
            )
            all_results.append(result)
        
        # Print final summary
        success = self.print_summary(all_results)
        
        return success


def main():
    """Main test runner function"""
    # Check for help flag
    if '--help' in sys.argv or '-h' in sys.argv:
        print("""
PopupGenius Test Suite

Usage: python run_tests.py [options]

Options:
  -h, --help     Show this help message
  --quick        Run only core tool tests
  --data-only    Run only data integrity tests
  --verbose      Extra verbose output

Environment Variables:
  OPENAI_API_KEY    Required for agent functionality tests

Test Categories:
  Core Tools        Analysis tool functionality (always runs)
  Data Integrity    Mock data and template validation
  Agent             PopupOptimizationAgent functionality  
  API               FastAPI endpoint testing

Examples:
  python run_tests.py                    # Run all available tests
  python run_tests.py --quick           # Quick validation
  python run_tests.py --data-only       # Data validation only
        """)
        return
    
    # Quick mode - only core tools
    if '--quick' in sys.argv:
        print("🏃 Quick Test Mode - Core Tools Only")
        suite = unittest.TestSuite()
        for test_class in [TestPopupAnalysis, TestTransactionAnalysis, TestCompetitorAnalysis]:
            tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
            suite.addTests(tests)
        
        runner = unittest.TextTestRunner(verbosity=2)
        result = runner.run(suite)
        return result.wasSuccessful()
    
    # Data only mode
    if '--data-only' in sys.argv:
        print("📊 Data Integrity Test Mode")
        suite = unittest.TestSuite()
        for test_class in [TestMockData, TestDataConsistency, TestTemplateData]:
            tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
            suite.addTests(tests)
        
        runner = unittest.TextTestRunner(verbosity=2)
        result = runner.run(suite)
        return result.wasSuccessful()
    
    # Full test suite
    runner = PopupGeniusTestRunner()
    success = runner.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()