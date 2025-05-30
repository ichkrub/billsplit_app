import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      
      <div className="space-y-8 text-gray-600">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
          <p className="mb-4">
            At BillSplit, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our bill-splitting service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
          <p className="mb-4">
            We collect minimal information to provide our service:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Basic usage data to improve our service</li>
            <li>Email addresses (only when voluntarily provided)</li>
            <li>Bill splitting data (which is not stored permanently)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
          <p className="mb-4">
            We use the collected information to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and improve our bill-splitting service</li>
            <li>Send important updates about our service (if you've subscribed)</li>
            <li>Analyze and improve the user experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
          <p className="mb-4">
            We implement appropriate security measures to protect your information. Bill-splitting data is not permanently stored on our servers, and we use industry-standard encryption for any data in transit.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Analytics</h2>
          <p className="mb-4">
            We use Google Analytics to understand how our service is used. This helps us improve the user experience. You can opt out of Google Analytics by using their browser add-on.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about our Privacy Policy, please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </p>
          <p className="text-sm text-gray-500">
            Last updated: May 30, 2025
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
