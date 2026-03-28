import Campaign from "../models/Campaign.js";

export const getDashboardStats = async (req, res) => {
  if (!req.user) {
    return res.json({
      stats: {
        lifetimeTotal: 0,
        emailsToday: 0,
        failedEmails: 0,
        scheduledCount: 0,
        pendingCount: 0,
        thisWeekTotal: 0
      },
      weeklyStats: [0,0,0,0,0,0,0],
      recentCampaigns: [],
      statusCounts: {}
    });
  }

  try {
    const userId = req.user._id;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const baseFilter = { 
      user: userId, 
      deletedAt: { $exists: false } 
    };

    console.log(`Dashboard stats for user ${userId}, filter:`, baseFilter);

    const statusCounts = await Campaign.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const statusMap = statusCounts.reduce((acc, stat) => {
      acc[stat._id || 'sent'] = stat.count;
      return acc;
    }, {});
    statusMap.partial = statusMap.partial || 0;
    statusMap.scheduled = statusMap.scheduled || 0;
    statusMap.pending = statusMap.pending || 0;

    // Active sent campaigns
    const sentCampaigns = await Campaign.find({ 
      ...baseFilter,
      status: { $in: ['sent', 'partial'] } 
    });

    let lifetimeTotal = 0;
    let emailsToday = 0;
    let thisWeekTotal = 0;

    // Midnight today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); 

    // Start of current week (Monday)
    const weekStart = new Date(todayStart);
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

    // Weekly array (Mon → Sun, this week)
    const weeklyStats = [0,0,0,0,0,0,0];

    console.log(`Found ${sentCampaigns.length} sent/partial campaigns`);

    sentCampaigns.forEach((campaign) => {
      const sentDate = new Date(campaign.sentAt || campaign.createdAt);

      lifetimeTotal += campaign.totalEmails;

      if (sentDate >= todayStart) {
        emailsToday += campaign.totalEmails;
        console.log(`Today campaign: ${campaign.subject}, emails: ${campaign.totalEmails}`);
      }

      if (sentDate >= weekStart) {
        thisWeekTotal += campaign.totalEmails;
        
        // Only plot to weekly chart if it was sent THIS week
        const day = sentDate.getDay();
        const index = (day + 6) % 7; // Mon=0, Sun=6
        weeklyStats[index] += campaign.totalEmails;
      }
    });

    console.log(`Lifetime: ${lifetimeTotal}, Today: ${emailsToday}, Week: ${thisWeekTotal}`);

    // Failed emails: results + failed campaigns
    let failedEmails = 0;
    const allActiveCampaigns = await Campaign.find(baseFilter);
    allActiveCampaigns.forEach(campaign => {
      // Failed results
      if (campaign.results && Array.isArray(campaign.results)) {
        failedEmails += campaign.results.filter(r => r.status === 'failed').length;
      }
      // Whole failed campaigns
      if (campaign.status === 'failed') {
        failedEmails += campaign.totalEmails || 0;
      }
    });
    console.log(`Failed emails total: ${failedEmails}`);

    // Recent campaigns (exclude deleted/failed, only active)
    const recentCampaigns = await Campaign
      .find({ 
        ...baseFilter,
        $or: [
          { status: { $ne: 'failed' } },
          { scheduledAt: { $exists: true } }
        ]
      })
      .sort({ sentAt: -1, scheduledAt: -1, createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        lifetimeTotal,
        emailsToday,
        failedEmails,
        thisWeekTotal,
        scheduledCount: statusMap.scheduled || 0,
        pendingCount: statusMap.pending || 0
      },
      weeklyStats,
      recentCampaigns,
      statusCounts: statusMap
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      message: error.message
    });
  }
};
