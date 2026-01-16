// Sequelize models
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({ dialect: 'sqlite', storage: './data.sqlite', logging: false });

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false }
});

const WatchlistItem = sequelize.define('WatchlistItem', {
  symbol: { type: DataTypes.STRING, allowNull: false }
});
WatchlistItem.belongsTo(User);
User.hasMany(WatchlistItem);

const PortfolioPosition = sequelize.define('PortfolioPosition', {
  symbol: { type: DataTypes.STRING, allowNull: false },
  shares: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  avgCost: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 }
});
PortfolioPosition.belongsTo(User);
User.hasMany(PortfolioPosition);

const Transaction = sequelize.define('Transaction', {
  symbol: DataTypes.STRING,
  shares: DataTypes.FLOAT,
  price: DataTypes.FLOAT,
  type: DataTypes.ENUM('BUY', 'SELL')
});
Transaction.belongsTo(User);

const CashAccount = sequelize.define('CashAccount', {
  balance: { type: DataTypes.FLOAT, defaultValue: 10000 } // default simulated cash
});
CashAccount.belongsTo(User);
User.hasOne(CashAccount);

async function init() {
  await sequelize.sync({ force: false });
  // create demo user if not exists
  const [u] = await User.findOrCreate({ where: { name: 'dev_user' }});
  const [cash] = await CashAccount.findOrCreate({ where: { UserId: u.id }, defaults: { balance: 10000 }});
  return { sequelize, User, WatchlistItem, PortfolioPosition, Transaction, CashAccount };
}

module.exports = { init };
