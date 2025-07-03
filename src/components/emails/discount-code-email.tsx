import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';
import * as React from 'react';
import type { CouponDiscount } from '@/types';

interface DiscountCodeEmailProps {
  customerName?: string;
  couponCode: string;
  discount: CouponDiscount;
  validUntil?: string;
}

export const DiscountCodeEmail = ({
  customerName = 'valued customer',
  couponCode,
  discount,
  validUntil = 'a limited time',
}: DiscountCodeEmailProps) => {

  const discountValue = discount.type === 'percentage' 
    ? `${discount.value}%` 
    : `$${discount.value.toFixed(2)}`;

  return (
  <Html>
    <Head />
    <Preview>A special discount just for you from CodiStyle!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Text style={logoText}>CodiStyle</Text>
        </Section>
        <Heading style={h1}>A Special Offer, Just For You</Heading>
        <Text style={text}>
          Hi {customerName},
        </Text>
        <Text style={text}>
          As a thank you for being a part of our community, we're excited to offer you a special discount on your next purchase. Use the code below at checkout to save!
        </Text>
        
        <Section style={couponSection}>
          <Text style={couponCodeText}>{couponCode}</Text>
          <Text style={couponDescription}>For {discountValue} off your entire order.</Text>
        </Section>

        <Section style={{ textAlign: 'center' }}>
            <Button
                style={button}
                href={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/`}
                >
                Shop Now
            </Button>
        </Section>
        
        <Text style={footerText}>
          This offer is valid for {validUntil}. Cannot be combined with other offers.
        </Text>
        <Text style={footerText}>
          © {new Date().getFullYear()} CodiStyle. All Rights Reserved.
        </Text>
      </Container>
    </Body>
  </Html>
)};

export default DiscountCodeEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
};

const logoContainer = {
    textAlign: 'center' as const,
    padding: '20px 0',
};

const logoText = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    fontFamily: 'Playfair Display, serif',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
  padding: '0',
};

const text = {
  color: '#555',
  fontSize: '14px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  padding: '0 40px',
};

const couponSection = {
    margin: '32px 0',
    padding: '20px',
    textAlign: 'center' as const,
    backgroundColor: '#f2f2f2',
    border: '2px dashed #cccccc',
};

const couponCodeText = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: '2px',
    margin: '0 0 10px 0',
};

const couponDescription = {
    fontSize: '14px',
    color: '#555',
    margin: 0,
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
  margin: '30px 0',
};

const footerText = {
  color: '#aaa',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '20px',
};
