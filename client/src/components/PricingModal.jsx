import React, { useState } from 'react';
import { X, Check, Zap, Shield, Sparkles, CreditCard, QrCode, Lock, CheckCircle2 } from 'lucide-react';
import { UseAppContext } from '../context/AppContext';
import api from '../api/api';
import toast from 'react-hot-toast';

const PricingModal = () => {
  const { isUpgradeModalOpen, setIsUpgradeModalOpen, user, setUser } = UseAppContext();
  const [currency, setCurrency] = useState('USD'); // 'USD' | 'INR'
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [step, setStep] = useState('plans'); // 'plans' | 'checkout' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi'
  const [processing, setProcessing] = useState(false);

  if (!isUpgradeModalOpen) return null;

  const plans = [
    {
      id: 'free',
      name: 'Starter',
      priceUSD: '$0',
      priceINR: '₹0',
      period: 'forever',
      credits: 20,
      description: 'Ideal for testing out and building your first project.',
      features: [
        '5 AI Generated Websites',
        '20 Initial Credits',
        'Full React Code Export (ZIP)',
        'Live Sandpack Preview',
        'Standard Generation Speed'
      ],
      current: user?.plan === 'free',
    },
    {
      id: 'pro',
      name: 'Pro Builder',
      priceUSD: '$19',
      priceINR: '₹799',
      period: 'per month',
      credits: 200,
      popular: true,
      description: 'For creators, freelancers, and businesses demanding top tier output.',
      features: [
        'Unlimited AI Website Builds',
        '200 Monthly Generation Credits',
        'Priority Gemini AI Generation Engine',
        'Instant Public Domain Sharing',
        'Remove Ignited Minds Watermark',
        'Fast Priority Chat Iterations'
      ],
      current: user?.plan === 'pro',
    },
    {
      id: 'enterprise',
      name: 'Agency Scale',
      priceUSD: '$49',
      priceINR: '₹2,499',
      period: 'per month',
      credits: 1000,
      description: 'Full commercial license and power for high-volume agencies.',
      features: [
        'Unlimited AI Websites & Workspaces',
        '1,000 Generation Credits / mo',
        'Full Commercial Resale Rights',
        'Multi-User Team Collaboration',
        '24/7 Priority SLA Engineering Support',
        'Custom Design Tokens & Branding'
      ],
      current: user?.plan === 'enterprise',
    }
  ];

  const handleStartCheckout = (planId) => {
    if (planId === 'free') {
      toast('You are already on the Starter plan.');
      return;
    }
    setSelectedPlan(planId);
    setStep('checkout');
  };

  const handleSimulatePayment = async () => {
    setProcessing(true);
    try {
      // 1. Create simulated order
      const orderRes = await api.post('/api/payments/create-order', {
        planId: selectedPlan,
        currency,
      });

      // Simulated network/processing delay (1.2s)
      await new Promise((r) => setTimeout(r, 1200));

      // 2. Verify payment
      const verifyRes = await api.post('/api/payments/verify', {
        orderId: orderRes.data?.orderId,
        planId: selectedPlan,
        paymentMethod: paymentMethod === 'card' ? 'Visa / Mastercard' : 'UPI Instant',
      });

      if (verifyRes.data?.user) {
        setUser(verifyRes.data.user);
      }
      setStep('success');
      toast.success(`🎉 Upgraded to ${selectedPlan.toUpperCase()} successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment simulation failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setIsUpgradeModalOpen(false);
    setStep('plans');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-10 text-stone-900">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
        >
          <X size={20} />
        </button>

        {step === 'plans' && (
          <div>
            {/* Header */}
            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 mb-3">
                <Sparkles size={14} /> Power Your Growth
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Unlock Premium AI Website Generation
              </h2>
              <p className="mt-2 text-stone-500 text-sm sm:text-base">
                Get more credits, priority Gemini generation, and custom domain publishing.
              </p>

              {/* Currency Selector */}
              <div className="inline-flex items-center gap-1 p-1 mt-5 bg-stone-100 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1.5 rounded-lg transition ${currency === 'USD' ? 'bg-white shadow text-stone-900' : 'text-stone-500'}`}
                >
                  USD ($)
                </button>
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-3 py-1.5 rounded-lg transition ${currency === 'INR' ? 'bg-white shadow text-stone-900' : 'text-stone-500'}`}
                >
                  INR (₹)
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {plans.map((p) => {
                const isSelected = p.id === selectedPlan;
                return (
                  <div
                    key={p.id}
                    className={`relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl border-2 transition-all ${
                      p.popular
                        ? 'border-rose-500 bg-rose-50/20 shadow-lg shadow-rose-500/5'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-sm">
                        Most Popular
                      </span>
                    )}

                    <div>
                      <h3 className="text-lg font-bold text-stone-900">{p.name}</h3>
                      <p className="text-xs text-stone-500 mt-1 min-h-[32px]">{p.description}</p>

                      <div className="my-5">
                        <span className="text-4xl font-extrabold text-stone-950">
                          {currency === 'INR' ? p.priceINR : p.priceUSD}
                        </span>
                        <span className="text-xs text-stone-500 ml-1.5 font-medium">/{p.period}</span>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-700 mb-5">
                        <Zap size={14} className="text-amber-500" />
                        <span>{p.credits} AI Credits</span>
                      </div>

                      <ul className="space-y-2.5 text-xs text-stone-600 mb-6">
                        {p.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleStartCheckout(p.id)}
                      disabled={p.current}
                      className={`w-full py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                        p.current
                          ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                          : p.popular
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20'
                          : 'bg-stone-900 hover:bg-stone-800 text-white'
                      }`}
                    >
                      {p.current ? 'Current Plan' : `Upgrade to ${p.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 'checkout' && (
          <div className="max-w-lg mx-auto py-2">
            <div className="text-center mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Secure Checkout</span>
              <h2 className="text-2xl font-bold mt-1">Complete Your Upgrade</h2>
              <p className="text-xs text-stone-500 mt-1">
                You are subscribing to the <strong className="text-stone-800">{selectedPlan.toUpperCase()}</strong> plan ({currency === 'INR' ? (selectedPlan === 'enterprise' ? '₹2,499' : '₹799') : (selectedPlan === 'enterprise' ? '$49' : '$19')}).
              </p>
            </div>

            {/* Simulated Payment Notice Banner */}
            <div className="p-3.5 mb-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <Shield size={18} className="shrink-0 text-amber-600" />
              <span>
                <strong>Simulated Payment Gateway:</strong> Real transactions are simulated safely for testing and production demonstrations. No actual card will be charged!
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
              >
                <CreditCard size={16} /> Credit / Debit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
              >
                <QrCode size={16} /> UPI / QR Scan
              </button>
            </div>

            {paymentMethod === 'card' ? (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    defaultValue={user?.name || "Alex Rivera"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue="4242 •••• •••• 4242"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-rose-500"
                    />
                    <Lock size={14} className="absolute right-3.5 top-3 text-stone-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Expires</label>
                    <input
                      type="text"
                      defaultValue="12/28"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">CVC / CVV</label>
                    <input
                      type="text"
                      defaultValue="982"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono text-stone-900"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50 text-center">
                <div className="w-32 h-32 mx-auto mb-3 bg-white p-2 rounded-xl border flex items-center justify-center shadow-sm">
                  <div className="text-center font-mono text-[10px] text-stone-600">
                    [ UPI QR CODE ]<br/>
                    <span className="text-rose-600 font-bold">ignitedminds@upi</span>
                  </div>
                </div>
                <p className="text-xs text-stone-600">Scan with Google Pay, PhonePe, Paytm, or BHIM</p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep('plans')}
                className="w-1/3 py-3 rounded-xl border border-stone-200 text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={processing}
                className="w-2/3 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {processing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <span>Pay & Activate Plan</span>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-3xl font-bold text-stone-900">Payment Successful!</h2>
            <p className="text-stone-500 text-sm mt-2 mb-8">
              Your account has been upgraded to the <strong>{selectedPlan.toUpperCase()}</strong> tier and new credits have been credited to your balance.
            </p>
            <button
              onClick={handleClose}
              className="px-8 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm transition cursor-pointer shadow-lg"
            >
              Start Building Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingModal;

