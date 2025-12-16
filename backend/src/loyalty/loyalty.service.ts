import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument, LoyaltyTier } from '../customers/models/customer.model';
import { Sale, SaleDocument } from '../sales/models/sale.model';

// Re-export LoyaltyTier from customer model
export { LoyaltyTier };

// Simplified loyalty service that works with Mongoose
@Injectable()
export class LoyaltyService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
  ) {}

  // Loyalty tier thresholds (in total spent)
  private readonly tierThresholds = {
    BRONZE: 0,
    SILVER: 100,
    GOLD: 500,
    PLATINUM: 1500,
  };

  // Points earning rates (points per dollar spent)
  private readonly pointsRates = {
    BRONZE: 1,
    SILVER: 1.25,
    GOLD: 1.5,
    PLATINUM: 2,
  };

  async getCustomerLoyaltyValue(customerId: string) {
    const customer = await this.customerModel.findById(customerId).lean();

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Use actual customer data from the database
    const loyaltyPoints = customer.loyaltyPoints;
    const loyaltyTier = customer.loyaltyTier as LoyaltyTier;
    const totalSpent = Number(customer.totalSpent);
    const visitCount = customer.visitCount;

    // Calculate next tier threshold
    let nextTierThreshold = null;
    if (loyaltyTier === LoyaltyTier.BRONZE && totalSpent < this.tierThresholds.SILVER) {
      nextTierThreshold = { tier: 'SILVER', amount: this.tierThresholds.SILVER };
    } else if (loyaltyTier === LoyaltyTier.SILVER && totalSpent < this.tierThresholds.GOLD) {
      nextTierThreshold = { tier: 'GOLD', amount: this.tierThresholds.GOLD };
    } else if (loyaltyTier === LoyaltyTier.GOLD && totalSpent < this.tierThresholds.PLATINUM) {
      nextTierThreshold = { tier: 'PLATINUM', amount: this.tierThresholds.PLATINUM };
    }

    // Get recent sales for this customer
    const recentSales = await this.saleModel
      .find({ customerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('totalAmount loyaltyPointsEarned createdAt')
      .lean();

    // Calculate metrics
    const totalOrders = await this.saleModel.countDocuments({ customerId });
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Calculate days since last purchase
    let daysSinceLastPurchase = null;
    if (customer.lastVisit) {
      const diffTime = Math.abs(new Date().getTime() - new Date(customer.lastVisit).getTime());
      daysSinceLastPurchase = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      customer: {
        id: customer._id,
        name: customer.name,
        loyaltyTier,
        loyaltyPoints,
        totalSpent,
        visitCount,
      },
      metrics: {
        avgOrderValue,
        totalOrders,
        daysSinceLastPurchase,
        nextTierThreshold,
      },
      recentTransactions: recentSales,
    };
  }

  async getLoyaltyHistory(customerId: string) {
    const customer = await this.customerModel.findById(customerId).lean();

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Get all sales for this customer with loyalty points
    const salesWithPoints = await this.saleModel
      .find({ customerId })
      .sort({ createdAt: -1 })
      .select('totalAmount loyaltyPointsEarned createdAt')
      .lean();

    // Calculate tier progression
    let runningTotal = 0;
    const tierHistory: Array<{ tier: LoyaltyTier; achievedAt: Date; totalSpentAtTime: number }> = [];
    let currentTier = LoyaltyTier.BRONZE;

    // Reverse to process from oldest to newest
    const chronologicalSales = [...salesWithPoints].reverse();

    for (const sale of chronologicalSales) {
      runningTotal += Number(sale.totalAmount);

      // Check if tier should change
      let newTier = currentTier;
      if (runningTotal >= this.tierThresholds.PLATINUM) {
        newTier = LoyaltyTier.PLATINUM;
      } else if (runningTotal >= this.tierThresholds.GOLD) {
        newTier = LoyaltyTier.GOLD;
      } else if (runningTotal >= this.tierThresholds.SILVER) {
        newTier = LoyaltyTier.SILVER;
      }

      if (newTier !== currentTier) {
        tierHistory.push({
          tier: newTier,
          achievedAt: new Date(sale.createdAt),
          totalSpentAtTime: runningTotal,
        });
        currentTier = newTier;
      }
    }

    return {
      customer: {
        id: customer._id,
        name: customer.name,
        currentTier: customer.loyaltyTier,
        totalPoints: customer.loyaltyPoints,
        totalSpent: customer.totalSpent,
      },
      tierHistory,
      pointsHistory: chronologicalSales.reverse().map(sale => ({
        saleId: sale._id,
        pointsEarned: sale.loyaltyPointsEarned,
        saleAmount: sale.totalAmount,
        earnedAt: sale.createdAt,
      })),
    };
  }

  async getLoyaltyStats() {
    // Customer distribution by tier using aggregation
    const tierDistributionResult = await this.customerModel.aggregate([
      {
        $group: {
          _id: '$loyaltyTier',
          count: { $sum: 1 },
        },
      },
    ]);

    const tierDistribution = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    };

    tierDistributionResult.forEach((item) => {
      const tier = item._id?.toLowerCase();
      if (tier && tierDistribution.hasOwnProperty(tier)) {
        tierDistribution[tier as keyof typeof tierDistribution] = item.count;
      }
    });

    // Average loyalty points by tier using aggregation
    const avgPointsResult = await this.customerModel.aggregate([
      {
        $group: {
          _id: '$loyaltyTier',
          avgPoints: { $avg: '$loyaltyPoints' },
        },
      },
    ]);

    const avgPointsByTier = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    };

    avgPointsResult.forEach((item) => {
      const tier = item._id?.toLowerCase();
      if (tier && avgPointsByTier.hasOwnProperty(tier)) {
        avgPointsByTier[tier as keyof typeof avgPointsByTier] = item.avgPoints || 0;
      }
    });

    // Total points distributed
    const totalPointsResult = await this.customerModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$loyaltyPoints' },
        },
      },
    ]);

    return {
      tierDistribution,
      avgPointsByTier,
      totalPointsDistributed: totalPointsResult[0]?.total || 0,
    };
  }

  calculateLoyaltyTier(totalSpent: number): LoyaltyTier {
    if (totalSpent >= this.tierThresholds.PLATINUM) {
      return LoyaltyTier.PLATINUM;
    } else if (totalSpent >= this.tierThresholds.GOLD) {
      return LoyaltyTier.GOLD;
    } else if (totalSpent >= this.tierThresholds.SILVER) {
      return LoyaltyTier.SILVER;
    }
    return LoyaltyTier.BRONZE;
  }

  calculatePointsEarned(amount: number, tier: LoyaltyTier): number {
    const rate = this.pointsRates[tier];
    return Math.floor(amount * rate);
  }

  async addLoyaltyPoints(
    customerId: string,
    data: {
      points: number;
      type: string;
      description?: string;
      saleId?: string;
    },
  ) {
    const customer = await this.customerModel.findById(customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const newBalance = customer.loyaltyPoints + data.points;

    // Add points to customer's loyalty balance
    await this.customerModel.findByIdAndUpdate(customerId, {
      loyaltyPoints: newBalance,
    });

    return {
      success: true,
      message: `Added ${data.points} loyalty points`,
      newBalance,
    };
  }

  async redeemLoyaltyPoints(customerId: string, points: number) {
    const customer = await this.customerModel.findById(customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (customer.loyaltyPoints < points) {
      throw new BadRequestException('Insufficient loyalty points');
    }

    const newBalance = customer.loyaltyPoints - points;

    // Deduct points from customer's loyalty balance
    await this.customerModel.findByIdAndUpdate(customerId, {
      loyaltyPoints: newBalance,
    });

    return {
      success: true,
      message: `Redeemed ${points} loyalty points`,
      newBalance,
      redemptionValue: points * 0.01, // Assuming 1 point = $0.01
    };
  }

  async awardBonusPoints(customerId: string, points: number, reason: string) {
    const customer = await this.customerModel.findById(customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const newBalance = customer.loyaltyPoints + points;

    // Add bonus points to customer's loyalty balance
    await this.customerModel.findByIdAndUpdate(customerId, {
      loyaltyPoints: newBalance,
    });

    return {
      success: true,
      message: `Awarded ${points} bonus points for: ${reason}`,
      newBalance,
    };
  }

  async updateLoyaltyTier(customerId: string, totalSpent: number) {
    const customer = await this.customerModel.findById(customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const previousTier = customer.loyaltyTier;
    const newTier = this.calculateLoyaltyTier(totalSpent);

    // Update customer's tier and total spent
    await this.customerModel.findByIdAndUpdate(customerId, {
      loyaltyTier: newTier,
      totalSpent,
    });

    return {
      success: true,
      message: `Updated loyalty tier to ${newTier}`,
      previousTier,
      newTier,
      totalSpent,
    };
  }

  async calculateLoyaltyPoints(customerId: string, amount: number) {
    const customer = await this.customerModel.findById(customerId).lean();

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const currentTier = customer.loyaltyTier as LoyaltyTier;
    const pointsToEarn = this.calculatePointsEarned(amount, currentTier);

    return {
      customerId,
      amount,
      currentTier,
      pointsToEarn,
      pointsRate: this.pointsRates[currentTier],
    };
  }
}
