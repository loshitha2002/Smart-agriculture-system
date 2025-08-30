// Farmer Feedback and User Testing Service
const nodemailer = require('nodemailer');

class FarmerFeedbackService {
  constructor() {
    this.feedbackData = [];
    this.userProfiles = new Map();
    this.testingSessions = [];
  }

  // Create farmer profile for testing
  async createFarmerProfile(farmerData) {
    const profile = {
      id: this.generateId(),
      name: farmerData.name,
      location: farmerData.location,
      farmSize: farmerData.farmSize,
      cropTypes: farmerData.cropTypes,
      experienceLevel: farmerData.experienceLevel,
      techComfort: farmerData.techComfort,
      primaryChallenges: farmerData.primaryChallenges,
      createdAt: new Date().toISOString()
    };

    this.userProfiles.set(profile.id, profile);
    return profile;
  }

  // Schedule user testing session
  async scheduleFeedbackSession(farmerId, sessionType = 'usability') {
    const session = {
      id: this.generateId(),
      farmerId,
      sessionType,
      scheduledDate: new Date(),
      status: 'scheduled',
      tasks: this.getTestingTasks(sessionType),
      feedback: [],
      metrics: {}
    };

    this.testingSessions.push(session);
    await this.sendSessionInvitation(farmerId, session);
    
    return session;
  }

  // Get testing tasks based on session type
  getTestingTasks(sessionType) {
    const tasks = {
      usability: [
        {
          id: 1,
          title: 'Dashboard Navigation',
          description: 'Explore the main dashboard and find sensor readings',
          expectedTime: 5,
          successCriteria: 'User can locate and understand sensor data'
        },
        {
          id: 2,
          title: 'Irrigation Control',
          description: 'Start and stop irrigation using the mobile interface',
          expectedTime: 3,
          successCriteria: 'User successfully controls irrigation'
        },
        {
          id: 3,
          title: 'Disease Detection',
          description: 'Upload a plant image and interpret AI results',
          expectedTime: 7,
          successCriteria: 'User understands disease detection output'
        },
        {
          id: 4,
          title: 'Analytics Review',
          description: 'Review weekly analytics and understand insights',
          expectedTime: 10,
          successCriteria: 'User can interpret analytics data'
        }
      ],
      fieldTesting: [
        {
          id: 1,
          title: 'Real Farm Integration',
          description: 'Install sensors on actual crops',
          expectedTime: 60,
          successCriteria: 'Sensors properly installed and transmitting'
        },
        {
          id: 2,
          title: 'Daily Usage',
          description: 'Use system for daily farm management (1 week)',
          expectedTime: 10080, // 1 week in minutes
          successCriteria: 'Daily interaction with system'
        },
        {
          id: 3,
          title: 'Yield Comparison',
          description: 'Compare actual yield with AI predictions',
          expectedTime: 30,
          successCriteria: 'Predictions within 15% of actual yield'
        }
      ],
      accessibility: [
        {
          id: 1,
          title: 'Voice Interface',
          description: 'Test voice commands for irrigation control',
          expectedTime: 5,
          successCriteria: 'Voice commands work in noisy farm environment'
        },
        {
          id: 2,
          title: 'Mobile Responsiveness',
          description: 'Test app on different mobile devices',
          expectedTime: 10,
          successCriteria: 'App works on farmer\'s personal device'
        },
        {
          id: 3,
          title: 'Offline Functionality',
          description: 'Test system without internet connection',
          expectedTime: 15,
          successCriteria: 'Critical functions work offline'
        }
      ]
    };

    return tasks[sessionType] || tasks.usability;
  }

  // Collect structured feedback
  async collectFeedback(sessionId, taskId, feedback) {
    const feedbackEntry = {
      sessionId,
      taskId,
      timestamp: new Date().toISOString(),
      rating: feedback.rating, // 1-5 scale
      timeToComplete: feedback.timeToComplete,
      difficulties: feedback.difficulties,
      suggestions: feedback.suggestions,
      userQuotes: feedback.userQuotes,
      observerNotes: feedback.observerNotes
    };

    this.feedbackData.push(feedbackEntry);
    await this.analyzeFeedback(feedbackEntry);
    
    return feedbackEntry;
  }

  // Real-time feedback analysis
  async analyzeFeedback(feedback) {
    const analysis = {
      usabilityScore: this.calculateUsabilityScore(feedback),
      commonIssues: this.identifyCommonIssues(),
      improvementPriorities: this.prioritizeImprovements(),
      recommendations: this.generateRecommendations(feedback)
    };

    // Auto-generate bug reports for critical issues
    if (feedback.rating <= 2) {
      await this.createBugReport(feedback);
    }

    return analysis;
  }

  // Calculate System Usability Scale (SUS) score
  calculateUsabilityScore(feedback) {
    // Simplified SUS calculation
    const baseScore = feedback.rating * 20; // Convert 1-5 to 0-100
    const timepenalty = feedback.timeToComplete > feedback.expectedTime ? -10 : 0;
    const difficultyPenalty = feedback.difficulties.length * -5;
    
    return Math.max(0, Math.min(100, baseScore + timepenalty + difficultyPenalty));
  }

  // Identify patterns in feedback
  identifyCommonIssues() {
    const issueFrequency = {};
    
    this.feedbackData.forEach(feedback => {
      feedback.difficulties.forEach(difficulty => {
        issueFrequency[difficulty] = (issueFrequency[difficulty] || 0) + 1;
      });
    });

    return Object.entries(issueFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue, frequency]) => ({ issue, frequency }));
  }

  // A/B testing for feature improvements
  async setupABTest(feature, variants) {
    const abTest = {
      id: this.generateId(),
      feature,
      variants,
      participants: [],
      startDate: new Date(),
      status: 'active',
      metrics: {
        conversionRate: {},
        usabilityScore: {},
        userSatisfaction: {}
      }
    };

    return abTest;
  }

  // Generate farmer-specific insights
  async generateFarmerInsights(farmerId) {
    const profile = this.userProfiles.get(farmerId);
    const farmerFeedback = this.feedbackData.filter(f => f.farmerId === farmerId);
    
    return {
      adaptationRate: this.calculateAdaptationRate(farmerFeedback),
      preferredFeatures: this.identifyPreferredFeatures(farmerFeedback),
      strugglingAreas: this.identifyStrugglingAreas(farmerFeedback),
      customRecommendations: this.generateCustomRecommendations(profile, farmerFeedback),
      trainingNeeds: this.identifyTrainingNeeds(farmerFeedback)
    };
  }

  // Automated feedback collection via mobile
  async setupMobileFeedbackCollection() {
    return {
      quickFeedback: {
        triggers: ['after_irrigation', 'disease_detection', 'harvest_prediction'],
        questions: [
          'How accurate was this prediction?',
          'How easy was this to use?',
          'What would make this better?'
        ]
      },
      dailyCheck: {
        time: '18:00',
        questions: [
          'What farming tasks did you complete today?',
          'How did our system help you?',
          'Any issues or suggestions?'
        ]
      },
      weeklyReview: {
        day: 'Sunday',
        questions: [
          'Overall satisfaction this week?',
          'Most useful feature?',
          'Biggest challenge?'
        ]
      }
    };
  }

  // Send testing invitation
  async sendSessionInvitation(farmerId, session) {
    const farmer = this.userProfiles.get(farmerId);
    
    // Email/SMS invitation logic here
    console.log(`📧 Sending testing invitation to ${farmer.name} for ${session.sessionType} session`);
    
    return { sent: true, farmerId, sessionId: session.id };
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Export feedback data for analysis
  async exportFeedbackData(format = 'json') {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalFeedback: this.feedbackData.length,
        totalFarmers: this.userProfiles.size
      },
      farmers: Array.from(this.userProfiles.values()),
      feedback: this.feedbackData,
      sessions: this.testingSessions,
      summary: await this.generateSummaryReport()
    };

    return format === 'json' ? exportData : this.convertToCSV(exportData);
  }

  async generateSummaryReport() {
    return {
      averageUsabilityScore: this.feedbackData.reduce((sum, f) => sum + (f.rating * 20), 0) / this.feedbackData.length,
      mostCommonIssues: this.identifyCommonIssues(),
      farmerSatisfaction: this.calculateOverallSatisfaction(),
      featureAdoption: this.calculateFeatureAdoption(),
      recommendations: this.generateSystemRecommendations()
    };
  }
}

module.exports = new FarmerFeedbackService();
