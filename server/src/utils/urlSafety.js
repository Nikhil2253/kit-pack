import dns from "dns/promises";
import net from "net";

const isPrivateIp = (ip) => {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);

    return (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a === 0
    );
  }

  if (net.isIPv6(ip)) {
    const value = ip.toLowerCase();

    return (
      value === "::1" ||
      value.startsWith("fc") ||
      value.startsWith("fd") ||
      value.startsWith("fe80:")
    );
  }

  return true;
};

export const validateUrlSafety = async (url) => {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are allowed");
  }

  const hostname = parsed.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost")
  ) {
    throw new Error("Private or internal URLs are not allowed");
  }

  const addresses = await dns.lookup(hostname, {
    all: true
  });

  for (const address of addresses) {
    if (isPrivateIp(address.address)) {
      throw new Error("Private or internal URLs are not allowed");
    }
  }

  return true;
};