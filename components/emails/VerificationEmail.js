// File: components/emails/VerificationEmail.js

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

export const VerificationEmail = ({ userName, verificationUrl }) => (
  <Html>
    <Head />
    <Preview>Verify your email address to get started</Preview>
    <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' }}>
      <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 40px', borderRadius: '8px' }}>
        <Heading style={{ fontSize: '24px' }}>Welcome, {userName}!</Heading>
        <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
          Thank you for registering. Please click the button below to verify your email address and activate your account.
        </Text>
        <Button style={{ backgroundColor: '#007bff', borderRadius: '5px', color: '#fff', fontSize: '16px', textDecoration: 'none', padding: '12px 20px' }} href={verificationUrl}>
          Verify My Email
        </Button>
        <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
          This link is valid for the next 60 minutes.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default VerificationEmail;
