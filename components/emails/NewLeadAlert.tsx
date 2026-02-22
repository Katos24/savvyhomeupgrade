import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Text,
  Hr,
  Section,
  Button,
} from '@react-email/components';

interface NewLeadAlertProps {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  category: string;
  description: string;
  dashboardUrl: string;
}

export default function NewLeadAlert({
  customerName,
  customerEmail,
  customerPhone,
  category,
  description,
  dashboardUrl,
}: NewLeadAlertProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎯 New Lead Received!</Heading>
          
          <Text style={text}>
            You have a new lead from <strong>{customerName}</strong>
          </Text>
          
          <Section style={box}>
            <Text style={label}>Category:</Text>
            <Text style={value}>{category}</Text>
            
            <Text style={label}>Email:</Text>
            <Text style={value}>{customerEmail}</Text>
            
            <Text style={label}>Phone:</Text>
            <Text style={value}>{customerPhone}</Text>
            
            {description && (
              <>
                <Text style={label}>Description:</Text>
                <Text style={value}>{description}</Text>
              </>
            )}
          </Section>

          <Button style={button} href={dashboardUrl}>
            View in Dashboard
          </Button>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            Lead2Project
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

const box = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 40px',
};

const label = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  margin: '16px 0 4px 0',
  padding: '0',
};

const value = {
  color: '#333',
  fontSize: '16px',
  margin: '0 0 16px 0',
  padding: '0',
};

const button = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  padding: '12px 0',
  margin: '32px auto',
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