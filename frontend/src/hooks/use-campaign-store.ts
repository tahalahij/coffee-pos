import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { campaignService, type Campaign } from '@/lib/services'
import toast from 'react-hot-toast'

interface CampaignStore {
  campaigns: Campaign[]
  activeCampaigns: Campaign[]
  loading: boolean
  error: string | null
  fetchCampaigns: () => Promise<void>
  fetchActiveCampaigns: (customerId?: string, productIds?: string[]) => Promise<void>
  createCampaign: (campaign: Omit<Campaign, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateCampaign: (id: string, campaign: Partial<Campaign>) => Promise<void>
  activateCampaign: (id: string) => Promise<void>
  pauseCampaign: (id: string) => Promise<void>
  getCampaignAnalytics: (id: string) => Promise<any>
  getRecommendedCampaigns: (customerId: string) => Promise<Campaign[]>
}

export const useCampaignStore = create<CampaignStore>()(
  persist(
    (set, get) => ({
      campaigns: [],
      activeCampaigns: [],
      loading: false,
      error: null,

      fetchCampaigns: async () => {
        try {
          set({ loading: true, error: null })
          const campaigns = await campaignService.getAll()
          set({ campaigns, loading: false })
        } catch (error) {
          console.error('Error fetching campaigns:', error)
          set({ error: 'Failed to fetch campaigns', loading: false })
          toast.error('Failed to fetch campaigns')
        }
      },

      fetchActiveCampaigns: async (customerId, productIds) => {
        try {
          const activeCampaigns = await campaignService.getActive(customerId, productIds)
          set({ activeCampaigns })
        } catch (error) {
          console.error('Error fetching active campaigns:', error)
          toast.error('Failed to fetch active campaigns')
        }
      },

      createCampaign: async (campaignData) => {
        try {
          set({ loading: true, error: null })
          const newCampaign = await campaignService.create(campaignData)
          set(state => ({
            campaigns: [newCampaign, ...state.campaigns],
            loading: false
          }))
          toast.success('Campaign created successfully!')
        } catch (error) {
          console.error('Error creating campaign:', error)
          set({ error: 'Failed to create campaign', loading: false })
          toast.error('Failed to create campaign')
          throw error
        }
      },

      updateCampaign: async (id, campaignData) => {
        try {
          const updatedCampaign = await campaignService.update(id, campaignData)
          set(state => ({
            campaigns: state.campaigns.map(campaign =>
              campaign.id === id ? updatedCampaign : campaign
            )
          }))
          toast.success('Campaign updated successfully!')
        } catch (error) {
          console.error('Error updating campaign:', error)
          toast.error('Failed to update campaign')
        }
      },

      activateCampaign: async (id) => {
        try {
          const activatedCampaign = await campaignService.activate(id)
          set(state => ({
            campaigns: state.campaigns.map(campaign =>
              campaign.id === id ? activatedCampaign : campaign
            )
          }))
          toast.success('Campaign activated successfully!')
        } catch (error) {
          console.error('Error activating campaign:', error)
          toast.error('Failed to activate campaign')
        }
      },

      pauseCampaign: async (id) => {
        try {
          const pausedCampaign = await campaignService.pause(id)
          set(state => ({
            campaigns: state.campaigns.map(campaign =>
              campaign.id === id ? pausedCampaign : campaign
            )
          }))
          toast.success('Campaign paused successfully!')
        } catch (error) {
          console.error('Error pausing campaign:', error)
          toast.error('Failed to pause campaign')
        }
      },

      getCampaignAnalytics: async (id) => {
        try {
          return await campaignService.getAnalytics(id)
        } catch (error) {
          console.error('Error fetching campaign analytics:', error)
          toast.error('Failed to fetch campaign analytics')
          throw error
        }
      },

      getRecommendedCampaigns: async (customerId) => {
        try {
          return await campaignService.getRecommended(customerId)
        } catch (error) {
          console.error('Error fetching recommended campaigns:', error)
          toast.error('Failed to fetch recommended campaigns')
          throw error
        }
      }
    }),
    {
      name: 'campaign-storage',
    }
  )
)
