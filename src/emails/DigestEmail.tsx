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

export interface DigestItem {
  title: string;
  sourceUrl: string;
  summaryEn: string; // maps to ContentItem.summary
  developerTakeaway?: string | null;
  topicName: string;
  topicColor: string;
}

interface DigestEmailProps {
  date: string;
  items: DigestItem[];
  unsubscribeUrl: string;
}

export default function DigestEmail({
  date,
  items,
  unsubscribeUrl,
}: DigestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {`${items.length} AI updates worth reading today — ${date}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={heading}>AIInfoHub</Heading>
            <Text style={dateText}>Daily AI Digest · {date}</Text>
          </Section>
          <Hr style={hr} />

          {items.map((item, i) => (
            <Section key={i} style={itemSection}>
              <Text style={topicBadge(item.topicColor)}>{item.topicName}</Text>
              <Heading as="h2" style={itemTitle}>
                <Link href={item.sourceUrl} style={itemTitleLink}>
                  {item.title}
                </Link>
              </Heading>
              <Text style={summary}>{item.summaryEn}</Text>
              {item.developerTakeaway && (
                <Section style={takeawayBox}>
                  <Text style={takeawayLabel}>Developer Takeaway</Text>
                  <Text style={takeawayText}>{item.developerTakeaway}</Text>
                </Section>
              )}
              {i < items.length - 1 && <Hr style={itemHr} />}
            </Section>
          ))}

          <Hr style={hr} />
          <Section style={footerSection}>
            <Button
              href={`${process.env.NEXT_PUBLIC_APP_URL ?? "https://aiinfohub.dev"}`}
              style={ctaButton}
            >
              Read full stories →
            </Button>
            <Text style={footerText}>
              You&apos;re receiving this because you subscribed to AIInfoHub.{" "}
              <Link href={unsubscribeUrl} style={unsubLink}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
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
  maxWidth: "600px",
};

const headerSection: React.CSSProperties = {
  marginBottom: "0",
};

const heading: React.CSSProperties = {
  color: "#15803D",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 4px",
  letterSpacing: "-0.5px",
};

const dateText: React.CSSProperties = {
  color: "#6B7280",
  fontSize: "13px",
  margin: "0",
};

const hr: React.CSSProperties = {
  borderColor: "#E5E7EB",
  margin: "24px 0",
};

const itemHr: React.CSSProperties = {
  borderColor: "#F3F4F6",
  margin: "20px 0",
};

const itemSection: React.CSSProperties = {
  marginBottom: "0",
};

const topicBadge = (color: string): React.CSSProperties => ({
  backgroundColor: `${color}18`,
  borderRadius: "4px",
  color: color,
  display: "inline-block",
  fontSize: "11px",
  fontWeight: "600",
  letterSpacing: "0.05em",
  margin: "0 0 8px",
  padding: "2px 8px",
  textTransform: "uppercase",
});

const itemTitle: React.CSSProperties = {
  color: "#111827",
  fontSize: "18px",
  fontWeight: "600",
  lineHeight: "1.4",
  margin: "0 0 10px",
};

const itemTitleLink: React.CSSProperties = {
  color: "#111827",
  textDecoration: "none",
};

const summary: React.CSSProperties = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 12px",
};

const takeawayBox: React.CSSProperties = {
  borderLeft: "3px solid #15803D",
  paddingLeft: "12px",
  margin: "0 0 4px",
};

const takeawayLabel: React.CSSProperties = {
  color: "#15803D",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  margin: "0 0 4px",
  textTransform: "uppercase",
};

const takeawayText: React.CSSProperties = {
  color: "#374151",
  fontSize: "14px",
  fontStyle: "italic",
  lineHeight: "1.5",
  margin: "0",
};

const footerSection: React.CSSProperties = {
  textAlign: "center",
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#15803D",
  borderRadius: "8px",
  color: "#FFFFFF",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "20px",
  padding: "10px 24px",
  textDecoration: "none",
};

const footerText: React.CSSProperties = {
  color: "#9CA3AF",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0",
};

const unsubLink: React.CSSProperties = {
  color: "#6B7280",
};
