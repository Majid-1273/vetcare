const mongoose = require('mongoose');

const broilerFinancialSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  revenue: {
    harvestedCartons: { type: Number, default: 0 },
    chickenPieces: { type: Number, default: 0 },
    poultryWaste: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 }
  },
  costs: {
    broodingMiscellaneous: { type: Number, default: 0 },
    broodingLabour: { type: Number, default: 0 },
    otherLabour: { type: Number, default: 0 },
    feed: { type: Number, default: 0 },
    medicationVet: { type: Number, default: 0 },
    miscellaneous: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 }
  },
  profitLoss: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate totals before saving
broilerFinancialSchema.pre('save', function(next) {
  const revenue = this.revenue;
  const costs = this.costs;
  
  // Calculate total revenue
  revenue.totalRevenue = revenue.harvestedCartons + revenue.chickenPieces + revenue.poultryWaste;
  
  // Calculate total costs
  costs.totalCost = costs.broodingMiscellaneous + costs.broodingLabour + 
                   costs.otherLabour + costs.feed + 
                   costs.medicationVet + costs.miscellaneous;
  
  // Calculate profit/loss
  this.profitLoss = revenue.totalRevenue - costs.totalCost;
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BroilerFinancial', broilerFinancialSchema);