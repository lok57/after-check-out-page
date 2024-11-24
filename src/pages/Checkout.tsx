import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import AddressSection from '../components/checkout/AddressSection';
import PaymentSection from '../components/checkout/PaymentSection';
import OrderSummary from '../components/checkout/OrderSummary';
import CheckoutProgress from '../components/checkout/CheckoutProgress';
import { ArrowLeft, ShoppingBag, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

type CheckoutStep = 'address' | 'payment' | 'review' | 'confirm';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { formatPrice } = useLocale();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleStepComplete = async (step: CheckoutStep) => {
    try {
      switch (step) {
        case 'address':
          if (!selectedAddress) {
            toast.error('Please select an address');
            return;
          }
          setCurrentStep('payment');
          break;

        case 'payment':
          if (!selectedPaymentMethod) {
            toast.error('Please select a payment method');
            return;
          }
          setCurrentStep('review');
          break;

        case 'review':
          await new Promise(resolve => setTimeout(resolve, 1500));
          clearCart();
          navigate('/checkout/success');
          break;
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white group transition-colors font-heading"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Back to Cart</span>
          </button>
          <h1 className="mt-6 font-elegant text-6xl font-bold text-white tracking-tight">
            Checkout
          </h1>
          <p className="mt-2 text-gray-400 text-lg font-heading font-light">
            Complete your purchase and enjoy exclusive deals!
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <CheckoutProgress currentStep={currentStep} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {currentStep === 'address' && (
              <AddressSection
                selectedAddress={selectedAddress}
                onAddressSelect={setSelectedAddress}
                onComplete={() => handleStepComplete('address')}
              />
            )}

            {currentStep === 'payment' && (
              <PaymentSection
                selectedMethod={selectedPaymentMethod}
                onMethodSelect={setSelectedPaymentMethod}
                onComplete={() => handleStepComplete('payment')}
              />
            )}

            {currentStep === 'review' && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 transform transition-all duration-300 hover:bg-white/[0.15]">
                <h2 className="text-3xl font-elegant font-bold text-white mb-8">
                  Review Order
                </h2>
                
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-6">
                    <h3 className="text-xl font-heading font-medium text-white mb-4">
                      Order Items
                    </h3>
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 mb-4">
                        <div className="relative w-20 h-20">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-600 text-white text-xs rounded-full flex items-center justify-center font-heading">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-elegant text-white font-medium text-lg">
                            {item.name}
                          </h4>
                          {item.size && (
                            <p className="text-gray-400 text-sm font-heading">
                              Size: {item.size}
                            </p>
                          )}
                        </div>
                        <p className="text-white font-mono">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleStepComplete('review')}
                    className="w-full flex items-center justify-center space-x-2 bg-accent-600 text-white py-4 rounded-xl hover:bg-accent-700 transform transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-gray-900 font-heading"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="font-medium">Place Order</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={items}
              total={total}
              formatPrice={formatPrice}
            />

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center space-x-2 text-gray-400 font-heading">
              <Lock className="w-4 h-4" />
              <span className="text-sm">100% Secure Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}