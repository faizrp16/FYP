// Portfolio Analysis & Recommendations Engine
// Rule-Based System for Modern Portfolio Theory

// Stock Sectors for Diversification Analysis
const STOCK_SECTORS = {
    'AAPL': 'Technology',
    'GOOGL': 'Technology',
    'MSFT': 'Technology',
    'TSLA': 'Technology',
    'JNJ': 'Healthcare',
    'KO': 'Consumer',
    'JPM': 'Finance',
    'XOM': 'Energy',
    'WMT': 'Retail'
};

// Volatility Classification
const VOLATILITY_PROFILE = {
    'AAPL': 'moderate',
    'GOOGL': 'moderate',
    'MSFT': 'moderate',
    'TSLA': 'high'
};

class PortfolioAnalyzer {
    constructor(portfolio) {
        this.portfolio = portfolio;
    }

    // Calculate total portfolio value and performance
    calculatePortfolioMetrics() {
        let totalValue = 0;
        let totalCost = 0;
        let metrics = {};

        this.portfolio.forEach(stock => {
            const currentValue = stock.shares * stock.price;
            const purchaseCost = stock.shares * stock.purchasePrice;
            const profitLoss = currentValue - purchaseCost;
            const profitLossPercent = purchaseCost > 0 ? ((profitLoss / purchaseCost) * 100) : 0;

            totalValue += currentValue;
            totalCost += purchaseCost;

            metrics[stock.symbol] = {
                currentValue,
                purchaseCost,
                profitLoss,
                profitLossPercent
            };
        });

        const totalPL = totalValue - totalCost;
        const totalPLPercent = totalCost > 0 ? ((totalPL / totalCost) * 100) : 0;

        return {
            totalValue,
            totalCost,
            totalPL,
            totalPLPercent,
            metrics
        };
    }

    // Analyze portfolio concentration risk
    analyzeConcentration() {
        const metrics = this.calculatePortfolioMetrics();
        const allocations = {};

        Object.entries(metrics).forEach(([symbol, data]) => {
            allocations[symbol] = {
                percentage: (data.currentValue / metrics.totalValue * 100),
                value: data.currentValue
            };
        });

        return allocations;
    }

    // Analyze sector diversification
    analyzeSectorDiversification() {
        const sectors = {};
        const metrics = this.calculatePortfolioMetrics();
        let totalValue = metrics.totalValue;

        this.portfolio.forEach(stock => {
            const sector = STOCK_SECTORS[stock.symbol] || 'Other';
            const currentValue = stock.shares * stock.price;
            
            if (!sectors[sector]) {
                sectors[sector] = { value: 0, percentage: 0, stocks: [] };
            }
            sectors[sector].value += currentValue;
            sectors[sector].stocks.push(stock.symbol);
        });

        Object.keys(sectors).forEach(sector => {
            sectors[sector].percentage = (sectors[sector].value / totalValue * 100);
        });

        return sectors;
    }

    // Calculate portfolio volatility (simplified)
    assessRiskProfile() {
        let totalHighRisk = 0;
        let totalValue = 0;

        this.portfolio.forEach(stock => {
            const currentValue = stock.shares * stock.price;
            totalValue += currentValue;
            
            if (VOLATILITY_PROFILE[stock.symbol] === 'high') {
                totalHighRisk += currentValue;
            }
        });

        const highRiskPercentage = totalValue > 0 ? (totalHighRisk / totalValue * 100) : 0;
        
        let riskLevel = 'Low';
        if (highRiskPercentage > 50) riskLevel = 'High';
        else if (highRiskPercentage > 25) riskLevel = 'Medium';

        return {
            riskLevel,
            highRiskPercentage: highRiskPercentage.toFixed(2),
            assessment: this.getRiskAssessment(riskLevel)
        };
    }

    getRiskAssessment(riskLevel) {
        const assessments = {
            'Low': 'Your portfolio has low volatility. Good for conservative investors.',
            'Medium': 'Your portfolio has moderate volatility. Balanced growth and stability.',
            'High': 'Your portfolio has high volatility. Higher potential returns but greater risk.'
        };
        return assessments[riskLevel] || 'Unknown risk profile';
    }

    // Generate rebalancing recommendations
    generateRecommendations() {
        const recommendations = [];
        const allocations = this.analyzeConcentration();
        const sectors = this.analyzeSectorDiversification();
        const risk = this.assessRiskProfile();

        // Rule 1: Concentration Risk (>30% in single stock)
        Object.entries(allocations).forEach(([symbol, data]) => {
            if (data.percentage > 30) {
                recommendations.push({
                    type: 'alert',
                    title: '⚠️ Concentration Risk Detected',
                    text: `${symbol} represents ${data.percentage.toFixed(1)}% of your portfolio. Consider reducing exposure to 20-30% for better diversification.`,
                    severity: 'high',
                    action: 'Reduce position'
                });
            }
        });

        // Rule 2: Sector Imbalance
        const sectorCount = Object.keys(sectors).length;
        if (sectorCount < 3) {
            recommendations.push({
                type: 'warning',
                title: ' Diversification Opportunity',
                text: `Your portfolio covers only ${sectorCount} sector(s). Consider adding positions in different sectors (Healthcare, Finance, Energy, etc.) to reduce sector-specific risk.`,
                severity: 'medium',
                action: 'Expand to new sectors'
            });
        }

        // Rule 3: Drift Threshold (if any position drifted >5%)
        Object.entries(allocations).forEach(([symbol, data]) => {
            const targetAllocation = 100 / this.portfolio.length;
            const drift = Math.abs(data.percentage - targetAllocation);
            if (drift > 5 && this.portfolio.length > 2) {
                recommendations.push({
                    type: 'info',
                    title: ' Rebalancing Suggested',
                    text: `${symbol} has drifted ${drift.toFixed(1)}% from target allocation. You may want to rebalance.`,
                    severity: 'low',
                    action: 'Rebalance'
                });
            }
        });

        // Rule 4: High Risk Warning
        if (risk.riskLevel === 'High') {
            recommendations.push({
                type: 'alert',
                title: ' High Portfolio Volatility',
                text: `${risk.highRiskPercentage}% of your portfolio is in high-volatility stocks. Consider adding more stable assets.`,
                severity: 'high',
                action: 'Add stable assets'
            });
        }

        // Rule 5: Low portfolio (too much cash or few holdings)
        if (this.portfolio.length < 3) {
            recommendations.push({
                type: 'warning',
                title: ' Limited Diversification',
                text: `You only have ${this.portfolio.length} holding(s). A well-diversified portfolio typically has 5-10+ positions across different sectors.`,
                severity: 'medium',
                action: 'Add more stocks'
            });
        }

        // Rule 6: Positive Performance
        const metrics = this.calculatePortfolioMetrics();
        if (metrics.totalPLPercent > 10) {
            recommendations.push({
                type: 'success',
                title: ' Strong Performance',
                text: `Your portfolio is up ${metrics.totalPLPercent.toFixed(2)}%. Maintain your strategy and continue monitoring.`,
                severity: 'info',
                action: 'Monitor'
            });
        }

        return recommendations;
    }

    // Get target allocation suggestions
    getSuggestedAllocation() {
        const portfolio = this.portfolio;
        const count = portfolio.length;
        
        if (count === 0) return null;

        const baseAllocation = 100 / count;
        const suggestions = {};

        portfolio.forEach(stock => {
            suggestions[stock.symbol] = {
                target: baseAllocation,
                current: (stock.shares * stock.price) / this.calculatePortfolioMetrics().totalValue * 100,
                difference: ((stock.shares * stock.price) / this.calculatePortfolioMetrics().totalValue * 100) - baseAllocation
            };
        });

        return suggestions;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioAnalyzer;
}
