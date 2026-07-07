import { createPageMetadata } from "@/lib/metadata";
import { fetchCertificate } from "@/lib/server-api";

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const certificate = await fetchCertificate(id);
    const description =
      certificate.courseTitle ||
      `Level ${certificate.level} certificate path: ${certificate.title}.`;

    return createPageMetadata({
      title: certificate.title,
      description: description.slice(0, 160),
      path: `/certificates/${id}`,
      type: "article",
    });
  } catch {
    return createPageMetadata({
      title: "Certificate",
      description: "Certificate learning path from the UJ AI Club roadmap.",
      path: `/certificates/${id}`,
      noIndex: true,
    });
  }
}

export default function CertificateDetailLayout({ children }) {
  return children;
}
