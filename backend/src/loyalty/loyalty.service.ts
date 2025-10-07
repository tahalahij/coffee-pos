import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Customer } from '../customers/models/customer.model';
import { Sale } from '../sales/models/sale.model';

// Define loyalty tier enum to replace Prisma's LoyaltyTier
export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

// Simplified loyalty service that works with current schema
@Injectable()
export class LoyaltyService {
  constructor(
    @InjectModel(Customer) private customerModel: typeof Customer,
    @InjectModel(Sale) private saleModel: typeof Sale,
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
    const customer = await this.customerModel.findByPk(customerId);

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
    const recentSales = await this.saleModel.findAll({
      where: { customerId },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'totalAmount', 'loyaltyPointsEarned', 'createdAt'],
    });

    // Calculate metrics
    const totalOrders = await this.saleModel.count({
      where: { customerId },
    });

    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Calculate days since last purchase
    let daysSinceLastPurchase = null;
    if (customer.lastVisit) {
      const diffTime = Math.abs(new Date().getTime() - customer.lastVisit.getTime());
      daysSinceLastPurchase = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      customer: {
        id: customer.id,
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
    const customer = await this.customerModel.findByPk(customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Get all sales for this customer with loyalty points
    const salesWithPoints = await this.saleModel.findAll({
      where: { customerId },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'totalAmount', 'loyaltyPointsEarned', 'createdAt'],
    });

    // Calculate tier progression
    let runningTotal = 0;
    const tierHistory = [];
    let currentTier = LoyaltyTier.BRONZE;

    for (const sale of salesWithPoints.reverse()) {
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
          achievedAt: sale.createdAt,
          totalSpentAtTime: runningTotal,
        });
        currentTier = newTier;
      }
    }

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        currentTier: customer.loyaltyTier,
        totalPoints: customer.loyaltyPoints,
        totalSpent: customer.totalSpent,
      },
      tierHistory,
      pointsHistory: salesWithPoints.reverse().map(sale => ({
        saleId: sale.id,
        pointsEarned: sale.loyaltyPointsEarned,
        saleAmount: sale.totalAmount,
        earnedAt: sale.createdAt,
      })),
    };
  }

  async getLoyaltyStats() {
    // Customer distribution by tier
    const tierDistribution = await Promise.all([
      this.customerModel.count({ where: { loyaltyTier: LoyaltyTier.BRONZE } }),
      this.customerModel.count({ where: { loyaltyTier: LoyaltyTier.SILVER } }),
      this.customerModel.count({ where: { loyaltyTier: LoyaltyTier.GOLD } }),
      this.customerModel.count({ where: { loyaltyTier: LoyaltyTier.PLATINUM } }),
    ]);

    // Average loyalty points by tier
    const bronzeAvg = await this.customerModel.findAll({
      where: { loyaltyTier: LoyaltyTier.BRONZE },
      attributes: [[this.customerModel.sequelize.fn('AVG', this.customerModel.sequelize.col('loyaltyPoints')), 'avg']],
      raw: true,
    });

    const silverAvg = await this.customerModel.findAll({
      where: { loyaltyTier: LoyaltyTier.SILVER },
      attributes: [[this.customerModel.sequelize.fn('AVG', this.customerModel.sequelize.col('loyaltyPoints')), 'avg']],
      raw: true,
    });

    const goldAvg = await this.customerModel.findAll({
      where: { loyaltyTier: LoyaltyTier.GOLD },
      attributes: [[this.customerModel.sequelize.fn('AVG', this.customerModel.sequelize.col('loyaltyPoints')), 'avg']],
      raw: true,
    });

    const platinumAvg = await this.customerModel.findAll({
      where: { loyaltyTier: LoyaltyTier.PLATINUM },
      attributes: [[this.customerModel.sequelize.fn('AVG', this.customerModel.sequelize.col('loyaltyPoints')), 'avg']],
      raw: true,
    });

    // Total points distributed
    const totalPointsResult = await this.customerModel.findAll({
      attributes: [[this.customerModel.sequelize.fn('SUM', this.customerModel.sequelize.col('loyaltyPoints')), 'total']],
      raw: true,
    });

    return {
      tierDistribution: {
        bronze: tierDistribution[0],
        silver: tierDistribution[1],
        gold: tierDistribution[2],
        platinum: tierDistribution[3],
      },
      avgPointsByTier: {
        bronze: Number((bronzeAvg[0] as any)?.avg) || 0,
        silver: Number((silverAvg[0] as any)?.avg) || 0,
        gold: Number((goldAvg[0] as any)?.avg) || 0,
        platinum: Number((platinumAvg[0] as any)?.avg) || 0,
      },
      totalPointsDistributed: Number((totalPointsResult[0] as any)?.total) || 0,
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
    const customer = await this.customerModel.findByPk(customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Add points to customer's loyalty balance
    await this.customerModel.update(
      {
        loyaltyPoints: customer.loyaltyPoints + data.points,
      },
      {
        where: { id: customerId },
      }
    );

    return {
      success: true,
      message: `Added ${data.points} loyalty points`,
      newBalance: customer.loyaltyPoints + data.points,
    };
  }

  async redeemLoyaltyPoints(customerId: string, points: number) {
    const customer = await this.customerModel.findByPk(customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (customer.loyaltyPoints < points) {
      throw new BadRequestException('Insufficient loyalty points');
    }

    // Deduct points from customer's loyalty balance
    await this.customerModel.update(
      {
        loyaltyPoints: customer.loyaltyPoints - points,
      },
      {
        where: { id: customerId },
      }
    );

    return {
      success: true,
      message: `Redeemed ${points} loyalty points`,
      newBalance: customer.loyaltyPoints - points,
      redemptionValue: points * 0.01, // Assuming 1 point = $0.01
    };
  }

  async awardBonusPoints(customerId: string, points: number, reason: string) {
    const customer = await this.customerModel.findByPk(customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Add bonus points to customer's loyalty balance
    await this.customerModel.update(
      {
        loyaltyPoints: customer.loyaltyPoints + points,
      },
      {
        where: { id: customerId },
      }
    );

    return {
      success: true,
      message: `Awarded ${points} bonus points for: ${reason}`,
      newBalance: customer.loyaltyPoints + points,
    };
  }

  async updateLoyaltyTier(customerId: string, totalSpent: number) {
    const customer = await this.customerModel.findByPk(customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const newTier = this.calculateLoyaltyTier(totalSpent);

    // Update customer's tier and total spent
    await this.customerModel.update(
      {
        loyaltyTier: newTier,
        totalSpent,
      },
      {
        where: { id: customerId },
      }
    );

    return {
      success: true,
      message: `Updated loyalty tier to ${newTier}`,
      previousTier: customer.loyaltyTier,
      newTier,
      totalSpent,
    };
  }

  async calculateLoyaltyPoints(customerId: string, amount: number) {
    const customer = await this.customerModel.findByPk(customerId);

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
