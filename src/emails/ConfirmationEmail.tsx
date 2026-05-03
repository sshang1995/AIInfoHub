import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ConfirmationEmailProps {
  confirmUrl: string;
}

export default function ConfirmationEmail({
  confirmUrl,
}: ConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirm your AIInfoHub subscription</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>AIInfoHub</Heading>
          <Text style={tagline}>Daily AI Digest for Developers</Text>
          <Hr style={hr} />
          <Section style={section}>
            <Heading as="h2" style={subheading}>
              One click to confirm
            </Heading>
            <Text style={body}>
              You&apos;re almost in. Click the button below to confirm your
              email and start receiving the daily AI digest — curated updates,
              developer takeaways, and emerging trends, delivered every morning.
            </Text>
            <Button href={confirmUrl} style={button}>
              Confirm my subscription
            </Button>
            <Text style={small}>
              Or copy this link into your browser:{" "}
              <Link href={confirmUrl} style={link}>
                {confirmUrl}
              </Link>
            </Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn&apos;t sign up for AIInfoHub, you can safely ignore this
            email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#FAFAF5",
  fontFamily:
    "'Libre Franklin', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const heading: React.CSSProperties = {
  color: "#15803D",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 4px",
  letterSpacing: "-0.5px",
};

const tagline: React.CSSProperties = {
  color: "#6B7280",
  fontSize: "14px",
  margin: "0 0 24px",
};

const hr: React.CSSProperties = {
  borderColor: "#E5E7EB",
  margin: "24px 0",
};

const section: React.CSSProperties = {
  padding: "0",
};

const subheading: React.CSSProperties = {
  color: "#111827",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const body: React.CSSProperties = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 24px",
};

const button: React.CSSProperties = {
  backgroundColor: "#15803D",
  borderRadius: "8px",
  color: "#FFFFFF",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "600",
  padding: "12px 28px",
  textDecoration: "none",
};

const small: React.CSSProperties = {
  color: "#9CA3AF",
  fontSize: "12px",
  margin: "16px 0 0",
  lineHeight: "1.5",
};

const link: React.CSSProperties = {
  color: "#15803D",
  wordBreak: "break-all",
};

const footer: React.CSSProperties = {
  color: "#9CA3AF",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0",
};
