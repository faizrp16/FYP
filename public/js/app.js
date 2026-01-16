// FinanceAI - Watchlist, Calendar & Insights

// Mock stock data
const mockStocks = {
    'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 178.50, change: 2.5 },
    'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.30, change: -1.2 },
    'MSFT': { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.20, change: 3.1 },
    'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.75, change: -2.8 },
    'JNJ': { symbol: 'JNJ', name: 'Johnson & Johnson', price: 160.00, change: 0.8 },
    'JPM': { symbol: 'JPM', name: 'JPMorgan Chase', price: 195.00, change: 1.5 }
};

// Economic Calendar Events
const economicEvents = [
    {
        id: 1,
        date: '2026-01-17',
        time: '14:00',
        country: 'USA',
        event: 'Initial Jobless Claims',
        forecast: '211K',
        previous: '212K',
        impact: 'high',
        description: 'Weekly jobless claims data - key labor market indicator'
    },
    {
        id: 2,
        date: '2026-01-17',
        time: '15:00',
        country: 'USA',
        event: 'Retail Sales',
        forecast: '0.4%',
        previous: '0.3%',
        impact: 'high',
        description: 'Measure of consumer spending at retail level'
    },
    {
        id: 3,
        date: '2026-01-16',
        time: '16:30',
        country: 'USA',
        event: 'Producer Price Index (PPI)',
        forecast: '0.3%',
        previous: '0.2%',
        impact: 'medium',
        description: 'Measures inflation at producer level'
    },
    {
        id: 4,
        date: '2026-01-18',
        time: '13:30',
        country: 'USA',
        event: 'Consumer Price Index (CPI)',
        forecast: '2.5%',
        previous: '2.4%',
        impact: 'high',
        description: 'Key inflation measure - closely watched by Fed'
    },
    {
        id: 5,
        date: '2026-01-20',
        time: '14:00',
        country: 'USA',
        event: 'Fed Interest Rate Decision',
        forecast: 'Hold',
        previous: '4.75%',
        impact: 'high',
        description: 'FOMC decides on interest rates - major market mover'
    },
    {
        id: 6,
        date: '2026-01-16',
        time: '10:00',
        country: 'EU',
        event: 'Eurozone Sentiment',
        forecast: '5.2',
        previous: '4.8',
        impact: 'low',
        description: 'Sentiment indicator for Eurozone economy'
    },
    {
        id: 7,
        date: '2026-01-19',
        time: '08:00',
        country: 'UK',
        event: 'Unemployment Rate',
        forecast: '4.0%',
        previous: '3.9%',
        impact: 'medium',
        description: 'UK labor market conditions'
    }
];

// Market Insights
const marketInsights = [
    {
        id: 1,
        title: 'Tech Sector Rally Continues',
        category: 'Market Analysis',
        sentiment: 'bullish',
        description: 'Major tech stocks continue upward momentum. AAPL breaks above $180, MSFT gains 3.1%. Strong earnings reports drive investor confidence.',
        source: 'Market Research',
        date: 'Jan 16, 2026'
    },
    {
        id: 2,
        title: 'Fed Meeting Awaited - Rate Decision Next Week',
        category: 'Central Banks',
        sentiment: 'neutral',
        description: 'Markets await Fed interest rate decision. Expectations lean towards status quo. Inflation data coming in line with expectations.',
        source: 'Economics',
        date: 'Jan 15, 2026'
    },
    {
        id: 3,
        title: 'Energy Stocks Face Pressure',
        category: 'Sector Analysis',
        sentiment: 'bearish',
        description: 'Oil prices decline amid demand concerns. Energy sector underperforms. XOM and similar stocks down 2-3%.',
        source: 'Commodities Analysis',
        date: 'Jan 14, 2026'
    },
    {
        id: 4,
        title: 'Healthcare Sector Shows Resilience',
        category: 'Sector Analysis',
        sentiment: 'bullish',
        description: 'Healthcare stocks maintain strength. JNJ gains on strong quarter outlook. Biotech firms show promise.',
        source: 'Healthcare Research',
        date: 'Jan 13, 2026'
    },
    {
        id: 5,
        title: 'Volatility Index Stabilizes',
        category: 'Risk Management',
        sentiment: 'neutral',
        description: 'VIX drops to 13.5 from 15.2. Market uncertainty decreases. Investors become less risk-averse.',
        source: 'Market Data',
        date: 'Jan 12, 2026'
    },
    {
        id: 6,
        title: 'Earnings Season Begins Strong',
        category: 'Earnings',
        sentiment: 'bullish',
        description: 'First wave of Q4 earnings exceed expectations. Tech and finance sectors lead. Guidance remains positive.',
        source: 'Earnings Reports',
        date: 'Jan 10, 2026'
    }
];

let watchlist = [];
let currentCalendarFilter = 'all';
let currentInsightFilter = 'all';

// ===== WATCHLIST FUNCTIONS =====

function loadData() {
    watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    renderWatchlist();
    renderCalendar();
    renderInsights();
}

function saveData() {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

function showAddStockModal() {
    document.getElementById('addStockModal').classList.add('active');
    document.getElementById('stockSymbol').focus();
}

function closeModal() {
    document.getElementById('addStockModal').classList.remove('active');
    document.getElementById('stockSymbol').value = '';
}

function addStock() {
    const symbol = document.getElementById('stockSymbol').value.toUpperCase().trim();

    if (!symbol) {
        alert('Please enter a stock symbol');
        return;
    }

    // Check if already in watchlist
    if (watchlist.find(s => s.symbol === symbol)) {
        alert(`${symbol} is already in your watchlist`);
        return;
    }

    const stockData = mockStocks[symbol];
    if (!stockData) {
        alert(`${symbol} not found. Try: AAPL, GOOGL, MSFT, TSLA, JNJ, JPM`);
        return;
    }

    watchlist.push({ ...stockData });
    saveData();
    renderWatchlist();
    closeModal();
}

function removeStock(symbol) {
    if (confirm(`Remove ${symbol} from watchlist?`)) {
        watchlist = watchlist.filter(s => s.symbol !== symbol);
        saveData();
        renderWatchlist();
    }
}

function renderWatchlist() {
    const container = document.getElementById('watchlistContainer');
    
    if (watchlist.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon"></div><p>No stocks in watchlist. Click "+ Add Stock" to begin.</p></div>';
        return;
    }

    container.innerHTML = watchlist.map(stock => {
        const changeClass = stock.change >= 0 ? 'profit' : 'loss';
        const changeSymbol = stock.change >= 0 ? '▲' : '▼';
        
        return `
            <div class="stock-item">
                <div class="stock-symbol">${stock.symbol}</div>
                <div style="opacity:0.7; font-size:0.9rem;">${stock.name}</div>
                <div class="stock-price">$${stock.price.toFixed(2)}</div>
                <div style="margin-top:5px; font-size:0.9rem;" class="${changeClass}">
                    ${changeSymbol} ${Math.abs(stock.change).toFixed(2)}%
                </div>
                <button class="btn btn-secondary btn-small" onclick="removeStock('${stock.symbol}')" style="margin-top:10px;width:100%;">Remove</button>
            </div>
        `;
    }).join('');
}

// ===== CALENDAR FUNCTIONS =====

function renderCalendar() {
    const container = document.getElementById('calendarContainer');
    const filtered = filterEventsByImpact(economicEvents, currentCalendarFilter);

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No economic events match the selected filter.</p></div>';
        return;
    }

    // Sort by date and time
    filtered.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
    });

    container.innerHTML = filtered.map(event => `
        <div class="calendar-event ${event.impact}-impact">
            <div class="event-header">
                <div>
                    <div class="event-title">${event.event}</div>
                    <div style="font-size:0.9rem; color:#666; margin-top:4px;">📍 ${event.country}</div>
                </div>
                <div style="text-align:right;">
                    <div class="event-time">${event.date} ${event.time}</div>
                    <div class="event-impact ${event.impact}" style="margin-top:5px;">${event.impact} Impact</div>
                </div>
            </div>
            <div style="color:#666; margin:10px 0; font-size:0.9rem;">${event.description}</div>
            <div class="event-details">
                <div class="event-detail">
                    <div class="event-detail-label">Forecast</div>
                    <div class="event-detail-value">${event.forecast}</div>
                </div>
                <div class="event-detail">
                    <div class="event-detail-label">Previous</div>
                    <div class="event-detail-value">${event.previous}</div>
                </div>
                <div class="event-detail">
                    <div class="event-detail-label">Category</div>
                    <div class="event-detail-value">${event.country}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function filterCalendarEvents() {
    currentCalendarFilter = document.getElementById('calendarFilter').value;
    renderCalendar();
}

function filterEventsByImpact(events, impact) {
    if (impact === 'all') return events;
    return events.filter(e => e.impact === impact);
}

// ===== INSIGHTS FUNCTIONS =====

function renderInsights() {
    const container = document.getElementById('insightsContainer');
    const filtered = filterInsightsBySentiment(marketInsights, currentInsightFilter);

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No insights match the selected filter.</p></div>';
        return;
    }

    container.innerHTML = filtered.map(insight => `
        <div class="insight-card ${insight.sentiment}">
            <div class="insight-header">
                <div>
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-category">${insight.category}</div>
                </div>
                <div class="insight-sentiment ${insight.sentiment}">${insight.sentiment.toUpperCase()}</div>
            </div>
            <div class="insight-description">${insight.description}</div>
            <div class="insight-source">📰 ${insight.source}</div>
            <div class="insight-footer">
                <span class="insight-date">${insight.date}</span>
                <a href="#" class="insight-read-more">Learn More →</a>
            </div>
        </div>
    `).join('');
}

function filterInsights() {
    currentInsightFilter = document.getElementById('insightFilter').value;
    renderInsights();
}

function filterInsightsBySentiment(insights, sentiment) {
    if (sentiment === 'all') return insights;
    return insights.filter(i => i.sentiment === sentiment);
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Close modal when clicking outside
    const modal = document.getElementById('addStockModal');
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Add Enter key support in modal
    document.getElementById('stockSymbol').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addStock();
    });
});
