import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { UserModel } from '../models/User.js';
import { TransactionModel } from '../models/Transaction.js';

const router = express.Router();

const PLANS = {
  free: {
    id: 'free',
    name: 'Starter',
    priceUSD: 0,
    priceINR: 0,
    credits: 20,
    features: [
      '5 AI Generated Websites',
      '20 Starter Credits',
      'Full React Code Export (ZIP)',
      'Live Sandpack Preview',
      'Community Support'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro Builder',
    priceUSD: 19,
    priceINR: 799,
    credits: 200,
    popular: true,
    features: [
      'Unlimited AI Website Builds',
      '200 Monthly Generation Credits',
      'Priority Gemini 1.5 Flash AI Engine',
      'Instant Public Domain Sharing',
      'No Ignited Minds Watermark',
      'Priority Chat Iteration'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Agency Scale',
    priceUSD: 49,
    priceINR: 2499,
    credits: 1000,
    features: [
      'Unlimited AI Websites & Workspaces',
      '1,000 Generation Credits / mo',
      'Commercial Resale License',
      'Multi-User Team Collaboration',
      'Dedicated Priority Engineering Support',
      'Custom Component Design Tokens'
    ]
  }
};

// Get available subscription plans (public)
router.get('/plans', (req, res) => {
  res.json({ plans: Object.values(PLANS) });
});

// Protected routes below
router.use(requireAuth);

// Create simulated checkout order
router.post('/create-order', async (req, res) => {
  try {
    const { planId, currency = 'USD' } = req.body;
    const plan = PLANS[planId];

    if (!plan || planId === 'free') {
      return res.status(400).json({ error: 'Invalid plan selected for checkout.' });
    }

    const amount = currency === 'INR' ? plan.priceINR : plan.priceUSD;
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    res.json({
      orderId,
      amount,
      currency,
      planId: plan.id,
      planName: plan.name,
      credits: plan.credits,
      customer: {
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to initiate order.' });
  }
});

// Verify simulated payment & apply credits/plan
router.post('/verify', async (req, res) => {
  try {
    const { orderId, planId, paymentMethod = 'Credit Card' } = req.body;
    const plan = PLANS[planId];

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan.' });
    }

    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Generate simulated payment reference
    const paymentId = `pay_sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Add credits and update plan
    const newCredits = (user.credits || 0) + plan.credits;
    const updatedUser = await UserModel.updateById(user._id, {
      plan: plan.id,
      credits: newCredits
    });

    // Save transaction
    const transaction = await TransactionModel.create({
      userId: user._id.toString(),
      orderId: orderId || `order_${Date.now()}`,
      paymentId,
      amount: plan.priceUSD,
      currency: 'USD',
      plan: plan.id,
      creditsAdded: plan.credits,
      status: 'successful'
    });

    res.json({
      success: true,
      message: `🎉 Successfully upgraded to ${plan.name}! ${plan.credits} credits added to your account.`,
      transaction,
      user: {
        _id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        credits: updatedUser.credits,
        plan: updatedUser.plan,
        avatar: updatedUser.avatar
      }
    });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ error: 'Payment verification failed.' });
  }
});

// Get payment transaction history
router.get('/history', async (req, res) => {
  try {
    const history = await TransactionModel.findByUserId(req.user._id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve transaction history.' });
  }
});

export default router;

