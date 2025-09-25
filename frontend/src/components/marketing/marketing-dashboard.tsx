'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Users,
  Gift,
  Percent,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Zap,
  Plus,
  Eye,
  BarChart3,
  Crown
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useCampaignStore } from '@/hooks/use-campaign-store'
import { useLoyaltyStore } from '@/hooks/use-loyalty-store'
import { useDiscountCodeStore } from '@/hooks/use-discount-code-store'

export default function MarketingDashboard() {
  const {
    campaigns,
    activeCampaigns,
    loading: campaignLoading,
    fetchCampaigns,
    fetchActiveCampaigns
  } = useCampaignStore()

  const {
    loyaltyStats,
    loading: loyaltyLoading,
    fetchLoyaltyStats
  } = useLoyaltyStore()

  const {
    discountStats,
    loading: discountLoading,
    fetchDiscountStats
  } = useDiscountCodeStore()

  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    fetchCampaigns()
    fetchActiveCampaigns()
    fetchLoyaltyStats()
    fetchDiscountStats()
  }, [fetchCampaigns, fetchActiveCampaigns, fetchLoyaltyStats, fetchDiscountStats])

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'text-amber-600 bg-amber-100'
      case 'SILVER': return 'text-gray-600 bg-gray-100'
      case 'GOLD': return 'text-yellow-600 bg-yellow-100'
      case 'PLATINUM': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100'
      case 'DRAFT': return 'text-gray-600 bg-gray-100'
      case 'PAUSED': return 'text-yellow-600 bg-yellow-100'
      case 'COMPLETED': return 'text-blue-600 bg-blue-100'
      case 'CANCELLED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (campaignLoading || loyaltyLoading || discountLoading) {
    return (
      <div className="p-6 space-y-6 h-full overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Loading marketing dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Dashboard</h1>
          <p className="text-gray-500">Manage campaigns, loyalty programs, and customer retention</p>
        </div>
        <div className="flex space-x-2">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Campaign</span>
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {['overview', 'campaigns', 'loyalty', 'discounts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeCampaigns.length}</div>
                <p className="text-xs text-muted-foreground">
                  {campaigns.filter(c => c.status === 'DRAFT').length} in draft
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loyalty Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loyaltyStats?.totalCustomers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {loyaltyStats?.redemptionRate?.toFixed(1) || 0}% redemption rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loyaltyStats?.totalPointsIssued?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {loyaltyStats?.totalPointsRedeemed?.toLocaleString() || 0} redeemed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(discountStats?.totalSavings || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {discountStats?.totalCodes || 0} discount codes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Loyalty Tier Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="h-5 w-5" />
                  <span>Loyalty Tier Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loyaltyStats?.tierDistribution ? (
                  <div className="space-y-3">
                    {loyaltyStats.tierDistribution.map((tier: any) => (
                      <div key={tier.loyaltyTier} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(tier.loyaltyTier)}`}>
                            {tier.loyaltyTier}
                          </span>
                          <span className="text-sm">{tier._count} customers</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Avg: {tier._avg.loyaltyPoints?.toFixed(0) || 0} pts
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No loyalty data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Campaign Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{campaign.name}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCampaignStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {campaign.usageCount} uses
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                  <Target className="h-6 w-6 mb-2 text-blue-600" />
                  <span className="text-sm">Create Campaign</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                  <Percent className="h-6 w-6 mb-2 text-green-600" />
                  <span className="text-sm">Bulk Discounts</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                  <Award className="h-6 w-6 mb-2 text-purple-600" />
                  <span className="text-sm">Bonus Points</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                  <TrendingUp className="h-6 w-6 mb-2 text-orange-600" />
                  <span className="text-sm">View Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Other tabs content would go here */}
      {selectedTab !== 'overview' && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Management
              </h3>
              <p className="text-gray-500">
                {selectedTab} management interface will be implemented here
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
