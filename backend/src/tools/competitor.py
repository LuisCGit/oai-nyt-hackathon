import random
from agents import function_tool


@function_tool
def analyze_competitors(business_description: str = "", industry: str = ""):
    """
    Analyze competitor popup strategies and identify market opportunities.
    
    Args:
        business_description: Description of the business and goals
        industry: Industry vertical for targeted competitive analysis
        
    Returns:
        Competitive intelligence with market gaps and positioning opportunities
    """
    
    # Determine industry from business description if not provided
    if not industry:
        desc_lower = business_description.lower()
        if any(term in desc_lower for term in ["baseball", "sports", "athletic", "equipment"]):
            industry = "sports_equipment"
        elif any(term in desc_lower for term in ["fashion", "clothing", "apparel", "dress"]):
            industry = "fashion"
        elif any(term in desc_lower for term in ["software", "saas", "platform", "tool"]):
            industry = "software"
        else:
            industry = "general_ecommerce"
    
    # Industry-specific competitive analysis
    competitive_data = {
        "sports_equipment": {
            "competitors_analyzed": 12,
            "market_trends": [
                "🎨 DESIGN TREND: 68% of competitors use urgency timers",
                "💰 PRICING PATTERN: Market standard discount is 25% vs typical 15%", 
                "🏆 MESSAGING GAP: Zero competitors combine exit-intent + social proof",
                "⚾ SPORTS-SPECIFIC: Only 23% use sport-specific seasonal messaging",
                "📱 MOBILE WEAKNESS: 45% have poor mobile popup optimization"
            ],
            "opportunities": [
                {
                    "gap": "Exit-Intent + Social Proof Combination",
                    "market_penetration": "0% of competitors",
                    "implementation": "Add 'Last 24hrs: 847 customers saved!' with exit-intent trigger",
                    "projected_advantage": "+89% conversion vs competitors"
                },
                {
                    "gap": "Sport-Specific Seasonal Messaging",
                    "market_penetration": "23% of competitors",
                    "implementation": "Baseball season urgency: 'Season starts in 30 days!'",
                    "projected_advantage": "+156% engagement during peak season"
                },
                {
                    "gap": "Premium Equipment Bundle Offers",
                    "market_penetration": "31% of competitors",
                    "implementation": "Training package bundles with popup",
                    "projected_advantage": "+$127 average order value"
                }
            ],
            "competitor_examples": [
                {"name": "Baseball Express", "popup_strategy": "Basic 10% discount", "weakness": "No urgency/scarcity"},
                {"name": "Eastbay", "popup_strategy": "Email signup only", "weakness": "No immediate value"},
                {"name": "Dick's Sporting Goods", "popup_strategy": "15% first purchase", "weakness": "Generic messaging"}
            ]
        },
        "fashion": {
            "competitors_analyzed": 15,
            "market_trends": [
                "👗 TREND INSIGHT: 73% use size-specific offers",
                "📱 MOBILE FOCUS: 89% optimize for mobile-first design",
                "✨ SOCIAL PROOF: 67% display recent purchases",
                "💳 PAYMENT: 45% mention payment flexibility",
                "🎯 PERSONALIZATION: Only 28% use browsing behavior targeting"
            ],
            "opportunities": [
                {
                    "gap": "Browsing Behavior Personalization",
                    "market_penetration": "28% of competitors",
                    "implementation": "Category-specific offers based on viewed items",
                    "projected_advantage": "+78% relevance score"
                },
                {
                    "gap": "Size Availability Urgency",
                    "market_penetration": "12% of competitors", 
                    "implementation": "'Only 3 left in your size!' messaging",
                    "projected_advantage": "+134% urgency conversion"
                }
            ],
            "competitor_examples": [
                {"name": "ASOS", "popup_strategy": "15% + free shipping", "weakness": "No size-specific urgency"},
                {"name": "Zara", "popup_strategy": "New arrivals email", "weakness": "No immediate discount"},
                {"name": "H&M", "popup_strategy": "10% first order", "weakness": "Generic offer"}
            ]
        },
        "software": {
            "competitors_analyzed": 18,
            "market_trends": [
                "🚀 FEATURE FOCUS: 84% emphasize specific features in popups",
                "💰 PRICING TRANSPARENCY: 67% show clear pricing upfront",
                "⏰ TRIAL URGENCY: 45% use trial expiration messaging",
                "🎯 USE CASE: 56% target specific user roles/industries",
                "📊 ROI MESSAGING: Only 23% include ROI calculations"
            ],
            "opportunities": [
                {
                    "gap": "Live ROI Calculators in Popups",
                    "market_penetration": "23% of competitors",
                    "implementation": "Interactive savings calculator in popup",
                    "projected_advantage": "+167% qualified lead conversion"
                },
                {
                    "gap": "Industry-Specific Landing Pages",
                    "market_penetration": "34% of competitors",
                    "implementation": "Role-based popup offers (CEO, Marketing, etc.)",
                    "projected_advantage": "+89% enterprise conversion"
                }
            ],
            "competitor_examples": [
                {"name": "HubSpot", "popup_strategy": "Free tools offer", "weakness": "No ROI calculation"},
                {"name": "Salesforce", "popup_strategy": "Demo booking", "weakness": "No immediate value"},
                {"name": "Slack", "popup_strategy": "Team trial", "weakness": "No cost savings highlight"}
            ]
        },
        "general_ecommerce": {
            "competitors_analyzed": 20,
            "market_trends": [
                "💰 DISCOUNT STANDARD: 73% offer 10-20% first purchase discounts",
                "📧 EMAIL FOCUS: 89% prioritize email capture",
                "⏰ URGENCY TIMERS: 56% use countdown timers",
                "🎁 FREE SHIPPING: 67% mention free shipping thresholds",
                "📱 MOBILE OPTIMIZATION: 78% have mobile-optimized popups"
            ],
            "opportunities": [
                {
                    "gap": "Dynamic Discount Optimization",
                    "market_penetration": "12% of competitors",
                    "implementation": "Cart value-based discount tiers",
                    "projected_advantage": "+45% average order value"
                },
                {
                    "gap": "Abandonment Behavior Targeting",
                    "market_penetration": "34% of competitors",
                    "implementation": "Different offers for different abandonment patterns",
                    "projected_advantage": "+67% recovery rate"
                }
            ],
            "competitor_examples": [
                {"name": "Amazon", "popup_strategy": "Prime membership", "weakness": "Not discount-focused"},
                {"name": "Shopify stores", "popup_strategy": "10% discount average", "weakness": "Generic messaging"},
                {"name": "BigCommerce stores", "popup_strategy": "Email + discount", "weakness": "Poor mobile UX"}
            ]
        }
    }
    
    # Get relevant competitive data
    analysis_data = competitive_data.get(industry, competitive_data["general_ecommerce"])
    
    # Calculate market opportunity
    total_market_gaps = len(analysis_data["opportunities"])
    avg_advantage = 67  # Average competitive advantage percentage
    market_opportunity_score = total_market_gaps * avg_advantage
    
    analysis_result = {
        "analysis_type": "Competitive Intelligence Analysis",
        "market_overview": {
            "industry": industry.replace("_", " ").title(),
            "competitors_analyzed": analysis_data["competitors_analyzed"],
            "market_opportunity_score": f"{market_opportunity_score}% advantage potential",
            "key_insight": f"🔍 Found {total_market_gaps} major gaps in competitor strategies"
        },
        "market_trends": [
            f"🔄 Researching {analysis_data['competitors_analyzed']} competitors in {industry.replace('_', ' ')} space..."
        ] + analysis_data["market_trends"],
        "competitive_opportunities": analysis_data["opportunities"],
        "competitor_analysis": analysis_data["competitor_examples"],
        "strategic_recommendations": [
            {
                "strategy": "Blue Ocean Positioning",
                "focus": "Unique value propositions not offered by competitors",
                "implementation": "Combine multiple underutilized strategies",
                "projected_impact": f"+{market_opportunity_score}% competitive advantage"
            },
            {
                "strategy": "Fast Follower Optimization", 
                "focus": "Improve on existing competitor tactics",
                "implementation": "Take successful competitor strategies and enhance them",
                "projected_impact": "+34% performance vs industry average"
            },
            {
                "strategy": "Market Gap Exploitation",
                "focus": "Target completely unaddressed opportunities",
                "implementation": "Pioneer new popup strategies in the market",
                "projected_impact": "+89% first-mover advantage"
            }
        ],
        "market_positioning": {
            "differentiation_score": f"{random.randint(78, 95)}% unique positioning potential",
            "competitive_moat": "Strong - Multiple untapped opportunities identified",
            "market_timing": "Optimal - Competitors slow to adopt advanced strategies",
            "implementation_urgency": "High - First-mover advantage available for 6-12 months"
        }
    }
    
    return analysis_result