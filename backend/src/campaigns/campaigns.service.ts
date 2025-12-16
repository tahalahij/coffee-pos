import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DiscountCampaign,
  DiscountCampaignDocument,
  CampaignProduct,
  CampaignProductDocument,
  CampaignParticipation,
  CampaignParticipationDocument,
  CampaignStatus,
  DiscountType,
  CampaignType,
  LoyaltyTier,
} from './models/discount-campaign.model';
import { Customer, CustomerDocument } from '../customers/models/customer.model';
import { Sale, SaleDocument } from '../sales/models/sale.model';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(DiscountCampaign.name)
    private discountCampaignModel: Model<DiscountCampaignDocument>,
    @InjectModel(CampaignProduct.name)
    private campaignProductModel: Model<CampaignProductDocument>,
    @InjectModel(CampaignParticipation.name)
    private campaignParticipationModel: Model<CampaignParticipationDocument>,
    @InjectModel(Customer.name)
    private customerModel: Model<CustomerDocument>,
    @InjectModel(Sale.name)
    private saleModel: Model<SaleDocument>,
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

    const campaign = new this.discountCampaignModel({
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
    await campaign.save();

    if (data.productIds && data.productIds.length > 0) {
      const campaignProducts = data.productIds.map(productId => ({
        campaignId: campaign._id,
        productId: new Types.ObjectId(productId.toString()),
      }));
      await this.campaignProductModel.insertMany(campaignProducts);
    }

    return this.getCampaignById(campaign._id.toString());
  }

  async getCampaigns(status?: CampaignStatus) {
    const filter = status ? { status } : {};

    const campaigns = await this.discountCampaignModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Get products and participations for each campaign
    const campaignsWithRelations = await Promise.all(
      campaigns.map(async (campaign) => {
        const products = await this.campaignProductModel
          .find({ campaignId: campaign._id })
          .lean();
        const participations = await this.campaignParticipationModel
          .find({ campaignId: campaign._id })
          .lean();
        return { ...campaign, products, participations };
      })
    );

    return campaignsWithRelations;
  }

  async getActiveCampaigns(customerId?: string, productIds?: string[]) {
    const now = new Date();

    const filter: any = {
      status: CampaignStatus.ACTIVE,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    if (customerId) {
      const customer = await this.customerModel.findById(customerId).lean();

      if (customer) {
        filter.$or = [
          { targetTier: null },
          { targetTier: customer.loyaltyTier },
        ];
      }
    }

    const campaigns = await this.discountCampaignModel
      .find(filter)
      .sort({ discountValue: -1 })
      .lean();

    // Get products and participations for each campaign
    const campaignsWithRelations = await Promise.all(
      campaigns.map(async (campaign) => {
        const products = await this.campaignProductModel
          .find({ campaignId: campaign._id })
          .lean();
        const participations = await this.campaignParticipationModel
          .find({ campaignId: campaign._id })
          .lean();
        return { ...campaign, products, participations };
      })
    );

    if (productIds && productIds.length > 0) {
      const productObjectIds = productIds.map(id => new Types.ObjectId(id));
      return campaignsWithRelations.filter(campaign =>
        campaign.products.length === 0 ||
        campaign.products.some(cp => productObjectIds.some(id => id.equals(cp.productId)))
      );
    }

    return campaignsWithRelations;
  }

  async getCampaignById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    const campaign = await this.discountCampaignModel.findById(id).lean();

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    const products = await this.campaignProductModel
      .find({ campaignId: campaign._id })
      .lean();

    const participations = await this.campaignParticipationModel
      .find({ campaignId: campaign._id })
      .populate('customerId', 'name phone')
      .lean();

    return { ...campaign, products, participations };
  }

  async updateCampaign(id: string, data: Partial<CreateCampaignDto>) {
    await this.getCampaignById(id); // Check if exists

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

    await this.discountCampaignModel.findByIdAndUpdate(id, updateData);

    return this.getCampaignById(id);
  }

  async activateCampaign(id: string) {
    await this.getCampaignById(id); // Check if exists

    const updated = await this.discountCampaignModel.findByIdAndUpdate(
      id,
      {
        status: CampaignStatus.ACTIVE,
        isActive: true,
      },
      { new: true }
    );

    return updated;
  }

  async pauseCampaign(id: string) {
    await this.getCampaignById(id);

    const updated = await this.discountCampaignModel.findByIdAndUpdate(
      id,
      {
        status: CampaignStatus.PAUSED,
        isActive: false,
      },
      { new: true }
    );

    return updated;
  }

  async applyCampaignDiscount(id: string, customerId: string, subtotal: number) {
    const campaign = await this.getCampaignById(id);

    const now = new Date();
    if (campaign.status !== CampaignStatus.ACTIVE || !campaign.isActive) {
      throw new BadRequestException('Campaign is not active');
    }

    if (now < new Date(campaign.startDate) || now > new Date(campaign.endDate)) {
      throw new BadRequestException('Campaign is not currently running');
    }

    if (campaign.minPurchase && subtotal < Number(campaign.minPurchase)) {
      throw new BadRequestException(`Minimum purchase of $${campaign.minPurchase} required`);
    }

    if (campaign.targetTier) {
      const customer = await this.customerModel.findById(customerId).lean();

      if (!customer || customer.loyaltyTier !== campaign.targetTier) {
        throw new BadRequestException('Customer not eligible for this campaign');
      }
    }

    if (campaign.usageLimit && campaign.usageCount >= campaign.usageLimit) {
      throw new BadRequestException('Campaign usage limit reached');
    }

    let discountAmount: number;
    if (campaign.discountType === DiscountType.PERCENTAGE) {
      discountAmount = (subtotal * Number(campaign.discountValue)) / 100;
    } else {
      discountAmount = Math.min(Number(campaign.discountValue), subtotal);
    }

    if (campaign.maxDiscount && discountAmount > Number(campaign.maxDiscount)) {
      discountAmount = Number(campaign.maxDiscount);
    }

    // Check if participation already exists, if not create it
    const existingParticipation = await this.campaignParticipationModel.findOne({
      campaignId: new Types.ObjectId(id),
      customerId: new Types.ObjectId(customerId),
    });

    if (!existingParticipation) {
      const participation = new this.campaignParticipationModel({
        campaignId: new Types.ObjectId(id),
        customerId: new Types.ObjectId(customerId),
      });
      await participation.save();
    }

    // Increment campaign usage count
    await this.discountCampaignModel.findByIdAndUpdate(id, {
      $inc: { usageCount: 1 },
    });

    return {
      discountAmount,
      finalAmount: subtotal - discountAmount,
      campaign: {
        id: campaign._id,
        name: campaign.name,
        type: campaign.type,
        discountType: campaign.discountType,
        discountValue: Number(campaign.discountValue),
      },
    };
  }

  async getCampaignAnalytics(id: string) {
    const campaign = await this.getCampaignById(id);

    const participations = await this.campaignParticipationModel
      .find({ campaignId: new Types.ObjectId(id) })
      .populate('customerId', 'loyaltyTier')
      .lean();

    const sales = await this.saleModel
      .find({ discountCampaignId: new Types.ObjectId(id) })
      .select('totalAmount discountAmount createdAt')
      .lean();

    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const totalDiscountGiven = sales.reduce((sum, sale) => sum + Number(sale.discountAmount), 0);
    const uniqueCustomers = new Set(participations.map(p => p.customerId?.toString())).size;

    return {
      campaign: {
        id: campaign._id,
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

  async getRecommendedCampaigns(customerId: string) {
    const customer = await this.customerModel.findById(customerId).lean();

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const now = new Date();

    const campaigns = await this.discountCampaignModel
      .find({
        status: CampaignStatus.ACTIVE,
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $or: [
          { targetTier: null },
          { targetTier: customer.loyaltyTier },
        ],
      })
      .sort({ discountValue: -1 })
      .limit(10)
      .lean();

    // Get products for each campaign
    const campaignsWithProducts = await Promise.all(
      campaigns.map(async (campaign) => {
        const products = await this.campaignProductModel
          .find({ campaignId: campaign._id })
          .lean();
        return { ...campaign, products };
      })
    );

    return campaignsWithProducts;
  }

  async deleteCampaign(id: string) {
    await this.getCampaignById(id); // Check if exists

    // Delete related records first
    await this.campaignProductModel.deleteMany({ campaignId: new Types.ObjectId(id) });
    await this.campaignParticipationModel.deleteMany({ campaignId: new Types.ObjectId(id) });
    await this.discountCampaignModel.findByIdAndDelete(id);

    return { message: 'Campaign deleted successfully' };
  }

  async getCampaignStats() {
    const totalCampaigns = await this.discountCampaignModel.countDocuments();
    const activeCampaigns = await this.discountCampaignModel.countDocuments({
      status: CampaignStatus.ACTIVE,
    });

    const now = new Date();
    const expiredCampaigns = await this.discountCampaignModel.countDocuments({
      endDate: { $lt: now },
    });

    const totalParticipations = await this.campaignParticipationModel.countDocuments();
    const totalSales = await this.saleModel.countDocuments({
      discountCampaignId: { $ne: null },
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
      const tier = (participation.customerId as any)?.loyaltyTier || 'UNKNOWN';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupSalesByDay(sales: any[]) {
    return sales.reduce((acc, sale) => {
      const date = new Date(sale.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, revenue: 0, discountGiven: 0 };
      }
      acc[date].count += 1;
      acc[date].revenue += Number(sale.totalAmount);
      acc[date].discountGiven += Number(sale.discountAmount);
      return acc;
    }, {} as Record<string, { count: number; revenue: number; discountGiven: number }>);
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
