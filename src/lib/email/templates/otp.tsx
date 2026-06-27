import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type OtpEmailProps = {
  appName: string;
  code: string;
  expiresInMinutes: number;
  title: string;
};

export function OtpEmail({ appName, code, expiresInMinutes, title }: OtpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {title}: {code}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>{title}</Heading>
          <Text style={paragraph}>
            Use the verification code below to continue in {appName}. This code expires in{" "}
            {expiresInMinutes} minutes.
          </Text>
          <Section style={codeWrapper}>
            <Text style={codeText}>{code}</Text>
          </Section>
          <Hr style={divider} />
          <Text style={footnote}>
            If you did not request this code, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f5f5f4",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  margin: "0",
  padding: "32px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e7e5e4",
  borderRadius: "16px",
  margin: "0 auto",
  maxWidth: "480px",
  padding: "32px",
};

const heading = {
  color: "#1c1917",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 16px",
};

const paragraph = {
  color: "#44403c",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 24px",
};

const codeWrapper = {
  backgroundColor: "#fafaf9",
  border: "1px solid #e7e5e4",
  borderRadius: "12px",
  margin: "0 0 24px",
  padding: "20px",
  textAlign: "center" as const,
};

const codeText = {
  color: "#1c1917",
  fontSize: "32px",
  fontWeight: "700",
  letterSpacing: "0.4em",
  lineHeight: "1",
  margin: "0",
  textIndent: "0.4em",
};

const divider = {
  borderColor: "#e7e5e4",
  margin: "0 0 24px",
};

const footnote = {
  color: "#78716c",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};
