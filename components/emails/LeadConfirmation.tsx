import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Text,
  Hr,
} from '@react-email/components';

interface LeadConfirmationProps {
  customerName: string;
  category: string;
  companyName: string;
}

export default function LeadConfirmation({
  customerName,
  category,
  companyName,
}: LeadConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Thanks for reaching out!</Heading>
          
          <Text style={text}>
            Hi {customerName},
          </Text>
          
          <Text style={text}>
            We received your request for <strong>{category}</strong> services.
          </Text>
          
          <Text style={text}>
            We'll review your request and get back to you within 24 hours.
          </Text>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            {companyName}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  marginTop: '32px',
};