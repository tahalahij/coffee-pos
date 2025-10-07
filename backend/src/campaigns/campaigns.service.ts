import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DiscountCampaign, CampaignProduct, CampaignParticipation, CampaignStatus, DiscountType, CampaignType, LoyaltyTier } from './models/discount-campaign.model';
import { Customer } from '../customers/models/customer.model';
import { Sale } from '../sales/models/sale.model';
import { Op } from 'sequelize';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(DiscountCampaign)
    private discountCampaignModel: typeof DiscountCampaign,
    @InjectModel(CampaignProduct)
    private campaignProductModel: typeof CampaignProduct,
    @InjectModel(CampaignParticipation)
    private campaignParticipationModel: typeof CampaignParticipation,
    @InjectModel(Customer)
    private customerModel: typeof Customer,
    @InjectModel(Sale)
    private saleModel: typeof Sale,
  ) {}

  async createCampaign(data: CreateCampaignDto) {
    if (!data.name || data.name.trim() === '') {
      throw new BadRequestException('Campaign name is required');
    }

    if (!data.discountValue || data.discountValue <= 0) {
      throw new BadRequestException('Discount value must be greater than 0');
    }

    if (!data.startDate || !data.endDate) {
      throw new BadRequestException('Start date and end date are required');
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (data.discountType === DiscountType.PERCENTAGE && data.discountValue > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    const campaign = await this.discountCampaignModel.create({
      name: data.name,
      description: data.description,
      type: data.type,
      startDate,
      endDate,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minPurchase: data.minPurchase,
      maxDiscount: data.maxDiscount,
      usageLimit: data.usageLimit,
      targetTier: data.targetTier,
      status: CampaignStatus.DRAFT,
    });

    if (data.productIds && data.productIds.length > 0) {
      await this.campaignProductModel.bulkCreate(
        data.productIds.map(productId => ({
          campaignId: campaign.id,
          productId,
        }))
      );
    }

    return this.getCampaignById(campaign.id);
  }

  async getCampaigns(status?: CampaignStatus) {
    const whereCondition = status ? { status } : {};

    return this.discountCampaignModel.findAll({
      where: whereCondition,
      include: [
        {
          model: CampaignProduct,
          as: 'products',
        },
        {
          model: CampaignParticipation,
          as: 'participations',
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async getActiveCampaigns(customerId?: number, productIds?: number[]) {
    const now = new Date();

    const whereCondition: any = {
      status: CampaignStatus.ACTIVE,
      isActive: true,
      startDate: { [Op.lte]: now },
      endDate: { [Op.gte]: now },
    };

    if (customerId) {
      const customer = await this.customerModel.findByPk(customerId, {
        attributes: ['loyaltyTier'],
      });

      if (customer) {
        whereCondition[Op.or] = [
          { targetTier: null },
          { targetTier: customer.loyaltyTier },
        ];
      }
    }

    const campaigns = await this.discountCampaignModel.findAll({
      where: whereCondition,
      include: [
        {
          model: CampaignProduct,
          as: 'products',
        },
        {
          model: CampaignParticipation,
          as: 'participations',
        },
      ],
      order: [['discountValue', 'DESC']],
    });

    if (productIds && productIds.length > 0) {
      return campaigns.filter(campaign =>
        campaign.products.length === 0 ||
        campaign.products.some(cp => productIds.includes(cp.productId))
      );
    }

    return campaigns;
  }

  async getCampaignById(id: number) {
    const campaign = await this.discountCampaignModel.findByPk(id, {
      include: [
        {
          model: CampaignProduct,
          as: 'products',
        },
        {
          model: CampaignParticipation,
          as: 'participations',
          include: [
            {
              model: Customer,
              attributes: ['id', 'name', 'phone'],
            },
          ],
        },
      ],
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async updateCampaign(id: number, data: Partial<CreateCampaignDto>) {
    await this.getCampaignById(id);

    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type) updateData.type = data.type;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.discountType) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) updateData.discountValue = data.discountValue;
    if (data.minPurchase !== undefined) updateData.minPurchase = data.minPurchase;
    if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount;
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit;
    if (data.targetTier !== undefined) updateData.targetTier = data.targetTier;

    await this.discountCampaignModel.update(
      updateData,
      {
        where: { id },
      }
    );

    return this.getCampaignById(id);
  }

  async activateCampaign(id: number) {
    await this.getCampaignById(id); // Check if exists

    const [, updatedRows] = await this.discountCampaignModel.update(
      {
        status: CampaignStatus.ACTIVE,
        isActive: true,
      },
      {
        where: { id },
        returning: true,
      }
    );

    return updatedRows[0];
  }

  async pauseCampaign(id: number) {
    await this.getCampaignById(id);

    const [, updatedRows] = await this.discountCampaignModel.update(
      {
        status: CampaignStatus.PAUSED,
        isActive: false,
      },
      {
        where: { id },
        returning: true,
      }
    );

    return updatedRows[0];
  }

  async applyCampaignDiscount(id: number, customerId: number, subtotal: number) {
    const campaign = await this.getCampaignById(id);

    const now = new Date();
    if (campaign.status !== CampaignStatus.ACTIVE || !campaign.isActive) {
      throw new BadRequestException('Campaign is not active');
    }

    if (now < campaign.startDate || now > campaign.endDate) {
      throw new BadRequestException('Campaign is not currently running');
    }

    if (campaign.minPurchase && subtotal < Number(campaign.minPurchase)) {
      throw new BadRequestException(`Minimum purchase of $${campaign.minPurchase} required`);
    }

    if (campaign.targetTier) {
      const customer = await this.customerModel.findByPk(customerId, {
        attributes: ['loyaltyTier'],
      });

      if (!customer || customer.loyaltyTier !== campaign.targetTier) {
        throw new BadRequestException('Customer not eligible for this campaign');
      }
    }

    if (campaign.usageLimit && campaign.usageCount >= campaign.usageLimit) {
      throw new BadRequestException('Campaign usage limit reached');
    }

    let discountAmount;
    if (campaign.discountType === DiscountType.PERCENTAGE) {
      discountAmount = (subtotal * Number(campaign.discountValue)) / 100;
    } else {
      discountAmount = Math.min(Number(campaign.discountValue), subtotal);
    }

    if (campaign.maxDiscount && discountAmount > Number(campaign.maxDiscount)) {
      discountAmount = Number(campaign.maxDiscount);
    }

    // Check if participation already exists
    await this.campaignParticipationModel.findOrCreate({
      where: {
        campaignId: id,
        customerId,
      },
      defaults: {
        campaignId: id,
        customerId,
      },
    });

    // Increment campaign usage count
    await this.discountCampaignModel.increment('usageCount', {
      where: { id },
    });

    return {
      discountAmount,
      finalAmount: subtotal - discountAmount,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        discountType: campaign.discountType,
        discountValue: Number(campaign.discountValue),
      },
    };
  }

  async getCampaignAnalytics(id: number) {
    const campaign = await this.getCampaignById(id);

    const participations = await this.campaignParticipationModel.findAll({
      where: { campaignId: id },
      include: [
        {
          model: Customer,
          attributes: ['loyaltyTier'],
        },
      ],
    });

    const sales = await this.saleModel.findAll({
      where: { discountCampaignId: id },
      attributes: ['totalAmount', 'discountAmount', 'createdAt'],
    });

    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const totalDiscountGiven = sales.reduce((sum, sale) => sum + Number(sale.discountAmount), 0);
    const uniqueCustomers = new Set(participations.map(p => p.customerId)).size;

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        usageCount: campaign.usageCount,
        usageLimit: campaign.usageLimit,
      },
      metrics: {
        totalParticipations: participations.length,
        uniqueCustomers,
        totalRevenue,
        totalDiscountGiven,
        averageOrderValue: sales.length > 0 ? totalRevenue / sales.length : 0,
        conversionRate: campaign.usageCount > 0 ? (sales.length / campaign.usageCount) * 100 : 0,
      },
      participationsByTier: this.groupParticipationsByTier(participations),
      dailyUsage: this.groupSalesByDay(sales),
    };
  }

  async getRecommendedCampaigns(customerId: number) {
    const customer = await this.customerModel.findByPk(customerId, {
      attributes: ['loyaltyTier', 'totalSpent', 'visitCount'],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const now = new Date();

    return this.discountCampaignModel.findAll({
      where: {
        status: CampaignStatus.ACTIVE,
        isActive: true,
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now },
        [Op.or]: [
          { targetTier: null },
          { targetTier: customer.loyaltyTier },
        ],
      },
      include: [
        {
          model: CampaignProduct,
          as: 'products',
        },
      ],
      order: [['discountValue', 'DESC']],
      limit: 10,
    });
  }

  async deleteCampaign(id: number) {
    await this.getCampaignById(id); // Check if exists

    // Delete related records first
    await this.campaignProductModel.destroy({
      where: { campaignId: id },
    });

    await this.campaignParticipationModel.destroy({
      where: { campaignId: id },
    });

    await this.discountCampaignModel.destroy({
      where: { id },
    });

    return { message: 'Campaign deleted successfully' };
  }

  async getCampaignStats() {
    const totalCampaigns = await this.discountCampaignModel.count();
    const activeCampaigns = await this.discountCampaignModel.count({
      where: { status: CampaignStatus.ACTIVE },
    });

    const now = new Date();
    const expiredCampaigns = await this.discountCampaignModel.count({
      where: {
        endDate: { [Op.lt]: now },
      },
    });

    const totalParticipations = await this.campaignParticipationModel.count();
    const totalSales = await this.saleModel.count({
      where: {
        discountCampaignId: { [Op.not]: null },
      },
    });

    return {
      totalCampaigns,
      activeCampaigns,
      expiredCampaigns,
      totalParticipations,
      totalSales,
      conversionRate: totalParticipations > 0 ? (totalSales / totalParticipations) * 100 : 0,
    };
  }

  private groupParticipationsByTier(participations: any[]) {
    return participations.reduce((acc, participation) => {
      const tier = participation.customer?.loyaltyTier || 'UNKNOWN';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {});
  }

  private groupSalesByDay(sales: any[]) {
    return sales.reduce((acc, sale) => {
      const date = sale.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, revenue: 0, discountGiven: 0 };
      }
      acc[date].count += 1;
      acc[date].revenue += Number(sale.totalAmount);
      acc[date].discountGiven += Number(sale.discountAmount);
      return acc;
    }, {});
  }

  async createAutomaticCampaigns() {
    // Create some automatic campaigns based on business logic
    const campaigns = [];

    // Example: Create a loyalty tier campaign
    const loyaltyCampaign = await this.createCampaign({
      name: 'Loyalty Reward Campaign',
      description: 'Automatic discount for loyal customers',
      type: CampaignType.LOYALTY_BONUS,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      discountType: DiscountType.PERCENTAGE,
      discountValue: 15,
      minPurchase: 50,
      targetTier: LoyaltyTier.GOLD,
    });
    campaigns.push(loyaltyCampaign);

    // Example: Create a seasonal offer
    const seasonalCampaign = await this.createCampaign({
      name: 'Seasonal Special Offer',
      description: 'Automatic seasonal discount',
      type: CampaignType.SEASONAL_OFFER,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
      discountType: DiscountType.FIXED,
      discountValue: 10,
      minPurchase: 25,
      usageLimit: 100,
    });
    campaigns.push(seasonalCampaign);

    return {
      message: 'Automatic campaigns created successfully',
      campaigns,
    };
  }
}
