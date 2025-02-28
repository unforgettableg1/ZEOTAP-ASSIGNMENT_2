import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";

// CDP-specific responses
const CDP_RESPONSES = {
  segment: {
    "source": [
      "To set up a new source in Segment:\n1. Go to Connections > Sources\n2. Click 'Add Source'\n3. Choose your source type\n4. Configure the source settings\n5. Add the Segment snippet to your website",
      "Would you like more specific information about a particular source type?"
    ],
    "general": [
      "Segment is a Customer Data Platform that helps collect, clean, and control customer data.",
      "Segment provides tools for collecting user data from your websites, mobile apps, and servers."
    ]
  },
  mparticle: {
    "profile": [
      "To create a user profile in mParticle:\n1. Navigate to User Profile\n2. Click 'Create Profile'\n3. Define user attributes\n4. Set up identity mapping\n5. Configure data collection",
      "Would you like to know more about specific user attributes?"
    ],
    "general": [
      "mParticle is a Customer Data Platform focused on mobile and web data integration.",
      "mParticle helps businesses collect and manage customer data across multiple platforms."
    ]
  },
  lytics: {
    "audience": [
      "To build an audience segment in Lytics:\n1. Go to Audiences\n2. Click 'Create Audience'\n3. Define segment criteria\n4. Set behavioral rules\n5. Save and activate",
      "Do you need help with specific audience criteria?"
    ],
    "general": [
      "Lytics is a Customer Data Platform specializing in behavioral analytics and personalization.",
      "Lytics helps create personalized customer experiences using machine learning."
    ]
  },
  zeotap: {
    "integration": [
      "To integrate data with Zeotap:\n1. Access Data Integration\n2. Select data source\n3. Configure connection settings\n4. Map data fields\n5. Verify and activate",
      "Would you like details about specific integration types?"
    ],
    "general": [
      "Zeotap is a Customer Data Platform focusing on data unification and identity resolution.",
      "Zeotap helps businesses create unified customer profiles across multiple data sources."
    ]
  }
};

function findBestResponse(question: string): string {
  // Convert question to lowercase for better matching
  const q = question.toLowerCase();

  // Check for specific CDP mentions
  if (q.includes("segment")) {
    if (q.includes("source") || q.includes("set up")) {
      return CDP_RESPONSES.segment.source[0];
    }
    return CDP_RESPONSES.segment.general[0];
  }

  if (q.includes("mparticle") || q.includes("m particle")) {
    if (q.includes("profile") || q.includes("user")) {
      return CDP_RESPONSES.mparticle.profile[0];
    }
    return CDP_RESPONSES.mparticle.general[0];
  }

  if (q.includes("lytics")) {
    if (q.includes("audience") || q.includes("segment")) {
      return CDP_RESPONSES.lytics.audience[0];
    }
    return CDP_RESPONSES.lytics.general[0];
  }

  if (q.includes("zeotap")) {
    if (q.includes("integrate") || q.includes("connection")) {
      return CDP_RESPONSES.zeotap.integration[0];
    }
    return CDP_RESPONSES.zeotap.general[0];
  }

  // Default responses for unknown questions
  return "I can help you with questions about Segment, mParticle, Lytics, and Zeotap. What would you like to know about these CDPs?";
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/messages", async (_req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    const result = insertMessageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid message format" });
    }

    const userMessage = await storage.createMessage(result.data);

    // Generate appropriate response after short delay
    setTimeout(async () => {
      const response = findBestResponse(result.data.content);
      await storage.createMessage({
        content: response,
        isBot: true,
      });
    }, 1000);

    res.json(userMessage);
  });

  const httpServer = createServer(app);
  return httpServer;
}