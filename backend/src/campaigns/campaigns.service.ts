import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CampaignType, CampaignStatus, DiscountType, LoyaltyTier } from '@prisma/client';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

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

    const campaign = await this.prisma.campaign.create({
      data: {
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
      },
      include: {
        products: true,
        participations: true,
        _count: {
          select: {
            participations: true,
            sales: true,
          },
        },
      },
    });

    if (data.productIds && data.productIds.length > 0) {
      await this.prisma.campaignProduct.createMany({
        data: data.productIds.map(productId => ({
          campaignId: campaign.id,
          productId,
        })),
      });
    }

    return campaign;
  }

  async getCampaigns(status?: CampaignStatus) {
    const where = status ? { status } : {};

    return this.prisma.campaign.findMany({
      where,
      include: {
        products: {
          include: {
            product: {
              select: { id: true, name: true, price: true },
            },
          },
        },
        participations: true,
        _count: {
          select: {
            participations: true,
            sales: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActiveCampaigns(customerId?: string, productIds?: string[]) {
    const now = new Date();

    const where: any = {
      status: CampaignStatus.ACTIVE,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    };

    if (customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        select: { loyaltyTier: true },
      });

      if (customer) {
        where.OR = [
          { targetTier: null },
          { targetTier: customer.loyaltyTier },
        ];
      }
    }

    const campaigns = await this.prisma.campaign.findMany({
      where,
      include: {
        products: {
          include: {
            product: {
              select: { id: true, name: true, price: true },
            },
          },
        },
        _count: {
          select: {
            participations: true,
            sales: true,
          },
        },
      },
      orderBy: { discountValue: 'desc' },
    });

    if (productIds && productIds.length > 0) {
      return campaigns.filter(campaign =>
        campaign.products.length === 0 ||
        campaign.products.some(cp => productIds.includes(cp.productId))
      );
    }

    return campaigns;
  }

  async getCampaignById(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              select: { id: true, name: true, price: true },
            },
          },
        },
        participations: {
          include: {
            customer: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
        _count: {
          select: {
            participations: true,
            sales: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async updateCampaign(id: string, data: Partial<CreateCampaignDto>) {
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

    return this.prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        products: true,
        participations: true,
        _count: {
          select: {
            participations: true,
            sales: true,
          },
        },
      },
    });
  }

  async activateCampaign(id: string) {
    await this.getCampaignById(id); // Check if exists

    return this.prisma.campaign.update({
      where: { id },
      data: {
        status: CampaignStatus.ACTIVE,
        isActive: true,
      },
    });
  }

  async pauseCampaign(id: string) {
    const campaign = await this.getCampaignById(id);

    return this.prisma.campaign.update({
      where: { id },
      data: {
        status: CampaignStatus.PAUSED,
        isActive: false,
      },
    });
  }

  async applyCampaignDiscount(id: string, customerId: string, subtotal: number, productIds?: string[]) {
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
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        select: { loyaltyTier: true },
      });

      if (!customer || customer.loyaltyTier !== campaign.targetTier) {
        throw new BadRequestException('Customer not eligible for this campaign');
      }
    }

    if (campaign.usageLimit && campaign.usageCount >= campaign.usageLimit) {
      throw new BadRequestException('Campaign usage limit reached');
    }

    let discountAmount = 0;
    if (campaign.discountType === DiscountType.PERCENTAGE) {
      discountAmount = (subtotal * Number(campaign.discountValue)) / 100;
    } else {
      discountAmount = Math.min(Number(campaign.discountValue), subtotal);
    }

    if (campaign.maxDiscount && discountAmount > Number(campaign.maxDiscount)) {
      discountAmount = Number(campaign.maxDiscount);
    }

    await this.prisma.campaignParticipation.upsert({
      where: {
        campaignId_customerId: {
          campaignId: id,
          customerId,
        },
      },
      create: {
        campaignId: id,
        customerId,
        usageCount: 1,
      },
      update: {
        usageCount: { increment: 1 },
      },
    });

    await this.prisma.campaign.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
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

  async getCampaignAnalytics(id: string) {
    const campaign = await this.getCampaignById(id);

    const participations = await this.prisma.campaignParticipation.findMany({
      where: { campaignId: id },
      include: {
        customer: {
          select: { loyaltyTier: true },
        },
      },
    });

    const sales = await this.prisma.sale.findMany({
      where: { campaignId: id },
      select: {
        totalAmount: true,
        discountAmount: true,
        createdAt: true,
      },
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

  async getRecommendedCampaigns(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        loyaltyTier: true,
        totalSpent: true,
        visitCount: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const now = new Date();

    return this.prisma.campaign.findMany({
      where: {
        status: CampaignStatus.ACTIVE,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        OR: [
          { targetTier: null },
          { targetTier: customer.loyaltyTier },
        ],
      },
      include: {
        products: {
          include: {
            product: {
              select: { id: true, name: true, price: true },
            },
          },
        },
      },
      orderBy: { discountValue: 'desc' },
      take: 5,
    });
  }

  async createAutomaticCampaigns() {
    const welcomeCampaign = await this.prisma.campaign.create({
      data: {
        name: 'Welcome New Customers',
        description: 'Special discount for new customers',
        type: CampaignType.NEW_CUSTOMER,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        targetTier: LoyaltyTier.BRONZE,
        status: CampaignStatus.ACTIVE,
      },
    });

    const loyaltyCampaign = await this.prisma.campaign.create({
      data: {
        name: 'Loyalty Rewards',
        description: 'Extra discount for loyal customers',
        type: CampaignType.LOYALTY_BONUS,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        discountType: DiscountType.PERCENTAGE,
        discountValue: 15,
        targetTier: LoyaltyTier.GOLD,
        minPurchase: 50,
        status: CampaignStatus.ACTIVE,
      },
    });

    return {
      created: [welcomeCampaign, loyaltyCampaign],
      message: 'Automatic campaigns created successfully',
    };
  }

  private groupParticipationsByTier(participations: any[]) {
    const groups = participations.reduce((acc, p) => {
      const tier = p.customer.loyaltyTier;
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(groups).map(([tier, count]) => ({
      tier,
      count,
    }));
  }

  private groupSalesByDay(sales: any[]) {
    const groups = sales.reduce((acc, sale) => {
      const date = sale.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(groups).map(([date, count]) => ({
      date,
      count,
    }));
  }
}
