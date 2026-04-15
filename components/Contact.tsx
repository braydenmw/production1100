import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle, Loader2 } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    // Simulate network request
    setTimeout(() => {
      setFormState('success');
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div>
            <h2 className="text-bw-gold font-bold uppercase tracking-widest text-sm mb-2">Get in Touch</h2>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-bw-navy mb-8">Partner with Us</h3>
            <p className="text-gray-600 mb-10 text-lg">
              Start a confidential conversation about your organization's future. Our global team is ready to provide the strategic clarity you need.
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-bw-gold mt-1 mr-4" />
                <div>
                  <h4 className="font-bold text-bw-navy">Global Headquarters</h4>
                  <p className="text-gray-500">
                    100 Bishopsgate<br />
                    London, EC2M 1GT<br />
                    United Kingdom
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-6 w-6 text-bw-gold mr-4" />
                <span className="text-gray-600">+44 20 7123 4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-6 w-6 text-bw-gold mr-4" />
                <span className="text-gray-600">advisory@bw-global.com</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-bw-light p-8 md:p-10 rounded-sm min-h-[400px] flex items-center">
            {formState === 'success' ? (
              <div className="w-full text-center py-12 animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-2xl font-serif font-bold text-bw-navy mb-4">Message Sent</h4>
                <p className="text-gray-600 mb-8">
                  Thank you for contacting ADVERSIQ Intelligence. A member of our executive team will review your inquiry and respond shortly.
                </p>
                <button 
                  onClick={() => setFormState('idle')}
                  className="text-bw-gold font-bold hover:text-bw-navy transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input required type="text" id="firstName" className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-1 focus:ring-bw-gold focus:border-bw-gold outline-none bg-white" placeholder="Jane" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input required type="text" id="lastName" className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-1 focus:ring-bw-gold focus:border-bw-gold outline-none bg-white" placeholder="Doe" />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
                  <input required type="email" id="email" className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-1 focus:ring-bw-gold focus:border-bw-gold outline-none bg-white" placeholder="jane@company.com" />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Inquiry Details</label>
                  <textarea required id="message" rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-1 focus:ring-bw-gold focus:border-bw-gold outline-none bg-white" placeholder="How can we assist you?"></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={formState === 'submitting'}
                  className="w-full bg-bw-navy text-white font-bold py-3 px-6 hover:bg-bw-gold transition-colors duration-300 uppercase tracking-wide flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {formState === 'submitting' ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
