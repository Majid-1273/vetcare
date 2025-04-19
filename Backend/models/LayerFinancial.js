const mongoose = require('mongoose');

const layerFinancialSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  revenue: {
    eggSales: { type: Number, default: 0 },
    damagedEggs: { type: Number, default: 0 },
    culledBirds: { type: Number, default: 0 },
    poultryWaste: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 }
  },
  costs: {
    chicks: { type: Number, default: 0 },
    broodingMiscellaneous: { type: Number, default: 0 },
    broodingLabour: { type: Number, default: 0 },
    feed: { type: Number, default: 0 },
    medicationVet: { type: Number, default: 0 },
    labour: { type: Number, default: 0 },
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
layerFinancialSchema.pre('save', function(next) {
  const revenue = this.revenue;
  const costs = this.costs;
  
  // Calculate total revenue
  revenue.totalRevenue = revenue.eggSales + revenue.damagedEggs + 
                        revenue.culledBirds + revenue.poultryWaste;
  
  // Calculate total costs
  costs.totalCost = costs.chicks + costs.broodingMiscellaneous + 
                   costs.broodingLabour + costs.feed + 
                   costs.medicationVet + costs.labour + 
                   costs.miscellaneous;
  
  // Calculate profit/loss
  this.profitLoss = revenue.totalRevenue - costs.totalCost;
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('LayerFinancial', layerFinancialSchema);