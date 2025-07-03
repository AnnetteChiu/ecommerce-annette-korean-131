
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';
import type { CartItem, CouponDiscount } from '@/types';

interface OrderConfirmationEmailProps {
  customerName: string;
  orderId: string;
  orderDate: string;
  cartItems: CartItem[];
  subtotal: number;
  shipping: number;
  discountAmount: number;
  taxes: number;
  total: number;
  appliedCoupon: { code: string; discount: CouponDiscount } | null;
}

export const OrderConfirmationEmail = ({
  customerName,
  orderId,
  orderDate,
  cartItems,
  subtotal,
  shipping,
  discountAmount,
  taxes,
  total,
  appliedCoupon,
}: OrderConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your CodiStyle Order Confirmation</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Text style={logoText}>CodiStyle</Text>
        </Section>
        <Heading style={h1}>Thank you for your order!</Heading>
        <Text style={text}>
          Hi {customerName}, we're getting your order ready. We'll notify you once it has shipped.
        </Text>

        <Section style={detailsSection}>
          <Column>
            <Text style={detailTitle}>Order ID</Text>
            <Text style={detailValue}>{orderId}</Text>
          </Column>
          <Column>
            <Text style={detailTitle}>Order Date</Text>
            <Text style={detailValue}>{orderDate}</Text>
          </Column>
        </Section>
        
        <Section style={cartSection}>
            <Heading as="h2" style={h2}>Order Summary</Heading>
            {cartItems.map((item) => (
                <Row key={item.id} style={productRow}>
                    <Column style={{ width: '64px' }}>
                        <Img src={item.imageUrl} width="64" height="64" alt={item.name} style={productImage} />
                    </Column>
                    <Column>
                        <Text style={productName}>{item.name}</Text>
                        <Text style={productDetails}>Qty: {item.quantity}</Text>
                    </Column>
                    <Column style={{ textAlign: 'right' }}>
                        <Text style={productPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                    </Column>
                </Row>
            ))}
        </Section>

        <Section style={totalsSection}>
          <Row>
            <Column style={totalsLabel}>Subtotal</Column>
            <Column style={totalsValue}>${subtotal.toFixed(2)}</Column>
          </Row>
          {appliedCoupon && (
            <Row>
                <Column style={totalsLabel}>Discount ({appliedCoupon.code})</Column>
                <Column style={totalsValue}>-${discountAmount.toFixed(2)}</Column>
            </Row>
          )}
          <Row>
            <Column style={totalsLabel}>Shipping</Column>
            <Column style={totalsValue}>{shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free'}</Column>
          </Row>
          <Row>
            <Column style={totalsLabel}>Taxes</Column>
            <Column style={totalsValue}>${taxes.toFixed(2)}</Column>
          </Row>
          <hr style={hr} />
          <Row>
            <Column style={totalsLabelBold}>Total</Column>
            <Column style={totalsValueBold}>${total.toFixed(2)}</Column>
          </Row>
        </Section>
        
        <Text style={footerText}>
          © {new Date().getFullYear()} CodiStyle. All Rights Reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OrderConfirmationEmail;

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

const h2 = {
    color: '#333',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 20px 0',
    padding: '0 20px',
};

const text = {
  color: '#555',
  fontSize: '14px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  padding: '0 40px',
};

const detailsSection = {
    padding: '0 40px',
    margin: '32px 0',
};

const detailTitle = {
    color: '#777',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
};

const detailValue = {
    color: '#333',
    fontSize: '14px',
};

const cartSection = {
    padding: '0 20px',
    margin: '32px 0',
};

const productRow = {
    padding: '10px 0',
    borderBottom: '1px solid #eaeaea',
};

const productImage = {
    borderRadius: '4px',
};

const productName = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    margin: '0 0 4px 0',
};

const productDetails = {
    fontSize: '12px',
    color: '#777',
    margin: 0,
};

const productPrice = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
};


const totalsSection = {
    padding: '0 40px',
    margin: '32px 0',
};

const totalsLabel = {
    fontSize: '14px',
    color: '#555',
};

const totalsValue = {
    fontSize: '14px',
    color: '#555',
    textAlign: 'right' as const,
};

const totalsLabelBold = {
    ...totalsLabel,
    fontWeight: 'bold',
    color: '#333',
};

const totalsValueBold = {
    ...totalsValue,
    fontWeight: 'bold',
    color: '#333',
};

const hr = {
    borderColor: '#eaeaea',
    margin: '20px 0',
};

const footerText = {
  color: '#aaa',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '20px',
};
