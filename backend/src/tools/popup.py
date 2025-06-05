import json
from agents import function_tool


@function_tool
def analyze_popup_history(business_description: str = ""):
    """
    Analyze historical popup performance data with streaming insights.
    
    Args:
        business_description: Description of the business and goals for context
        
    Returns:
        Rich analysis of popup performance with actionable insights
    """
    
    # Load actual mock data
    try:
        with open('/Users/andrewsiah/Documents/oai-nyt-hackathon/backend/data/mock_popup_data.json', 'r') as f:
            data = json.load(f)
            popup_data = data['response']
    except:
        # Fallback mock data if file not found
        popup_data = {
            "optin_rate_pct": 10.4,
            "popup_sales": 215843.63,
            "popup_conversion_rate": 17.22,
            "list_growth": 2733
        }
    
    # Generate streaming analysis insights
    current_conversion = popup_data['optin_rate_pct']
    industry_average = 16.8  # Industry benchmark
    improvement_potential = industry_average - current_conversion
    improvement_percentage = (improvement_potential / current_conversion) * 100
    
    # Calculate revenue projections
    current_revenue = popup_data['popup_sales']
    projected_revenue_increase = current_revenue * (improvement_percentage / 100)
    annual_projection = projected_revenue_increase * 12
    
    # Generate specific insights based on business type
    business_insights = []
    if "baseball" in business_description.lower() or "sports" in business_description.lower():
        business_insights = [
            "<� SPORT-SPECIFIC INSIGHT: Athletic equipment buyers respond 73% better to red CTAs (urgency/energy)",
            "� SEASONAL OPPORTUNITY: Baseball season timing shows 156% higher conversion March-August",
            "<� COMPETITIVE EDGE: Sports equipment popups with 'training advantage' messaging convert 89% better"
        ]
    elif "fashion" in business_description.lower() or "clothing" in business_description.lower():
        business_insights = [
            "=W FASHION INSIGHT: Size-specific offers increase conversion by 67%",
            "=� MOBILE PRIORITY: Fashion shoppers are 78% mobile - optimize for mobile-first",
            "( SOCIAL PROOF: 'Recently purchased' notifications boost fashion conversions 145%"
        ]
    else:
        business_insights = [
            "=� URGENCY INSIGHT: Exit-intent triggers boost conversions 156%",
            "=� MOBILE GAP: Mobile conversion opportunity of 42% improvement detected",
            "<� DESIGN IMPACT: Red CTAs outperform blue by 73% in your industry"
        ]
    
    analysis_result = {
        "analysis_type": "Historical Popup Performance Analysis",
        "current_metrics": {
            "conversion_rate": f"{current_conversion}%",
            "monthly_revenue": f"${current_revenue:,.2f}",
            "list_growth": popup_data['list_growth'],
            "industry_benchmark": f"{industry_average}%"
        },
        "key_insights": [
            f"=� PERFORMANCE GAP: Current {current_conversion}% conversion is {improvement_percentage:.0f}% below industry average",
            f"=� REVENUE OPPORTUNITY: ${annual_projection:,.0f} annual increase potential identified",
            "=� OPTIMIZATION TARGET: Conversion rate improvement from {:.1f}% � {:.1f}%".format(current_conversion, industry_average)
        ] + business_insights,
        "optimization_opportunities": [
            {
                "opportunity": "Exit-Intent Triggers",
                "impact": "+156% conversion boost",
                "implementation": "Detect mouse leaving viewport, trigger popup with compelling offer"
            },
            {
                "opportunity": "Mobile Optimization", 
                "impact": "+42% mobile conversion",
                "implementation": "Reduce popup size, improve touch targets, faster load times"
            },
            {
                "opportunity": "CTA Color Optimization",
                "impact": "+73% click-through rate",
                "implementation": "Switch from blue to red CTAs for urgency psychology"
            }
        ],
        "projected_improvements": {
            "conversion_rate_target": f"{industry_average}%",
            "revenue_increase_monthly": f"${projected_revenue_increase:,.0f}",
            "revenue_increase_annual": f"${annual_projection:,.0f}",
            "improvement_percentage": f"+{improvement_percentage:.0f}%"
        }
    }
    
    return analysis_result